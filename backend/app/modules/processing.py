from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
import os

from app.db import SessionLocal
from app.models import User, Email, DailyDigest

# If you’re using Gemini:
# from app.llm.categorize_email import categorize_email
# from app.llm.generate_reply import generate_reply

# If using Claude instead:
import anthropic

claude_client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

processing_bp = Blueprint("processing", __name__)


# ------------------------------
# Helper: SQLAlchemy session
# ------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# POST /process/classify
# Classify a single email using LLM
# ============================================================
@processing_bp.route("/classify", methods=["POST"])
@jwt_required()
def classify_email():
    db = next(get_db())
    user_id = get_jwt_identity()

    data = request.get_json()
    email_id = data.get("email_id")

    if not email_id:
        return jsonify({"success": False, "error": "email_id required"}), 400

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    user = db.query(User).filter_by(id=user_id).first()

    # Build prompt
    prompt = f"""
    You are an AI assistant helping Professor {user.name} process student emails.

    Email:
    Subject: {email.subject}
    Sender: {email.sender_name} <{email.sender_email}>
    Body:
    {email.body_content}

    Please return JSON with:
    {{
        "category": "clarification | extension | grade | emergency | logistics | other",
        "urgency": 0-5 integer (0 = none, 5 = critical),
        "risk_flag": true/false for academic integrity concerns,
        "summary": "2-3 sentence summary"
    }}
    """

    start = datetime.utcnow()

    try:
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            result = {
                "category": "other",
                "urgency": 1,
                "risk_flag": False,
                "summary": "LLM parsing failed."
            }

        # Store directly in Email table
        email.category = result.get("category")
        email.urgency = result.get("urgency")
        email.risk_flag = result.get("risk_flag", False)
        email.summary = result.get("summary")
        email.processed = True

        db.commit()

        return jsonify({
            "success": True,
            "classification": result,
            "processing_time_ms": int((datetime.utcnow() - start).total_seconds() * 1000)
        })

    except Exception as e:
        current_app.logger.error(f"Classification error: {e}")
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# POST /process/draft
# Generate a draft reply for an email
# ============================================================
@processing_bp.route("/draft", methods=["POST"])
@jwt_required()
def generate_draft_reply():
    db = next(get_db())
    user_id = get_jwt_identity()

    data = request.get_json()
    email_id = data.get("email_id")
    if not email_id:
        return jsonify({"success": False, "error": "email_id required"}), 400

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    user = db.query(User).filter_by(id=user_id).first()

    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    prompt = f"""
    You are writing a professional reply for Professor {user.name}.

    Student email:
    Subject: {email.subject}
    Body:
    {email.body_content}

    Preferences:
    Tone: {user.tone_preference or "professional"}
    Reply length: {user.reply_length_preference or "medium"}
    Signature: {user.signature or ("Best,\n" + user.name)}

    Return JSON:
    {{
        "subject": "Re: ...",
        "draft_reply": "full reply text"
    }}
    """

    try:
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )

        try:
            result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            result = {
                "subject": f"Re: {email.subject}",
                "draft_reply": "LLM failed to generate reply. Please respond manually."
            }

        # Write to Email table
        email.draft_reply = result.get("draft_reply")
        db.commit()

        return jsonify({"success": True, "draft": result})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# POST /process/search
# Simple semantic search (text-based for now)
# ============================================================
@processing_bp.route("/search", methods=["POST"])
@jwt_required()
def search():
    db = next(get_db())
    user_id = get_jwt_identity()

    query = request.json.get("query", "").strip()
    if not query:
        return jsonify({"success": False, "error": "query required"}), 400

    q = (
        db.query(Email)
        .filter(
            Email.user_id == user_id,
            (
                Email.subject.ilike(f"%{query}%") |
                Email.body_preview.ilike(f"%{query}%") |
                Email.summary.ilike(f"%{query}%")
            )
        )
        .limit(25)
        .all()
    )

    results = []
    for email in q:
        relevance = 0.3
        if query.lower() in (email.subject or "").lower():
            relevance += 0.3
        if query.lower() in (email.body_preview or "").lower():
            relevance += 0.2
        if query.lower() in (email.summary or "").lower():
            relevance += 0.2

        results.append({**email.to_dict(), "relevance": relevance})

    results = sorted(results, key=lambda x: x["relevance"], reverse=True)

    return jsonify({"success": True, "results": results})


# ============================================================
# POST /process/digest
# Generate daily digest & store in daily_digests
# ============================================================
@processing_bp.route("/digest", methods=["POST"])
@jwt_required()
def daily_digest():
    db = next(get_db())
    user_id = get_jwt_identity()
    user = db.query(User).filter_by(id=user_id).first()

    date_str = request.json.get("date")
    day = datetime.fromisoformat(date_str).date() if date_str else datetime.utcnow().date()

    # Get all emails received on that date
    emails = (
        db.query(Email)
        .filter(
            Email.user_id == user_id,
            Email.received_at >= datetime.combine(day, datetime.min.time()),
            Email.received_at <= datetime.combine(day, datetime.max.time()),
        )
        .all()
    )

    summaries = [
        {
            "subject": e.subject,
            "sender": e.sender_name,
            "category": e.category,
            "urgency": e.urgency,
            "summary": e.summary or e.body_preview,
        }
        for e in emails
    ]

    prompt = f"""
    Create a daily digest summary for Professor {user.name}.

    Emails:
    {json.dumps(summaries, indent=2)}

    Return JSON:
    {{
        "summary": "...",
        "trends": [".."],
        "recommendations": [".."]
    }}
    """

    try:
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )

        try:
            digest_json = json.loads(response.content[0].text)
        except:
            digest_json = {"summary": "LLM failed to generate digest."}

        digest = DailyDigest(
            user_id=user_id,
            summary_date=day,
            digest_text=json.dumps(digest_json),
        )
        db.add(digest)
        db.commit()

        return jsonify({"success": True, "digest": digest_json})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# POST /process/batch-classify
# Classify all unprocessed emails
# ============================================================
@processing_bp.route("/batch-classify", methods=["POST"])
@jwt_required()
def batch_classify():
    db = next(get_db())
    user_id = get_jwt_identity()

    emails = (
        db.query(Email)
        .filter_by(user_id=user_id, processed=False)
        .limit(10)
        .all()
    )

    count = 0
    for e in emails:
        try:
            _classify_internal(db, e)
            count += 1
        except:
            continue

    db.commit()

    return jsonify({"success": True, "processed": count})


# Internal simplified classifier
def _classify_internal(db, email: Email):
    text = (email.subject or "") + " " + (email.body_content or "")
    text = text.lower()

    if "extension" in text:
        email.category = "extension"
        email.urgency = 2
    elif "grade" in text:
        email.category = "grade"
        email.urgency = 3
    elif "urgent" in text or "asap" in text:
        email.category = "emergency"
        email.urgency = 5
    else:
        email.category = "other"
        email.urgency = 1

    email.summary = email.body_preview
    email.processed = True
    return True
