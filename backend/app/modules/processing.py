from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json

from app.db import SessionLocal
from app.models import User, Email, DailyDigest

# --- USE GEMINI ONLY ---
from app.llm.categorize_email import categorize_email
from app.llm.generate_reply import generate_reply
from app.llm.daily_digest import daily_digest

processing_bp = Blueprint("processing", __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# POST /process/classify  (Gemini)
# ============================================================
@processing_bp.route("/classify", methods=["POST"])
@jwt_required()
def classify_email():
    db = next(get_db())
    user_id = get_jwt_identity()

    email_id = request.json.get("email_id")
    if not email_id:
        return jsonify({"success": False, "error": "email_id required"}), 400

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    try:
        # 🧠 Run Gemini categorization
        result = categorize_email(
            email_text=email.body_content or "",
            thread_context=email.conversation_id,
            preferences=None
        )

        email.category = result.get("category")
        email.urgency = result.get("priority_score")
        email.risk_flag = result.get("hidden_intent") == "academic_integrity"
        email.summary = result.get("summary")
        email.processed = True

        db.commit()
        return jsonify({"success": True, "classification": result})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# POST /process/draft  (Gemini)
# ============================================================
@processing_bp.route("/draft", methods=["POST"])
@jwt_required()
def create_draft():
    db = next(get_db())
    user_id = get_jwt_identity()

    email_id = request.json.get("email_id")
    if not email_id:
        return jsonify({"success": False, "error": "email_id required"}), 400

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    user = db.query(User).filter_by(id=user_id).first()
    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    try:
        draft = generate_reply(
            email_text=email.body_content or "",
            category=email.category,
            policies="Course syllabus and standard academic procedures",
            professor_tone=user.tone_preference or "professional",
            thread_summary=email.summary or ""
        )

        email.draft_reply = draft.get("draft")
        db.commit()

        return jsonify({"success": True, "draft": draft})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# POST /process/digest  (Gemini)
# ============================================================
@processing_bp.route("/digest", methods=["POST"])
@jwt_required()
def generate_digest():
    db = next(get_db())
    user_id = get_jwt_identity()

    date_str = request.json.get("date")
    day = datetime.fromisoformat(date_str).date() if date_str else datetime.utcnow().date()

    emails = (
        db.query(Email)
        .filter(
            Email.user_id == user_id,
            Email.received_at >= datetime.combine(day, datetime.min.time()),
            Email.received_at <= datetime.combine(day, datetime.max.time()),
        ).all()
    )

    digest_inputs = [
        f"{e.subject} — {e.summary or e.body_preview}"
        for e in emails
    ]

    try:
        result = daily_digest(digest_inputs)

        digest = DailyDigest(
            user_id=user_id,
            summary_date=day,
            digest_text=json.dumps(result)
        )
        db.add(digest)
        db.commit()

        return jsonify({"success": True, "digest": result})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# POST /process/search  — Inbox semantic search (Gemini RAG)
# ============================================================

@processing_bp.route("/search", methods=["POST"])
@jwt_required()
def search_inbox():
    """
    Performs semantic search over user's emails using Gemini.
    Returns:
      - answer: LLM-written natural language summary
      - results: list of matching emails
    """
    db = next(get_db())
    user_id = get_jwt_identity()

    data = request.get_json() or {}
    query = data.get("query", "").strip()

    if not query:
        return jsonify({
            "success": False,
            "error": "Query is required."
        }), 400

    # ---- STEP 1: Get user's emails from DB ----
    emails = (
        db.query(Email)
        .filter(Email.user_id == user_id)
        .order_by(Email.received_at.desc())
        .all()
    )

    if not emails:
        return jsonify({
            "success": True,
            "answer": "Your inbox is empty.",
            "results": []
        })

    # ---- STEP 2: Build text blocks for Gemini search ----
    email_blocks = []
    for e in emails:
        text = (
            f"Subject: {e.subject}\n"
            f"From: {e.sender_name or e.sender_email}\n"
            f"Preview: {e.body_preview or ''}\n"
            f"Summary: {e.summary or ''}\n"
            f"Full Content: {e.body_content or ''}\n"
        )

        email_blocks.append({
            "id": str(e.id),
            "subject": e.subject,
            "sender_name": e.sender_name,
            "sender_email": e.sender_email,
            "body_preview": e.body_preview,
            "summary": e.summary,
            "full_text": text
        })

    # ---- STEP 3: Use Gemini to find relevant emails ----
    from app.llm.client import get_model
    model = get_model()

    llm_prompt = f"""
You are an academic email assistant. A professor asks:

    "{query}"

Identify the emails that are relevant and return ONLY their relevance scores as numbers between 0 and 1.

Output format (JSON):
{{
  "scores": [
    {{ "id": "...", "score": 0.92 }},
    ...
  ]
}}
    """

    # Construct contents for model
    contents = [
        {"role": "user", "parts": [{"text": llm_prompt}]}
    ]
    for block in email_blocks:
        contents.append({
            "role": "user",
            "parts": [{"text": f"Email ID {block['id']}:\n{block['full_text']}"}]
        })

    try:
        llm_response = model.generate_content(contents)
        parsed = json.loads(llm_response.text)
        scores = {item["id"]: item["score"] for item in parsed.get("scores", [])}
    except Exception as e:
        print("Error in LLM scoring:", e)
        scores = {}

    # ---- STEP 4: Sort by relevance ----
    threshold = 0.25  # ignore irrelevant results
    ranked = sorted(
        [
            (block, scores.get(block["id"], 0))
            for block in email_blocks
            if scores.get(block["id"], 0) >= threshold
        ],
        key=lambda x: x[1],
        reverse=True
    )

    results = [
        {
            "id": b["id"],
            "subject": b["subject"],
            "sender_name": b["sender_name"],
            "sender_email": b["sender_email"],
            "body_preview": b["body_preview"],
            "summary": b["summary"],
        }
        for (b, score) in ranked
    ]

    # ---- STEP 5: Ask Gemini to summarize results ----
    final_answer_prompt = f"""
User asked: "{query}"

Given these relevant emails:
{json.dumps(results, indent=2)}

Please write a single helpful natural-language answer for the professor.
    """

    try:
        answer_resp = model.generate_content(final_answer_prompt)
        answer_text = answer_resp.text.strip()
    except Exception:
        answer_text = "Here are the emails I found."

    return jsonify({
        "success": True,
        "answer": answer_text,
        "results": results
    })
