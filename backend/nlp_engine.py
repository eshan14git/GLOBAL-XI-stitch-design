import os
import re
import joblib
import pandas as pd
import unicodedata

# Dummy display function for notebook compatibility
def display(*args, **kwargs):
    pass

# -------------------------------------------------
# 1. Paths & Model Loading
# -------------------------------------------------
base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, "data")
rf_path = os.path.join(base_dir, "models")

print("Loading Random Forest model and TF-IDF vectorizer...")
rf_model = joblib.load(os.path.join(rf_path, "trained_random_forest.pkl"))
rf_vectorizer = joblib.load(os.path.join(rf_path, "random_forest_tfidf_vectorizer.pkl"))

print("Loading cleaned datasets...")
results_df = pd.read_csv(os.path.join(data_path, "results_clean.csv"))
goalscorers_df = pd.read_csv(os.path.join(data_path, "goalscorers_clean.csv"))
shootouts_df = pd.read_csv(os.path.join(data_path, "shootouts_clean.csv"))
former_names_df = pd.read_csv(os.path.join(data_path, "former_names_clean.csv"))

# Prepare former name lookup
former_names_lookup = former_names_df.copy()
former_names_lookup["start_date"] = pd.to_datetime(former_names_lookup["start_date"])
former_names_lookup["end_date"] = pd.to_datetime(former_names_lookup["end_date"])

# Helper function to generate match keys for indexing
def add_match_key(df):
    temp = df.copy()
    temp["match_key"] = (
        temp["date"].astype(str)
        + "||"
        + temp["home_team"].astype(str)
        + "||"
        + temp["away_team"].astype(str)
    )
    return temp

# Initialize match keys on datasets
shootouts_with_key = add_match_key(shootouts_df)
goalscorers_with_key = add_match_key(goalscorers_df)
results_with_key = add_match_key(results_df)

# Setup entity collections
all_teams = sorted(
    set(results_df["home_team"].dropna().tolist()) |
    set(results_df["away_team"].dropna().tolist())
)

all_tournaments = sorted(
    results_df["tournament"].dropna().unique().tolist()
)

# Overrides
TOURNAMENT_EDITION_YEAR_OVERRIDES = {
    ("African Cup of Nations", "2023"): "2024",
    ("African Cup of Nations", "2021"): "2022",
    ("AFC Asian Cup", "2023"): "2024",
    ("UEFA Euro", "2020"): "2021"
}

# Intents definitions
RESULTS_INTENTS = {
    "away_team_score",
    "home_team_score",
    "match_date",
    "match_location",
    "match_score",
    "match_winner",
    "neutral_status",
    "total_goals",
    "tournament"
}

GOALSCORER_INTENTS = {
    "scorer",
    "goal_minute",
    "own_goal_status",
    "penalty_status"
}

SHOOTOUT_INTENTS = {
    "shootout_winner",
    "first_shooter"
}

DEBUG = False


# --- Function from Cell 9 ---
import unicodedata

def normalize_text(text):
    text = str(text).lower().strip()

    text = unicodedata.normalize("NFKD", text)
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )

    return text

print(normalize_text("Copa América"))
print(normalize_text("Copa America"))


# --- Function from Cell 6 ---
# Cell 5 - Basic intent prediction function

def predict_intent(question):
    question_vector = rf_vectorizer.transform([question])
    prediction = rf_model.predict(question_vector)[0]
    return prediction

test_question = "Who won the 2014 FIFA World Cup Final?"



# --- Function from Cell 10 ---
# Cell 7 - Extract basic entities from a question
# Improved with whole-name matching and longest-name priority

def extract_basic_entities(question):
    question_normalized = normalize_text(question)

    # -------------------------------------------------
    # 1. Find teams using whole-name matching
    # -------------------------------------------------

    # Longest names first:
    # "DR Congo" should be checked before "Congo"
    # "Nigeria" should be checked before "Niger"
    sorted_teams = sorted(
        all_teams,
        key=lambda x: len(normalize_text(x)),
        reverse=True
    )

    found_teams = []

    for team in sorted_teams:
        team_normalized = normalize_text(team)

        pattern = (
            r"(?<!\w)"
            + re.escape(team_normalized)
            + r"(?!\w)"
        )

        if re.search(pattern, question_normalized):

            # Prevent shorter overlapping team names
            overlap = False

            for already_found in found_teams:
                already_normalized = normalize_text(already_found)

                if (
                    team_normalized in already_normalized
                    and team_normalized != already_normalized
                ):
                    overlap = True
                    break

            if not overlap:
                found_teams.append(team)

    # -------------------------------------------------
    # 2. Find year
    # -------------------------------------------------
    year_match = re.search(
        r"\b(18|19|20)\d{2}\b",
        question
    )

    year = year_match.group() if year_match else None

    # -------------------------------------------------
    # 3. Find tournament
    # -------------------------------------------------
    sorted_tournaments = sorted(
        all_tournaments,
        key=lambda x: len(normalize_text(x)),
        reverse=True
    )

    found_tournaments = []

    for tournament in sorted_tournaments:
        tournament_normalized = normalize_text(tournament)

        pattern = (
            r"(?<!\w)"
            + re.escape(tournament_normalized)
            + r"(?!\w)"
        )

        if re.search(pattern, question_normalized):

            overlap = False

            for already_found in found_tournaments:
                already_normalized = normalize_text(already_found)

                if (
                    tournament_normalized in already_normalized
                    and tournament_normalized != already_normalized
                ):
                    overlap = True
                    break

            if not overlap:
                found_tournaments.append(tournament)

    return {
        "teams": found_teams,
        "year": year,
        "tournaments": found_tournaments
    }


# --- Function from Cell 12 ---
# Cell 76 - Detect explicit home/away team constraints

def extract_team_role_constraints(question):
    q = normalize_text(question)

    home_team = None
    away_team = None

    for team in all_teams:
        t = normalize_text(team)

        if f"home team {t}" in q or f"{t} as the home team" in q:
            home_team = team

        if f"away team {t}" in q or f"{t} as the away team" in q:
            away_team = team

    return {
        "home_team": home_team,
        "away_team": away_team
    }


# --- Function from Cell 13 ---
# Cell 78 - Extract exact date from question

def extract_exact_date(question):
    date_match = re.search(
        r"\b(18|19|20)\d{2}-\d{2}-\d{2}\b",
        question
    )

    return date_match.group() if date_match else None


# --- Function from Cell 14 ---
# Cell 9 - Find candidate matches from extracted entities
# Improved with:
# - explicit home/away roles
# - exact-date priority
# - historical/former team-name handling

def find_result_candidates(question):

    # -------------------------------------------------
    # 0. Resolve historical team names
    # -------------------------------------------------
    resolved_question, historical_constraints = (
        resolve_former_team_names(question)
    )

    # Extract entities from the resolved question
    entities = extract_basic_entities(resolved_question)

    candidates = results_df.copy()

    teams = entities["teams"]
    year = entities["year"]
    tournaments = entities["tournaments"]

    # -------------------------------------------------
    # 1. Filter by two detected teams
    # -------------------------------------------------
    if len(teams) >= 2:
        team1, team2 = teams[:2]

        candidates = candidates[
            (
                (candidates["home_team"] == team1) &
                (candidates["away_team"] == team2)
            )
            |
            (
                (candidates["home_team"] == team2) &
                (candidates["away_team"] == team1)
            )
        ]

    # -------------------------------------------------
    # 2. Apply explicit home/away team constraints
    # -------------------------------------------------
    roles = extract_team_role_constraints(resolved_question)

    if roles["home_team"]:
        candidates = candidates[
            candidates["home_team"] == roles["home_team"]
        ]

    if roles["away_team"]:
        candidates = candidates[
            candidates["away_team"] == roles["away_team"]
        ]

    # -------------------------------------------------
    # 3. Exact date first, otherwise year
    # -------------------------------------------------
    exact_date = extract_exact_date(resolved_question)

    if exact_date:
        candidates = candidates[
            candidates["date"].astype(str) == exact_date
        ]

    elif year:
        candidates = candidates[
            candidates["date"]
            .astype(str)
            .str.startswith(year)
        ]

    # -------------------------------------------------
    # 4. Filter by tournament
    # -------------------------------------------------
    if tournaments:
        tournament = tournaments[0]

        candidates = candidates[
            candidates["tournament"]
            .str.lower()
            == tournament.lower()
        ]

    # -------------------------------------------------
    # 5. Apply historical-name validity periods
    # -------------------------------------------------
    if historical_constraints:

        candidate_dates = pd.to_datetime(
            candidates["date"],
            errors="coerce"
        )

        for constraint in historical_constraints:

            start_date = constraint["start_date"]
            end_date = constraint["end_date"]

            candidates = candidates[
                (candidate_dates >= start_date) &
                (candidate_dates <= end_date)
            ]

            # Rebuild dates after filtering
            candidate_dates = pd.to_datetime(
                candidates["date"],
                errors="coerce"
            )

    # -------------------------------------------------
    # 6. Filter by explicit stage keywords (New)
    # -------------------------------------------------
    q_norm = normalize_text(question)
    stage_match = None
    if "final" in q_norm:
        stage_match = "Final"
    elif "semi" in q_norm:
        stage_match = "Semifinal"
    elif "quarter" in q_norm:
        stage_match = "Quarterfinal"
    elif "round of 16" in q_norm or "last 16" in q_norm:
        stage_match = "Round of 16"
    elif "round of 32" in q_norm:
        stage_match = "Round of 32"
    elif "third place" in q_norm:
        stage_match = "Third-place playoff"

    if stage_match and not candidates.empty:
        # Filter candidates by inferred knockout stage
        inferred_stages = candidates.apply(infer_knockout_stage, axis=1)
        stage_candidates = candidates[inferred_stages == stage_match]
        if not stage_candidates.empty:
            candidates = stage_candidates

    # -------------------------------------------------
    # 7. Prioritize competitive matches over friendlies (New)
    # -------------------------------------------------
    if not candidates.empty and len(candidates) > 1:
        competitive_matches = candidates[candidates["tournament"] != "Friendly"]
        if not competitive_matches.empty:
            candidates = competitive_matches

    return candidates


# --- Function from Cell 15 ---
# Cell 90 - Detect historical/former team names

def detect_former_team_names(question):
    q = normalize_text(question)

    matches = []

    # Longest names first to avoid partial-name conflicts
    rows = former_names_lookup.copy()

    rows["former_length"] = (
        rows["former"]
        .astype(str)
        .str.len()
    )

    rows = rows.sort_values(
        "former_length",
        ascending=False
    )

    for _, row in rows.iterrows():
        former = str(row["former"])
        former_normalized = normalize_text(former)

        pattern = (
            r"(?<!\w)"
            + re.escape(former_normalized)
            + r"(?!\w)"
        )

        if re.search(pattern, q):
            matches.append({
                "former": former,
                "current": row["current"],
                "start_date": row["start_date"],
                "end_date": row["end_date"]
            })

    return matches


# --- Function from Cell 16 ---
# Cell 92 - Resolve former team names for dataset searching
# Improved with accent-insensitive replacement

def resolve_former_team_names(question):
    detected = detect_former_team_names(question)

    resolved_question = question
    historical_constraints = []

    for item in detected:
        former = item["former"]
        current = item["current"]

        # -------------------------------------------------
        # Accent-insensitive historical-name replacement
        # -------------------------------------------------
        words = resolved_question.split()

        former_normalized = normalize_text(former)

        # Try progressively sized word sequences
        former_word_count = len(former.split())

        for i in range(len(words) - former_word_count + 1):

            phrase = " ".join(
                words[i:i + former_word_count]
            )

            # Remove surrounding punctuation for comparison
            phrase_clean = re.sub(
                r"^[^\w]+|[^\w]+$",
                "",
                phrase
            )

            if normalize_text(phrase_clean) == former_normalized:

                # Preserve punctuation surrounding the phrase
                pattern = re.escape(phrase)

                resolved_question = re.sub(
                    pattern,
                    current,
                    resolved_question,
                    count=1,
                    flags=re.IGNORECASE
                )

                break

        # Preserve historical validity period
        historical_constraints.append({
            "former": former,
            "current": current,
            "start_date": item["start_date"],
            "end_date": item["end_date"]
        })

    return resolved_question, historical_constraints


# --- Function from Cell 19 ---
# Cell 11 - Inspect differences between candidate matches

def inspect_candidate_differences(candidates):
    if len(candidates) <= 1:
        return {}

    differences = {}

    fields = [
        "date",
        "tournament",
        "city",
        "country",
        "home_team",
        "away_team",
        "home_score",
        "away_score",
        "neutral"
    ]

    for field in fields:
        unique_values = candidates[field].dropna().astype(str).unique().tolist()

        if len(unique_values) > 1:
            differences[field] = unique_values

    return differences


# --- Function from Cell 21 ---
# Cell 13 - Generate a clarification question

def generate_clarification_question(candidates):
    if len(candidates) == 0:
        return "I couldn't find a matching game."

    if len(candidates) == 1:
        return None

    differences = inspect_candidate_differences(candidates)

    # Prefer tournament when tournaments differ
    if "tournament" in differences:
        options = differences["tournament"]
        return (
            "I found multiple matching games. "
            "Do you remember the tournament? "
            + "Options: "
            + ", ".join(options)
        )

    # Then country/location
    if "country" in differences:
        options = differences["country"]
        return (
            "I found multiple matching games. "
            "Do you remember which country the game was played in? "
            + "Options: "
            + ", ".join(options)
        )

    # Then city
    if "city" in differences:
        options = differences["city"]
        return (
            "I found multiple matching games. "
            "Do you remember the city? "
            + "Options: "
            + ", ".join(options)
        )

    # Then home team
    if "home_team" in differences:
        options = differences["home_team"]
        return (
            "I found multiple matching games. "
            "Do you remember which team was the home team? "
            + "Options: "
            + ", ".join(options)
        )

    # Then exact date only as a last resort
    if "date" in differences:
        options = differences["date"]
        return (
            "I found multiple matching games. "
            "Do you remember which date it was? "
            + "Options: "
            + ", ".join(options)
        )

    return (
        "I found multiple matching games, but I need one more detail "
        "to identify the correct one."
    )


# --- Function from Cell 24 ---
# Cell 15 - Apply a clarification reply to existing candidates

def apply_clarification(candidates, reply):
    reply_lower = reply.lower().strip()

    filtered = candidates.copy()

    # Year
    year_match = re.search(r"\b(18|19|20)\d{2}\b", reply)
    if year_match:
        year = year_match.group()
        filtered = filtered[
            filtered["date"].astype(str).str.startswith(year)
        ]

    # Tournament
    tournament_matches = [
        tournament
        for tournament in filtered["tournament"].dropna().unique()
        if tournament.lower() in reply_lower
    ]

    if tournament_matches:
        tournament = tournament_matches[0]
        filtered = filtered[
            filtered["tournament"].str.lower() == tournament.lower()
        ]

    # Country
    country_matches = [
        country
        for country in filtered["country"].dropna().unique()
        if str(country).lower() in reply_lower
    ]

    if country_matches:
        country = country_matches[0]
        filtered = filtered[
            filtered["country"].astype(str).str.lower() == str(country).lower()
        ]

    # City
    city_matches = [
        city
        for city in filtered["city"].dropna().unique()
        if str(city).lower() in reply_lower
    ]

    if city_matches:
        city = city_matches[0]
        filtered = filtered[
            filtered["city"].astype(str).str.lower() == str(city).lower()
        ]

    # Home team
    home_team_matches = [
        team
        for team in filtered["home_team"].dropna().unique()
        if str(team).lower() in reply_lower
    ]

    if home_team_matches:
        team = home_team_matches[0]
        filtered = filtered[
            filtered["home_team"].astype(str).str.lower() == str(team).lower()
        ]

    return filtered


# --- Function from Cell 28 ---
# Cell 21 - Smarter clarification generator

def generate_smart_clarification(candidates):
    if len(candidates) == 0:
        return "I couldn't find a matching game."

    if len(candidates) == 1:
        return None

    # Build useful derived fields
    temp = candidates.copy()
    temp["year"] = temp["date"].astype(str).str[:4]

    # 1. Prefer year if multiple years remain
    years = sorted(temp["year"].dropna().unique().tolist())

    if len(years) > 1:
        # Avoid dumping too many options
        if len(years) <= 8:
            return (
                "I found matches from multiple years. "
                "Do you remember the year? "
                f"Options: {', '.join(years)}"
            )

        return (
            f"I found matches across {len(years)} different years. "
            "Do you remember roughly which year it was?"
        )

    # 2. Tournament
    tournaments = sorted(
        temp["tournament"].dropna().astype(str).unique().tolist()
    )

    if len(tournaments) > 1:
        if len(tournaments) <= 8:
            return (
                "I found more than one possible match. "
                "Do you remember the tournament? "
                f"Options: {', '.join(tournaments)}"
            )

        return (
            "I found matches from several tournaments. "
            "Do you remember which competition it was?"
        )

    # 3. Country
    countries = sorted(
        temp["country"].dropna().astype(str).unique().tolist()
    )

    if len(countries) > 1:
        return (
            "Do you remember which country the match was played in? "
            f"Options: {', '.join(countries)}"
        )

    # 4. City
    cities = sorted(
        temp["city"].dropna().astype(str).unique().tolist()
    )

    if len(cities) > 1:
        return (
            "Do you remember the city where the match was played? "
            f"Options: {', '.join(cities)}"
        )

    # 5. Home team
    home_teams = sorted(
        temp["home_team"].dropna().astype(str).unique().tolist()
    )

    if len(home_teams) > 1:
        return (
            "Do you remember which team was listed as the home team? "
            f"Options: {', '.join(home_teams)}"
        )

    # 6. Exact date only as a last resort
    dates = sorted(
        temp["date"].dropna().astype(str).unique().tolist()
    )

    if len(dates) > 1:
        return (
            "I still found more than one possible match. "
            "Do you remember the exact date? "
            f"Options: {', '.join(dates)}"
        )

    return (
        "I still found multiple matching records. "
        "Can you give me one more detail about the match?"
    )


# --- Function from Cell 30 ---
# Improved natural clarification filtering
# with accent normalization and exact-date priority

def apply_smart_clarification(candidates, reply):
    reply_normalized = normalize_text(reply)
    filtered = candidates.copy()

    # -------------------------------------------------
    # 0. EXACT DATE - MUST COME BEFORE YEAR
    # -------------------------------------------------
    exact_date = extract_exact_date(reply)

    if exact_date:
        candidate_dates = pd.to_datetime(
            filtered["date"],
            errors="coerce"
        ).dt.strftime("%Y-%m-%d")

        date_filtered = filtered[
            candidate_dates == exact_date
        ]

        if not date_filtered.empty:
            return date_filtered

    # -------------------------------------------------
    # 1. YEAR
    # -------------------------------------------------
    year_match = re.search(
        r"\b(18|19|20)\d{2}\b",
        reply
    )

    if year_match:
        year = year_match.group()

        candidate_years = pd.to_datetime(
            filtered["date"],
            errors="coerce"
        ).dt.strftime("%Y")

        year_filtered = filtered[
            candidate_years == year
        ]

        if not year_filtered.empty:
            return year_filtered

    # -------------------------------------------------
    # 2. EXACT / NATURAL TOURNAMENT MATCH
    # -------------------------------------------------
    tournaments = (
        filtered["tournament"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    for tournament in tournaments:
        tournament_normalized = normalize_text(tournament)

        if tournament_normalized in reply_normalized:
            tournament_filtered = filtered[
                filtered["tournament"]
                .apply(normalize_text)
                == tournament_normalized
            ]

            if not tournament_filtered.empty:
                return tournament_filtered

    # -------------------------------------------------
    # 3. PARTIAL TOURNAMENT MATCH
    # -------------------------------------------------
    meaningful_words = [
        word
        for word in re.findall(
            r"[a-zA-Z]+",
            reply_normalized
        )
        if len(word) >= 4
    ]

    if meaningful_words:
        tournament_mask = (
            filtered["tournament"]
            .fillna("")
            .apply(
                lambda value: all(
                    word in normalize_text(value)
                    for word in meaningful_words
                )
            )
        )

        tournament_filtered = filtered[
            tournament_mask
        ]

        if not tournament_filtered.empty:
            return tournament_filtered

    # -------------------------------------------------
    # 4. COUNTRY
    # -------------------------------------------------
    countries = (
        filtered["country"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    for country in countries:
        country_normalized = normalize_text(country)

        if country_normalized in reply_normalized:
            country_filtered = filtered[
                filtered["country"]
                .apply(normalize_text)
                == country_normalized
            ]

            if not country_filtered.empty:
                return country_filtered

    # -------------------------------------------------
    # 5. CITY
    # -------------------------------------------------
    cities = (
        filtered["city"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    for city in cities:
        city_normalized = normalize_text(city)

        if city_normalized in reply_normalized:
            city_filtered = filtered[
                filtered["city"]
                .apply(normalize_text)
                == city_normalized
            ]

            if not city_filtered.empty:
                return city_filtered

    # -------------------------------------------------
    # 6. HOME TEAM
    # -------------------------------------------------
    if "home" in reply_normalized:
        home_teams = (
            filtered["home_team"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        for team in home_teams:
            team_normalized = normalize_text(team)

            if team_normalized in reply_normalized:
                home_filtered = filtered[
                    filtered["home_team"]
                    .apply(normalize_text)
                    == team_normalized
                ]

                if not home_filtered.empty:
                    return home_filtered

    # -------------------------------------------------
    # Nothing understood
    # -------------------------------------------------
    return filtered


# --- Function from Cell 34 ---
# Cell 79 - Detect year in clarification reply

def extract_year_from_reply(reply):
    year_match = re.search(
        r"\b(18|19|20)\d{2}\b",
        str(reply)
    )

    return year_match.group() if year_match else None


# --- Function from Cell 38 ---
all_scorers = sorted(
    goalscorers_df["scorer"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
)

def add_match_key(df):
    temp = df.copy()

    temp["match_key"] = (
        temp["date"].astype(str)
        + "||"
        + temp["home_team"].astype(str)
        + "||"
        + temp["away_team"].astype(str)
    )

    return temp

goalscorers_with_key = add_match_key(goalscorers_df)
results_with_key = add_match_key(results_df)



# --- Function from Cell 39 ---
def extract_goalscorer_entities(question):
    question_normalized = normalize_text(question)

    found_teams = [
        team
        for team in all_teams
        if normalize_text(team) in question_normalized
    ]

    found_players = [
        player
        for player in all_scorers
        if normalize_text(player) in question_normalized
    ]

    year_match = re.search(r"\b(18|19|20)\d{2}\b", question)
    year = year_match.group() if year_match else None

    return {
        "teams": found_teams,
        "players": found_players,
        "year": year
    }


# --- Function from Cell 40 ---
# Cell 35 - Detect the scoring team from phrases like "for Paraguay"

def extract_scoring_team(question):
    question_normalized = normalize_text(question)

    # Look for patterns like:
    # "scored for Paraguay"
    # "goalscorer for Argentina"
    # "goal for Brazil"
    for team in all_teams:
        team_normalized = normalize_text(team)

        patterns = [
            f"for {team_normalized}",
            f"by {team_normalized}"
        ]

        if any(pattern in question_normalized for pattern in patterns):
            return team

    return None


# --- Function from Cell 41 ---
# Cell 36 - Improved goalscorer candidate retrieval

def find_goalscorer_candidates(question):
    entities = extract_goalscorer_entities(question)

    candidates = goalscorers_with_key.copy()

    teams = entities["teams"]
    players = entities["players"]
    year = entities["year"]

    # -------------------------------------------------
    # 1. PLAYER FILTER
    # -------------------------------------------------
    if players:
        player = players[0]

        candidates = candidates[
            candidates["scorer"] == player
        ]

    # -------------------------------------------------
    # 2. TEAM / OPPONENT FILTERING
    # -------------------------------------------------

    # Two teams explicitly mentioned
    if len(teams) >= 2:
        team1, team2 = teams[:2]

        candidates = candidates[
            (
                (candidates["home_team"] == team1)
                & (candidates["away_team"] == team2)
            )
            |
            (
                (candidates["home_team"] == team2)
                & (candidates["away_team"] == team1)
            )
        ]

    # Only one team mentioned + player mentioned
    # Treat the team as the opponent/match participant
    elif len(teams) == 1 and players:
        mentioned_team = teams[0]

        candidates = candidates[
            (candidates["home_team"] == mentioned_team)
            |
            (candidates["away_team"] == mentioned_team)
        ]

    # -------------------------------------------------
    # 3. YEAR
    # -------------------------------------------------
    if year:
        candidates = candidates[
            candidates["date"].astype(str).str.startswith(year)
        ]

    # -------------------------------------------------
    # 4. SCORING TEAM
    # For wording like "scored for Paraguay"
    # -------------------------------------------------
    scoring_team = extract_scoring_team(question)

    if scoring_team:
        candidates = candidates[
            candidates["team"] == scoring_team
        ]

    return candidates


# --- Function from Cell 46 ---
# Cell 38 - Group goal events by unique match

def get_unique_goal_matches(candidates):
    return (
        candidates[
            [
                "match_key",
                "date",
                "home_team",
                "away_team"
            ]
        ]
        .drop_duplicates()
        .sort_values("date")
    )


question = "Which player scored for Paraguay against Chile?"

candidates = find_goalscorer_candidates(question)
unique_goal_matches = get_unique_goal_matches(candidates)


display(unique_goal_matches.head(20))


# --- Function from Cell 47 ---
# Cell 39 - Enrich scorer match candidates with results data

def enrich_goal_matches(unique_matches):
    return unique_matches.merge(
        results_with_key[
            [
                "match_key",
                "home_score",
                "away_score",
                "tournament",
                "city",
                "country",
                "neutral"
            ]
        ],
        on="match_key",
        how="left"
    )


enriched_goal_matches = enrich_goal_matches(unique_goal_matches)


display(
    enriched_goal_matches[
        [
            "date",
            "home_team",
            "away_team",
            "home_score",
            "away_score",
            "tournament",
            "city",
            "country"
        ]
    ].head(20)
)


# --- Function from Cell 48 ---
# Cell 40 - Clarification for scorer match candidates

def generate_goal_match_clarification(enriched_matches):
    if len(enriched_matches) == 0:
        return "I couldn't find a matching game."

    if len(enriched_matches) == 1:
        return None

    return generate_smart_clarification(enriched_matches)


# --- Function from Cell 49 ---
# Cell 41 - Apply clarification to enriched scorer matches

def apply_goal_match_clarification(enriched_matches, reply):
    return apply_smart_clarification(
        enriched_matches,
        reply
    )


# --- Function from Cell 53 ---
# Convert goal minutes to natural ordinal form
# 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 21 -> 21st, etc.

def format_ordinal_minute(minute):
    minute = str(minute).strip()

    # Handle stoppage time such as 90+1
    if "+" in minute:
        return minute

    try:
        number = int(float(minute))
    except ValueError:
        return minute

    if 10 <= number % 100 <= 20:
        suffix = "th"
    else:
        suffix = {
            1: "st",
            2: "nd",
            3: "rd"
        }.get(number % 10, "th")

    return f"{number}{suffix}"


# --- Function from Cell 54 ---
# Cell 45 - Generate answers for goalscorer-based intents
# Improved multiple-goal handling + natural ordinal minutes

def generate_goalscorer_answer(intent, goal_events):
    if goal_events.empty:
        return "I couldn't find a matching goal record."

    home_team = goal_events.iloc[0]["home_team"]
    away_team = goal_events.iloc[0]["away_team"]
    date = goal_events.iloc[0]["date"]

    # -------------------------------------------------
    # SCORER
    # -------------------------------------------------
    if intent == "scorer":
        scorers = (
            goal_events["scorer"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        if len(scorers) == 1:
            return (
                f"{scorers[0]} scored in the "
                f"{home_team} vs {away_team} match on {date}."
            )

        return (
            f"The scorers were {', '.join(scorers)} "
            f"in the {home_team} vs {away_team} match on {date}."
        )

    # -------------------------------------------------
    # GOAL MINUTE
    # Improved for braces / hat-tricks / multiple goals
    # + correct ordinal formatting
    # -------------------------------------------------
    elif intent == "goal_minute":

        scorer_minutes = {}

        for _, row in goal_events.iterrows():
            scorer = str(row["scorer"])
            minute = format_ordinal_minute(row["minute"])

            if scorer not in scorer_minutes:
                scorer_minutes[scorer] = []

            scorer_minutes[scorer].append(minute)

        details = []

        for scorer, minutes in scorer_minutes.items():

            # One goal
            if len(minutes) == 1:
                details.append(
                    f"{scorer} scored in the {minutes[0]} minute"
                )

            # Two goals
            elif len(minutes) == 2:
                details.append(
                    f"{scorer} scored in the "
                    f"{minutes[0]} and {minutes[1]} minutes"
                )

            # Three or more goals
            else:
                minute_text = (
                    ", ".join(minutes[:-1])
                    + f", and {minutes[-1]}"
                )

                details.append(
                    f"{scorer} scored in the "
                    f"{minute_text} minutes"
                )

        return "; ".join(details) + "."

    # -------------------------------------------------
    # OWN GOAL STATUS
    # -------------------------------------------------
    elif intent == "own_goal_status":
        details = []

        for _, row in goal_events.iterrows():
            status = (
                "was"
                if bool(row["own_goal"])
                else "was not"
            )

            details.append(
                f"{row['scorer']}'s goal "
                f"{status} an own goal"
            )

        return "; ".join(details) + "."

    # -------------------------------------------------
    # PENALTY STATUS
    # -------------------------------------------------
    elif intent == "penalty_status":
        details = []

        for _, row in goal_events.iterrows():
            status = (
                "was"
                if bool(row["penalty"])
                else "was not"
            )

            details.append(
                f"{row['scorer']}'s goal "
                f"{status} a penalty"
            )

        return "; ".join(details) + "."

    # -------------------------------------------------
    # FALLBACK
    # -------------------------------------------------
    return (
        "Answer generation for this intent "
        "is not available yet."
    )


# --- Function from Cell 65 ---
# Cell 54 - Extract entities for shootout questions

def extract_shootout_entities(question):
    question_normalized = normalize_text(question)

    found_teams = [
        team
        for team in all_teams
        if normalize_text(team) in question_normalized
    ]

    year_match = re.search(
        r"\b(18|19|20)\d{2}\b",
        question
    )

    year = year_match.group() if year_match else None

    return {
        "teams": found_teams,
        "year": year
    }


# --- Function from Cell 66 ---
# Cell 55 - Find shootout candidates

def find_shootout_candidates(question):
    entities = extract_shootout_entities(question)

    candidates = shootouts_with_key.copy()

    teams = entities["teams"]
    year = entities["year"]

    # Two teams mentioned
    if len(teams) >= 2:
        team1, team2 = teams[:2]

        candidates = candidates[
            (
                (candidates["home_team"] == team1)
                & (candidates["away_team"] == team2)
            )
            |
            (
                (candidates["home_team"] == team2)
                & (candidates["away_team"] == team1)
            )
        ]

    # Year
    if year:
        candidates = candidates[
            candidates["date"]
            .astype(str)
            .str.startswith(year)
        ]

    return candidates


# --- Function from Cell 68 ---
# Cell 57 - Enrich shootout records with results data

def enrich_shootout_matches(shootout_candidates):
    return shootout_candidates.merge(
        results_with_key[
            [
                "match_key",
                "home_score",
                "away_score",
                "tournament",
                "city",
                "country",
                "neutral"
            ]
        ],
        on="match_key",
        how="left"
    )


# --- Function from Cell 70 ---
# Cell 58 - Generate answers for shootout intents

def generate_shootout_answer(intent, row):
    home_team = row["home_team"]
    away_team = row["away_team"]
    date = row["date"]

    if intent == "shootout_winner":
        winner = row["winner"]

        return (
            f"{winner} won the penalty shootout "
            f"between {home_team} and {away_team} on {date}."
        )

    elif intent == "first_shooter":
        first_shooter = row["first_shooter"]

        if pd.isna(first_shooter) or str(first_shooter).strip().lower() == "unknown":
            return (
                f"The first shooter is not recorded for the "
                f"{home_team} vs {away_team} shootout on {date}."
            )

        return (
            f"{first_shooter} took the first penalty in the "
            f"{home_team} vs {away_team} shootout on {date}."
        )

    return "Answer generation for this shootout intent is not available yet."


# --- Function from Cell 75 ---
# Cell 62 - Smart clarification for shootout candidates

def generate_shootout_clarification(enriched_shootouts):
    if len(enriched_shootouts) == 0:
        return "I couldn't find a matching shootout."

    if len(enriched_shootouts) == 1:
        return None

    return generate_smart_clarification(enriched_shootouts)


# --- Function from Cell 76 ---
# Cell 63 - Apply clarification to shootout candidates

def apply_shootout_clarification(enriched_shootouts, reply):
    return apply_smart_clarification(
        enriched_shootouts,
        reply
    )


# --- Function from Cell 80 ---
# Cell 67 - Supported major international tournaments

SUPPORTED_MAJOR_TOURNAMENTS = {
    # FIFA World Cup
    "world cup": "FIFA World Cup",
    "worldcup": "FIFA World Cup",
    "worldcup": "FIFA World Cup",
    "fifa worldcup": "FIFA World Cup",

    # UEFA European Championship
    "euro": "UEFA Euro",
    "euros": "UEFA Euro",
    "european championship": "UEFA Euro",
    "uefa euro": "UEFA Euro",

    # Copa América
    "copa america": "Copa América",
    "copa américa": "Copa América",

    # Africa Cup of Nations
    "afcon": "African Cup of Nations",
    "africa cup of nations": "African Cup of Nations",
    "african cup of nations": "African Cup of Nations",

    # AFC Asian Cup
    "asian cup": "AFC Asian Cup",
    "afc asian cup": "AFC Asian Cup",

    # CONCACAF Gold Cup
    "gold cup": "Gold Cup",
    "concacaf gold cup": "Gold Cup",

    # OFC / Oceania Nations Cup
    "ofc nations cup": "Oceania Nations Cup",
    "oceania nations cup": "Oceania Nations Cup",

    # UEFA Nations League
    "uefa nations league": "UEFA Nations League",

    # CONCACAF Nations League
    "concacaf nations league": "CONCACAF Nations League"
}


for alias, tournament in SUPPORTED_MAJOR_TOURNAMENTS.items():
    print(f"{alias} -> {tournament}")


# --- Function from Cell 82 ---
# Cell 68 - Detect major tournament from user question

def detect_major_tournament(question):
    question_normalized = normalize_text(question)

    # Longest aliases first so specific names such as
    # "concacaf gold cup" are checked before "gold cup"
    aliases = sorted(
        SUPPORTED_MAJOR_TOURNAMENTS.keys(),
        key=len,
        reverse=True
    )

    for alias in aliases:
        if normalize_text(alias) in question_normalized:
            return SUPPORTED_MAJOR_TOURNAMENTS[alias]

    return None


# --- Function from Cell 109 ---
# Cell 83 - Find major tournament final with edition-year handling

def find_tournament_final(question):
    question_normalized = normalize_text(question)

    tournament = detect_major_tournament(question)

    if tournament is None:
        return None, "I couldn't identify a supported major tournament."

    # Extract edition year mentioned by user
    year_match = re.search(r"\b(18|19|20)\d{2}\b", question)

    if not year_match:
        return None, "I couldn't identify the tournament year."

    edition_year = year_match.group()



    # Check whether this edition was actually played
    # in a different calendar year
    actual_year = TOURNAMENT_EDITION_YEAR_OVERRIDES.get(
        (tournament, edition_year),
        edition_year
    )

    edition_matches = results_df[
        (results_df["tournament"] == tournament)
        &
        (
            results_df["date"]
            .astype(str)
            .str.startswith(actual_year)
        )
    ].copy()

    if edition_matches.empty:
        return None, (
            f"I couldn't find {tournament} matches for the "
            f"{edition_year} edition."
        )

    edition_matches = edition_matches.sort_values("date")

    # Latest chronological match = inferred final
    final_match = edition_matches.iloc[-1]

    return final_match, None


# --- Function from Cell 87 ---
# Cell 71 - Resolve winner of an inferred tournament final

def resolve_final_winner(final_match):
    home_team = final_match["home_team"]
    away_team = final_match["away_team"]
    home_score = final_match["home_score"]
    away_score = final_match["away_score"]
    date = str(final_match["date"])
    tournament = final_match["tournament"]

    # Normal win
    if home_score > away_score:
        return (
            f"{home_team} won the {tournament} final "
            f"{home_score}-{away_score} against {away_team}."
        )

    if away_score > home_score:
        return (
            f"{away_team} won the {tournament} final "
            f"{away_score}-{home_score} against {home_team}."
        )

    # Tied score -> check shootout dataset
    shootout_match = shootouts_df[
        (shootouts_df["date"].astype(str) == date)
        &
        (
            (
                (shootouts_df["home_team"] == home_team)
                &
                (shootouts_df["away_team"] == away_team)
            )
            |
            (
                (shootouts_df["home_team"] == away_team)
                &
                (shootouts_df["away_team"] == home_team)
            )
        )
    ]

    if not shootout_match.empty:
        shootout_winner = shootout_match.iloc[0]["winner"]

        return (
            f"{shootout_winner} won the {tournament} final on penalties "
            f"after a {home_score}-{away_score} draw between "
            f"{home_team} and {away_team}."
        )

    # Genuine draw / no shootout record
    return (
        f"The {tournament} match between {home_team} and {away_team} "
        f"ended {home_score}-{away_score}, and no shootout record was found."
    )


# --- Function from Cell 89 ---
# Detect tournament champion / winner questions

def is_tournament_winner_question(question):
    q = normalize_text(question)

    winner_phrases = [
        "who won",
        "winner",
        "champion",
        "champions",
        "who became champion",
        "who were champions"
    ]

    return any(
        phrase in q
        for phrase in winner_phrases
    )


# --- Function from Cell 91 ---
# Cell 84 - Detect ambiguous generic Nations League references

def detect_generic_nations_league(question):
    q = normalize_text(question)

    if "nations league" not in q:
        return False

    # Already specific, so not ambiguous
    if "uefa nations league" in q:
        return False

    if "concacaf nations league" in q:
        return False

    return True


# --- Function from Cell 92 ---
# Infer whether a generic "Nations League" question
# refers to UEFA or CONCACAF based on the teams mentioned

UEFA_NATIONS_LEAGUE_TEAMS = set(
    results_df[
        results_df["tournament"] == "UEFA Nations League"
    ]["home_team"].dropna().tolist()
    +
    results_df[
        results_df["tournament"] == "UEFA Nations League"
    ]["away_team"].dropna().tolist()
)

CONCACAF_NATIONS_LEAGUE_TEAMS = set(
    results_df[
        results_df["tournament"] == "CONCACAF Nations League"
    ]["home_team"].dropna().tolist()
    +
    results_df[
        results_df["tournament"] == "CONCACAF Nations League"
    ]["away_team"].dropna().tolist()
)


def infer_nations_league_from_teams(question):
    # Only apply this to generic "Nations League" wording
    if not detect_generic_nations_league(question):
        return None

    entities = extract_basic_entities(question)
    teams = entities["teams"]

    if not teams:
        return None

    uefa_matches = [
        team
        for team in teams
        if team in UEFA_NATIONS_LEAGUE_TEAMS
    ]

    concacaf_matches = [
        team
        for team in teams
        if team in CONCACAF_NATIONS_LEAGUE_TEAMS
    ]

    # Teams clearly point to UEFA
    if uefa_matches and not concacaf_matches:
        return "UEFA Nations League"

    # Teams clearly point to CONCACAF
    if concacaf_matches and not uefa_matches:
        return "CONCACAF Nations League"

    # Still ambiguous
    return None


# --- Function from Cell 143 ---
# Improved recent-form / last-N-match detector

def detect_recent_form_question(question):
    q = normalize_text(question)

    patterns = [
        # last 5 matches / last 5 international matches / last 10 games
        r"\blast\s+\d+\s+(?:international\s+)?(?:matches|games)\b",

        # last five matches / last five international games
        r"\blast\s+(?:one|two|three|four|five|six|seven|eight|nine|ten)\s+"
        r"(?:international\s+)?(?:matches|games)\b",

        # recent matches / recent international matches
        r"\brecent\s+(?:international\s+)?(?:matches|games)\b",

        # recent form / current form
        r"\b(?:recent|current)\s+form\b",

        # form in the last 5 games
        r"\bform\s+(?:in|over)\s+the\s+last\b"
    ]

    return any(
        re.search(pattern, q)
        for pattern in patterns
    )


# --- Function from Cell 145 ---
# Extract team and requested number of recent matches

def extract_recent_form_request(question):
    entities = extract_basic_entities(question)

    teams = entities["teams"]
    team = teams[0] if teams else None

    # Default = 5
    match_count = 5

    number_match = re.search(
        r"\blast\s+(\d+)\b",
        normalize_text(question)
    )

    if number_match:
        match_count = int(number_match.group(1))

    # Keep it reasonable
    match_count = max(1, min(match_count, 10))

    return team, match_count


# --- Function from Cell 146 ---
# Retrieve recent matches and calculate form statistics

def get_recent_team_form(team, match_count=5):
    team_matches = results_df[
        (results_df["home_team"] == team)
        |
        (results_df["away_team"] == team)
    ].copy()

    if team_matches.empty:
        return None

    team_matches["date_dt"] = pd.to_datetime(
        team_matches["date"],
        errors="coerce"
    )

    team_matches = (
        team_matches
        .sort_values("date_dt", ascending=False)
        .head(match_count)
        .sort_values("date_dt")
    )

    form = []
    wins = 0
    draws = 0
    losses = 0
    goals_scored = 0
    goals_conceded = 0

    match_lines = []

    for _, row in team_matches.iterrows():
        home = row["home_team"]
        away = row["away_team"]
        home_score = int(row["home_score"])
        away_score = int(row["away_score"])

        if team == home:
            team_score = home_score
            opponent_score = away_score
        else:
            team_score = away_score
            opponent_score = home_score

        goals_scored += team_score
        goals_conceded += opponent_score

        if team_score > opponent_score:
            result = "W"
            wins += 1
        elif team_score < opponent_score:
            result = "L"
            losses += 1
        else:
            result = "D"
            draws += 1

        form.append(result)

        match_lines.append(
            f"{row['date']}: "
            f"{home} {home_score}-{away_score} {away}"
        )

    return {
        "team": team,
        "matches": match_lines,
        "form": form,
        "wins": wins,
        "draws": draws,
        "losses": losses,
        "goals_scored": goals_scored,
        "goals_conceded": goals_conceded
    }


# --- Function from Cell 147 ---
# Generate recent-form answer

def generate_recent_form_answer(question):
    team, match_count = extract_recent_form_request(question)

    if team is None:
        return (
            "I couldn't identify which team you want "
            "recent form for."
        )

    stats = get_recent_team_form(
        team,
        match_count
    )

    if stats is None:
        return (
            f"I couldn't find recent match data for {team}."
        )

    matches_text = "\n".join(
        f"{i+1}. {match}"
        for i, match in enumerate(stats["matches"])
    )

    form_text = "-".join(stats["form"])

    return (
        f"{team}'s last {len(stats['matches'])} international matches:\n\n"
        f"{matches_text}\n\n"
        f"Form: {form_text}\n"
        f"Record: {stats['wins']} wins, "
        f"{stats['draws']} draws, "
        f"{stats['losses']} losses\n"
        f"Goals: {stats['goals_scored']} scored, "
        f"{stats['goals_conceded']} conceded."
    )


# --- Function from Cell 154 ---
# Find a shootout corresponding to a results match

def get_shootout_for_match(row):
    date = str(row["date"])
    home_team = row["home_team"]
    away_team = row["away_team"]

    shootout = shootouts_df[
        (shootouts_df["date"].astype(str) == date)
        &
        (
            (
                (shootouts_df["home_team"] == home_team)
                &
                (shootouts_df["away_team"] == away_team)
            )
            |
            (
                (shootouts_df["home_team"] == away_team)
                &
                (shootouts_df["away_team"] == home_team)
            )
        )
    ]

    if shootout.empty:
        return None

    return shootout.iloc[0]


# --- Function from Cell 158 ---
# FINAL KNOCKOUT-STAGE CONFIGURATION
# Added at the end of the notebook

def get_knockout_structure(tournament, edition_year):
    year = int(edition_year)

    # -------------------------------------------------
    # FIFA WORLD CUP
    # -------------------------------------------------
    if tournament == "FIFA World Cup":

        # 2026 onward: 48 teams, Round of 32 added
        if year >= 2026:
            return [
                ("Round of 32", 16),
                ("Round of 16", 8),
                ("Quarterfinal", 4),
                ("Semifinal", 2),
                ("Third-place playoff", 1),
                ("Final", 1)
            ]

        # Modern pre-2026 format
        return [
            ("Round of 16", 8),
            ("Quarterfinal", 4),
            ("Semifinal", 2),
            ("Third-place playoff", 1),
            ("Final", 1)
        ]

    # -------------------------------------------------
    # UEFA EURO
    # Modern 24-team format
    # No third-place playoff
    # -------------------------------------------------
    if tournament == "UEFA Euro" and year >= 2016:
        return [
            ("Round of 16", 8),
            ("Quarterfinal", 4),
            ("Semifinal", 2),
            ("Final", 1)
        ]

    # -------------------------------------------------
    # AFRICA CUP OF NATIONS
    # Modern 24-team format
    # -------------------------------------------------
    if tournament == "African Cup of Nations" and year >= 2019:
        return [
            ("Round of 16", 8),
            ("Quarterfinal", 4),
            ("Semifinal", 2),
            ("Third-place playoff", 1),
            ("Final", 1)
        ]

    # -------------------------------------------------
    # AFC ASIAN CUP
    # Modern 24-team format
    # -------------------------------------------------
    if tournament == "AFC Asian Cup" and year >= 2019:
        return [
            ("Round of 16", 8),
            ("Quarterfinal", 4),
            ("Semifinal", 2),
            ("Final", 1)
        ]

    # -------------------------------------------------
    # COPA AMERICA
    # Modern format starts knockout phase at QF
    # -------------------------------------------------
    if tournament == "Copa América":
        return [
            ("Quarterfinal", 4),
            ("Semifinal", 2),
            ("Third-place playoff", 1),
            ("Final", 1)
        ]

    # -------------------------------------------------
    # UEFA NATIONS LEAGUE
    # Finals tournament
    # -------------------------------------------------
    if tournament == "UEFA Nations League":
        return [
            ("Semifinal", 2),
            ("Third-place playoff", 1),
            ("Final", 1)
        ]

    return None


# --- Function from Cell 159 ---
def get_tournament_edition_matches(tournament, edition_year):
    edition_year = str(edition_year)

    actual_year = TOURNAMENT_EDITION_YEAR_OVERRIDES.get(
        (tournament, edition_year),
        edition_year
    )

    matches = results_df[
        (results_df["tournament"] == tournament)
        &
        (
            results_df["date"]
            .astype(str)
            .str.startswith(actual_year)
        )
    ].copy()

    if matches.empty:
        return matches

    matches["date_dt"] = pd.to_datetime(
        matches["date"],
        errors="coerce"
    )

    return matches.sort_values("date_dt")


# --- Function from Cell 160 ---
def infer_knockout_stage(row):
    tournament = row["tournament"]

    # Find edition year from match date
    actual_year = str(row["date"])[:4]

    # Reverse-map postponed editions where needed
    edition_year = actual_year

    for (mapped_tournament, official_year), played_year in (
        TOURNAMENT_EDITION_YEAR_OVERRIDES.items()
    ):
        if (
            mapped_tournament == tournament
            and played_year == actual_year
        ):
            edition_year = official_year
            break

    structure = get_knockout_structure(
        tournament,
        edition_year
    )

    if structure is None:
        return None

    edition_matches = get_tournament_edition_matches(
        tournament,
        edition_year
    )

    if edition_matches.empty:
        return None

    # Number of knockout matches expected
    knockout_count = sum(
        count for _, count in structure
    )

    if len(edition_matches) < knockout_count:
        return None

    # The last N matches are the knockout phase
    knockout_matches = edition_matches.tail(
        knockout_count
    ).copy()

    # Build stage labels in chronological order
    stage_labels = []

    for stage_name, count in structure:
        stage_labels.extend(
            [stage_name] * count
        )

    knockout_matches["inferred_stage"] = stage_labels

    # Identify the selected match
    selected = knockout_matches[
        (
            knockout_matches["date"].astype(str)
            == str(row["date"])
        )
        &
        (
            knockout_matches["home_team"]
            == row["home_team"]
        )
        &
        (
            knockout_matches["away_team"]
            == row["away_team"]
        )
    ]

    if selected.empty:
        return None

    return selected.iloc[0]["inferred_stage"]


# --- Function from Cell 162 ---
# FINAL result answer generator
# Includes:
# - shootout-aware results
# - knockout-stage context

def generate_result_answer(intent, row):
    home_team = row["home_team"]
    away_team = row["away_team"]
    home_score = row["home_score"]
    away_score = row["away_score"]
    date = row["date"]
    tournament = row["tournament"]
    city = row["city"]
    country = row["country"]
    neutral = row["neutral"]

    stage = infer_knockout_stage(row)

    stage_text = ""

    if stage:
        stage_text = (
            f" This was a {stage} match "
            f"at the {tournament}."
        )

    # -------------------------------------------------
    # HOME SCORE
    # -------------------------------------------------
    if intent == "home_team_score":
        return (
            f"{home_team} scored {home_score} goal(s)."
            f"{stage_text}"
        )

    # -------------------------------------------------
    # AWAY SCORE
    # -------------------------------------------------
    elif intent == "away_team_score":
        return (
            f"{away_team} scored {away_score} goal(s)."
            f"{stage_text}"
        )

    # -------------------------------------------------
    # MATCH SCORE
    # -------------------------------------------------
    elif intent == "match_score":

        base = (
            f"{home_team} {home_score} - "
            f"{away_score} {away_team}."
        )

        if home_score == away_score:
            shootout = get_shootout_for_match(row)

            if shootout is not None:
                winner = shootout["winner"]

                return (
                    f"{base} "
                    f"{winner} won the penalty shootout."
                    f"{stage_text}"
                )

        return f"{base}{stage_text}"

    # -------------------------------------------------
    # MATCH WINNER
    # -------------------------------------------------
    elif intent == "match_winner":

        if home_score > away_score:
            return (
                f"{home_team} won the match "
                f"{home_score}-{away_score}."
                f"{stage_text}"
            )

        elif away_score > home_score:
            return (
                f"{away_team} won the match "
                f"{away_score}-{home_score}."
                f"{stage_text}"
            )

        shootout = get_shootout_for_match(row)

        if shootout is not None:
            winner = shootout["winner"]

            return (
                f"The match ended "
                f"{home_score}-{away_score}, "
                f"and {winner} won the penalty shootout."
                f"{stage_text}"
            )

        return (
            f"The match ended in a "
            f"{home_score}-{away_score} draw."
            f"{stage_text}"
        )

    # -------------------------------------------------
    # TOTAL GOALS
    # -------------------------------------------------
    elif intent == "total_goals":
        total = home_score + away_score

        return (
            f"A total of {total} goal(s) were scored."
            f"{stage_text}"
        )

    # -------------------------------------------------
    # DATE
    # -------------------------------------------------
    elif intent == "match_date":
        return (
            f"The match was played on {date}."
            f"{stage_text}"
        )

    # -------------------------------------------------
    # LOCATION
    # -------------------------------------------------
    elif intent == "match_location":
        return (
            f"The match was played in "
            f"{city}, {country}."
            f"{stage_text}"
        )

    # -------------------------------------------------
    # TOURNAMENT
    # -------------------------------------------------
    elif intent == "tournament":

        if stage:
            return (
                f"The match was part of the "
                f"{tournament}, in the {stage}."
            )

        return (
            f"The match was part of the "
            f"{tournament}."
        )

    # -------------------------------------------------
    # NEUTRAL STATUS
    # -------------------------------------------------
    elif intent == "neutral_status":
        neutral_text = "Yes" if bool(neutral) else "No"

        return (
            f"{neutral_text}, the match "
            f"{'was' if bool(neutral) else 'was not'} "
            f"played at a neutral venue."
            f"{stage_text}"
        )

    return "Answer generation for this intent is not implemented yet."
