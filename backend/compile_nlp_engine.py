import json
import os

notebook_path = r"C:\Users\Eshan\Desktop\SLTC\AC projects\NLP\Project\football-qa-nlp\notebooks\06_football_qa_inference.ipynb"
output_path = r"C:\Users\Eshan\Desktop\GLOBAL-XI\backend\nlp_engine.py"

with open(notebook_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

cells = data.get('cells', [])
code_cells = [c for c in cells if c.get('cell_type') == 'code']

# Specify the 1-based cell numbers we want to include
cell_numbers = [
    9,   # normalize_text
    6,   # predict_intent (model loading is custom, but we need the function)
    10,  # extract_basic_entities
    12,  # extract_team_role_constraints
    13,  # extract_exact_date
    14,  # find_result_candidates
    15,  # detect_former_team_names
    16,  # resolve_former_team_names
    19,  # inspect_candidate_differences
    21,  # generate_clarification_question
    24,  # apply_clarification
    28,  # generate_smart_clarification
    30,  # apply_smart_clarification
    34,  # extract_year_from_reply
    38,  # add_match_key
    39,  # extract_goalscorer_entities
    40,  # extract_scoring_team
    41,  # find_goalscorer_candidates
    46,  # get_unique_goal_matches
    47,  # enrich_goal_matches
    48,  # generate_goal_match_clarification
    49,  # apply_goal_match_clarification
    53,  # format_ordinal_minute
    54,  # generate_goalscorer_answer
    65,  # extract_shootout_entities
    66,  # find_shootout_candidates
    68,  # enrich_shootout_matches
    70,  # generate_shootout_answer
    75,  # generate_shootout_clarification
    76,  # apply_shootout_clarification
    80,  # SUPPORTED_MAJOR_TOURNAMENTS
    82,  # detect_major_tournament
    109, # find_tournament_final
    87,  # resolve_final_winner
    89,  # is_tournament_winner_question
    91,  # detect_generic_nations_league
    92,  # infer_nations_league_from_teams
    143, # detect_recent_form_question
    145, # extract_recent_form_request
    146, # get_recent_team_form
    147, # generate_recent_form_answer
    154, # get_shootout_for_match
    158, # get_knockout_structure
    159, # get_tournament_edition_matches
    160, # infer_knockout_stage
    162  # generate_result_answer
]

compiled_code = []

# Add imports
compiled_code.append("""import os
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
""")

# Add notebook functions
for num in cell_numbers:
    cell = code_cells[num - 1]
    source = "".join(cell.get('source', []))
    
    # Clean up local imports or redundant definitions in the cells if needed
    source_clean = []
    for line in source.splitlines():
        if line.strip().startswith("project_path =") or line.strip().startswith("data_path =") or line.strip().startswith("rf_path ="):
            continue
        if line.strip().startswith("rf_model =") or line.strip().startswith("rf_vectorizer ="):
            continue
        if line.strip().startswith("results_df =") or line.strip().startswith("goalscorers_df =") or line.strip().startswith("shootouts_df =") or line.strip().startswith("former_names_df ="):
            continue
        if line.strip().startswith("all_teams =") or line.strip().startswith("all_tournaments ="):
            continue
        if line.strip().startswith("former_names_lookup ="):
            continue
        if line.strip().startswith("TOURNAMENT_EDITION_YEAR_OVERRIDES ="):
            continue
        if line.strip().startswith("RESULT_INTENTS =") or line.strip().startswith("RESULTS_INTENTS =") or line.strip().startswith("GOALSCORER_INTENTS =") or line.strip().startswith("SHOOTOUT_INTENTS ="):
            continue
        if line.strip().startswith("print("):
            # Don't copy cell print checks
            if not line.strip().startswith("print(\""):
                source_clean.append(line)
            continue
        source_clean.append(line)
        
    compiled_code.append(f"\n# --- Function from Cell {num} ---\n" + "\n".join(source_clean) + "\n")

# Write to file
with open(output_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(compiled_code))

print(f"Successfully compiled nlp_engine.py at {output_path}")
