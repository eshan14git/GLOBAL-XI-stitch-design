from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import traceback

# Import everything from the compiled NLP engine
import nlp_engine

app = Flask(__name__)

# Enable CORS only for allowed origins
# For local dev, allow localhost. In production, allow all origins or specifically set Vercel domain later.
CORS(app, resources={r"/api/*": {"origins": "*"}})

# -------------------------------------------------
# 1. Non-Blocking QA Wrapper Functions
# -------------------------------------------------

def detect_recent_form_question_api(question):
    """Wrapper to support singular 'match' and plural 'matches' in recent form checks."""
    q = nlp_engine.normalize_text(question)

    patterns = [
        # last 5 matches / last 5 international matches / last 10 games / last 5 match results
        r"\blast\s+\d+\s+(?:international\s+)?(?:match|matches|game|games)\b",

        # last five matches / last five international games
        r"\blast\s+(?:one|two|three|four|five|six|seven|eight|nine|ten)\s+"
        r"(?:international\s+)?(?:match|matches|game|games)\b",

        # recent matches / recent international matches
        r"\brecent\s+(?:international\s+)?(?:match|matches|game|games)\b",

        # recent form / current form
        r"\b(?:recent|current)\s+form\b",

        # form in the last 5 games
        r"\bform\s+(?:in|over)\s+the\s+last\b"
    ]

    return any(
        re.search(pattern, q)
        for pattern in patterns
    )

def resolve_nations_league_reference_api(question):
    """Non-blocking version of resolve_nations_league_reference."""
    if not nlp_engine.detect_generic_nations_league(question):
        return question

    inferred = nlp_engine.infer_nations_league_from_teams(question)
    if inferred:
        # Replace generic wording with exact tournament name
        return re.sub(
            r"\bnations league\b",
            inferred,
            question,
            flags=re.IGNORECASE
        )

    # In a non-blocking API, instead of blocking for input,
    # default to UEFA Nations League
    return re.sub(
        r"\bnations league\b",
        "UEFA Nations League",
        question,
        flags=re.IGNORECASE
    )


def ask_results_question_api(question):
    """Non-blocking version of ask_results_question."""
    intent = nlp_engine.predict_intent(question)
    candidates = nlp_engine.find_result_candidates(question)

    if len(candidates) == 0:
        return "I couldn't find a match that fits the information in your question."

    # If there are multiple matches, sort descending by date and return the most recent one
    if len(candidates) > 1:
        candidates_sorted = candidates.sort_values("date", ascending=False)
        selected_match = candidates_sorted.iloc[0]
        answer = nlp_engine.generate_result_answer(intent, selected_match)
        
        # Get list of other dates matching the query
        other_dates = sorted(
            candidates_sorted["date"]
            .astype(str)
            .unique()
            .tolist(),
            reverse=True
        )[1:6] # limit to 5 other dates
        
        if other_dates:
            dates_str = ", ".join(other_dates)
            return f"{answer} (Showing most recent match. Other matching dates: {dates_str})"
        return answer

    selected_match = candidates.iloc[0]
    return nlp_engine.generate_result_answer(intent, selected_match)


def ask_goalscorer_question_api(question):
    """Non-blocking version of ask_goalscorer_question."""
    intent = nlp_engine.predict_intent(question)
    goal_candidates = nlp_engine.find_goalscorer_candidates(question)

    if goal_candidates.empty:
        return "I couldn't find a goal record matching your question."

    unique_matches = nlp_engine.get_unique_goal_matches(goal_candidates)
    enriched_matches = nlp_engine.enrich_goal_matches(unique_matches)

    # Sort descending by date and take the most recent match if multiple candidates exist
    if len(enriched_matches) > 1:
        enriched_matches = enriched_matches.sort_values("date", ascending=False)

    selected_match = enriched_matches.iloc[0]
    selected_key = selected_match["match_key"]

    selected_goal_events = goal_candidates[
        goal_candidates["match_key"] == selected_key
    ].copy()

    return nlp_engine.generate_goalscorer_answer(intent, selected_goal_events)


def ask_shootout_question_api(question):
    """Non-blocking version of ask_shootout_question."""
    intent = nlp_engine.predict_intent(question)
    shootout_candidates = nlp_engine.find_shootout_candidates(question)

    if shootout_candidates.empty:
        return "I couldn't find a penalty shootout matching your question."

    enriched_shootouts = nlp_engine.enrich_shootout_matches(shootout_candidates)

    # Sort descending by date and take the most recent shootout if multiple candidates exist
    if len(enriched_shootouts) > 1:
        enriched_shootouts = enriched_shootouts.sort_values("date", ascending=False)

    selected_shootout = enriched_shootouts.iloc[0]
    return nlp_engine.generate_shootout_answer(intent, selected_shootout)


def ask_question_api(question):
    """Unified entry point resolving question intents and returning answers."""
    # 1. Recent form / last-N matches
    if detect_recent_form_question_api(question):
        return {
            "intent": "recent_form",
            "answer": nlp_engine.generate_recent_form_answer(question)
        }

    # 2. Nations League ambiguity
    resolved_question = resolve_nations_league_reference_api(question)

    # 3. Predict intent
    intent = nlp_engine.predict_intent(resolved_question)

    question_normalized = nlp_engine.normalize_text(resolved_question)
    tournament = nlp_engine.detect_major_tournament(resolved_question)

    # 4. Major tournament winner / final questions
    if (
        intent == "match_winner"
        and tournament is not None
        and (
            "final" in question_normalized
            or nlp_engine.is_tournament_winner_question(resolved_question)
        )
    ):
        final_match, error = nlp_engine.find_tournament_final(resolved_question)
        if error is None:
            return {
                "intent": intent,
                "answer": nlp_engine.resolve_final_winner(final_match)
            }
        else:
            return {
                "intent": intent,
                "answer": f"I couldn't find a tournament final matching that year: {error}"
            }

    # 5. Results
    if intent in nlp_engine.RESULTS_INTENTS:
        return {
            "intent": intent,
            "answer": ask_results_question_api(resolved_question)
        }

    # 6. Goalscorers
    if intent in nlp_engine.GOALSCORER_INTENTS:
        return {
            "intent": intent,
            "answer": ask_goalscorer_question_api(resolved_question)
        }

    # 7. Shootouts
    if intent in nlp_engine.SHOOTOUT_INTENTS:
        return {
            "intent": intent,
            "answer": ask_shootout_question_api(resolved_question)
        }

    return {
        "intent": intent,
        "answer": "I understood the question, but I don't currently have an answer handler for this type of query."
    }

# -------------------------------------------------
# 2. Flask Routes
# -------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/api/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json()
        if not data or "question" not in data:
            return jsonify({"error": "Missing 'question' in request body"}), 400

        question = data["question"].strip()
        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        # Run query through QA pipeline
        result = ask_question_api(question)
        return jsonify(result), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    # Load port from env (Render uses dynamic PORT)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
