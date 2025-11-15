from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
import json

from app.db import SessionLocal
from app.models import User, Email, DailyDigest

# Gemini utilities (your existing LLM functions)
from app.llm.categorize_email import categorize_email
from app.llm.generate_reply import generate_reply
from app.llm.daily_digest import daily_digest

processing_bp = Blueprint("processing", __name__)


# ---------------------------------------------------
# Helper: SQLAlchemy Session
# ---------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===================================================
# 1) CLASSIFY A SINGLE EMAIL (Gemini)
# POST /process/classify
# ===================================================
@processing_bp.route("/classify", methods=["POST"])
@jwt_required()
def classify_email():
    db = next(get_db())
    user_id = get_jwt_identity()

    payload = request.get_json()
    email_id = payload.get("email_id")

    if not email_id:
        return jsonify({"success": False, "error": "email_id required"}), 400

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    # ---- GEMINI CALL ----
    result = categorize_email(
        subject=email.subject or "",
        body=email.body_content or "",
        sender=email.sender_name or "",
    )

    # Save results to DB
    email.category = result.category
    email.urgency = result.urgency
    email.risk_flag = result.risk_flag
    email.summary = result.summary
    email.processed = True

    db.commit()

    return jsonify({
        "success": True,
        "classification": result.model_dump(),
    })


# ===================================================
# 2) GENERATE DRAFT EMAIL REPLY (Gemini)
# POST /process/draft
# ===================================================
@processing_bp.route("/draft", methods=["POST"])
@jwt_required()
def draft_reply():
    db = next(get_db())
    user_id = get_jwt_identity()

    payload = request.get_json()
    email_id = payload.get("email_id")

    if not email_id:
        return jsonify({"success": False, "error": "email_id required"}), 400

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    user = db.query(User).filter_by(id=user_id).first()

    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    # -------- GEMINI CALL ----------
    reply = generate_reply(
        email_subject=email.subject or "",
        email_body=email.body_content or "",
        professor_name=user.name,
        tone=user.tone_preference or "professional",
        length=user.reply_length_preference or "medium",
        signature=user.signature or f"Best,\n{user.name}",
    )

    # Save draft to DB
    email.draft_reply = reply.reply
    db.commit()

    return jsonify({"success": True, "draft": reply.model_dump()})


# ===================================================
# 3) SEARCH EMAILS (local DB search)
# POST /process/search
# ===================================================
@processing_bp.route("/search", methods=["POST"])
@jwt_required()
def search_emails():
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
    for e in q:
        relevance = 0.3
        if query.lower() in (e.subject or "").lower(): relevance += 0.3
        if query.lower() in (e.body_preview or "").lower(): relevance += 0.2
        if query.lower() in (e.summary or "").lower(): relevance += 0.2

        results.append({**e.to_dict(), "relevance": relevance})

    results.sort(key=lambda x: x["relevance"], reverse=True)

    return jsonify({"success": True, "results": results})


# ===================================================
# 4) DAILY DIGEST SUMMARY (Gemini)
# POST /process/digest
# ===================================================
@processing_bp.route("/digest", methods=["POST"])
@jwt_required()
def digest():
    db = next(get_db())
    user_id = get_jwt_identity()

    user = db.query(User).filter_by(id=user_id).first()
    date_str = request.json.get("date")

    day = datetime.fromisoformat(date_str).date() if date_str else datetime.utcnow().date()

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

    # ----- GEMINI CALL -----
    # Format summaries for daily_digest function
    digest_inputs = [
        f"Subject: {s['subject']}, Sender: {s['sender']}, Category: {s.get('category', 'unknown')}, Urgency: {s.get('urgency', 0)}, Summary: {s.get('summary', 'No summary')}"
        for s in summaries
    ]
    digest_json = daily_digest(digest_inputs)

    # Store in DB
    db.add(DailyDigest(
        user_id=user_id,
        summary_date=day,
        digest_text=json.dumps(digest_json),
    ))

    db.commit()

    return jsonify({"success": True, "digest": digest_json})


# ===================================================
# 5) BATCH CLASSIFY (defaults to simple local classifier)
# POST /process/batch-classify
# ===================================================
@processing_bp.route("/batch-classify", methods=["POST"])
@jwt_required()
def batch_classify():
    db = next(get_db())
    user_id = get_jwt_identity()

    # Only classify 10 at a time for speed
    emails = (
        db.query(Email)
        .filter_by(user_id=user_id, processed=False)
        .limit(10)
        .all()
    )

    count = 0
    for email in emails:
        result = categorize_email(
            subject=email.subject or "",
            body=email.body_content or "",
            sender=email.sender_name or "",
        )

        email.category = result.category
        email.urgency = result.urgency
        email.risk_flag = result.risk_flag
        email.summary = result.summary
        email.processed = True

        count += 1

    db.commit()

    return jsonify({"success": True, "processed": count})
