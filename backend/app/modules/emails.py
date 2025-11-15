from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime

from app.db import SessionLocal
from app.models import User, Email

emails_bp = Blueprint("emails", __name__)


# Utility: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================
# GET /emails  — paginated list
# ============================================
@emails_bp.route("/", methods=["GET"])
@jwt_required()
def get_emails():
    db = next(get_db())
    user_id = get_jwt_identity()

    # Query params
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    category = request.args.get("category")
    urgency = request.args.get("urgency")
    unread_only = request.args.get("unread_only", "false").lower() == "true"

    query = db.query(Email).filter(Email.user_id == user_id)

    if unread_only:
        query = query.filter(Email.is_read == False)

    if category:
        query = query.filter(Email.category == category)

    if urgency:
        try:
            urgency_val = int(urgency)
            query = query.filter(Email.urgency == urgency_val)
        except:
            pass

    total = query.count()
    items = (
        query.order_by(Email.received_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return jsonify({
        "success": True,
        "emails": [e.to_dict() for e in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    })
    

# ============================================
# GET /emails/<uuid>
# ============================================
@emails_bp.route("/<email_id>", methods=["GET"])
@jwt_required()
def get_email(email_id):
    db = next(get_db())
    user_id = get_jwt_identity()

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()

    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    return jsonify({"success": True, "email": email.to_dict()})


# ============================================
# POST /emails/sync — Microsoft Graph sync
# ============================================
@emails_bp.route("/sync", methods=["POST"])
@jwt_required()
def sync_emails():
    db = next(get_db())
    user_id = get_jwt_identity()

    user = db.query(User).filter_by(id=user_id).first()
    if not user or not user.access_token:
        return jsonify({
            "success": False,
            "error": "User not authenticated with Microsoft",
        }), 401

    headers = {"Authorization": f"Bearer {user.access_token}"}

    graph_url = "https://graph.microsoft.com/v1.0/me/messages"
    params = {
        "$top": 50,
        "$select": "id,subject,sender,receivedDateTime,bodyPreview,body,conversationId,isRead",
        "$orderby": "receivedDateTime desc",
    }

    response = requests.get(graph_url, headers=headers, params=params)

    if response.status_code == 401:
        return jsonify({"success": False, "error": "Token expired"}), 401

    if response.status_code != 200:
        return jsonify({
            "success": False,
            "error": "Microsoft Graph error",
            "details": response.text,
        }), 500

    data = response.json()
    messages = data.get("value", [])

    new_emails = 0

    for msg in messages:
        ms_id = msg["id"]

        # Skip if already exists
        if db.query(Email).filter_by(ms_message_id=ms_id, user_id=user_id).first():
            continue

        sender_name = msg["sender"]["emailAddress"]["name"]
        sender_email = msg["sender"]["emailAddress"]["address"]
        body = msg.get("body", {}) or {}

        email = Email(
            user_id=user_id,
            ms_message_id=ms_id,
            subject=msg.get("subject"),
            sender=f"{sender_name} <{sender_email}>",
            sender_name=sender_name,
            sender_email=sender_email,
            body_preview=msg.get("bodyPreview"),
            body_content=body.get("content"),
            body_plain=None,
            body_html=body.get("content") if body.get("contentType") == "html" else None,
            conversation_id=msg.get("conversationId"),
            received_at=datetime.fromisoformat(msg["receivedDateTime"].replace("Z", "+00:00")),
            is_read=msg.get("isRead", False),
        )

        db.add(email)
        new_emails += 1

    db.commit()

    return jsonify({
        "success": True,
        "new_emails": new_emails,
        "message": f"Synced {new_emails} emails",
    })


# ============================================
# POST /emails/<uuid>/mark-read
# ============================================
@emails_bp.route("/<email_id>/mark-read", methods=["POST"])
@jwt_required()
def mark_email_read(email_id):
    db = next(get_db())
    user_id = get_jwt_identity()

    email = db.query(Email).filter_by(id=email_id, user_id=user_id).first()
    if not email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    email.is_read = True
    db.commit()

    return jsonify({"success": True, "message": "Email marked as read"})


# ============================================
# GET /emails/categories
# ============================================
@emails_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():
    db = next(get_db())
    user_id = get_jwt_identity()

    rows = (
        db.query(Email.category, func.count(Email.id))
        .filter(Email.user_id == user_id)
        .group_by(Email.category)
        .all()
    )

    categories = [
        {"category": cat, "count": cnt}
        for (cat, cnt) in rows if cat is not None
    ]

    return jsonify({"success": True, "categories": categories})


# ============================================
# GET /emails/stats
# ============================================
from sqlalchemy import func

@emails_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    db = next(get_db())
    user_id = get_jwt_identity()

    total = db.query(func.count(Email.id)).filter(Email.user_id == user_id).scalar()
    unread = (
        db.query(func.count(Email.id))
        .filter(Email.user_id == user_id, Email.is_read == False)
        .scalar()
    )
    processed = (
        db.query(func.count(Email.id))
        .filter(Email.user_id == user_id, Email.processed == True)
        .scalar()
    )
    urgent = (
        db.query(func.count(Email.id))
        .filter(Email.user_id == user_id, Email.urgency >= 3)
        .scalar()
    )
    risks = (
        db.query(func.count(Email.id))
        .filter(Email.user_id == user_id, Email.risk_flag == True)
        .scalar()
    )

    return jsonify({
        "success": True,
        "stats": {
            "total_emails": total,
            "unread_emails": unread,
            "processed_emails": processed,
            "urgent_emails": urgent,
            "risk_flagged_emails": risks,
            "processing_rate": (processed / total * 100) if total > 0 else 0,
        },
    })
