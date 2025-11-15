from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import msal
import os
from datetime import datetime, timedelta

from app.db import SessionLocal
from app.models import User

auth_bp = Blueprint("auth", __name__)

CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID")
CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET")
TENANT_ID = os.getenv("MICROSOFT_TENANT_ID", "common")
REDIRECT_URI = os.getenv("MICROSOFT_REDIRECT_URI", "http://localhost:8000/auth/callback")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ["User.Read", "Mail.Read", "Mail.Send"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@auth_bp.route("/login", methods=["GET"])
def login():
    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
    )

    auth_url = msal_app.get_authorization_request_url(
        SCOPES, redirect_uri=REDIRECT_URI
    )

    return jsonify({"success": True, "auth_url": auth_url})


@auth_bp.route("/callback", methods=["GET"])
def callback():
    db = next(get_db())

    code = request.args.get("code")
    if not code:
        return jsonify({"success": False, "error": "Missing auth code"}), 400

    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
    )

    token_result = msal_app.acquire_token_by_authorization_code(
        code, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )

    if "access_token" not in token_result:
        return jsonify({
            "success": False,
            "error": token_result.get("error_description", "Auth failed"),
        }), 400

    access_token = token_result["access_token"]

    graph_user = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {access_token}"},
    ).json()

    microsoft_user_id = graph_user["id"]
    email = graph_user.get("mail") or graph_user.get("userPrincipalName")

    user = db.query(User).filter_by(microsoft_user_id=microsoft_user_id).first()

    if not user:
        user = User(
            email=email,
            name=graph_user["displayName"],
            microsoft_user_id=microsoft_user_id,
        )
        db.add(user)

    user.access_token = access_token
    user.refresh_token = token_result.get("refresh_token")
    user.token_expires_at = (
        datetime.utcnow() + timedelta(seconds=token_result.get("expires_in", 3600))
    )

    db.commit()

    jwt_token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "token": jwt_token,
        "user": {"id": str(user.id), "email": user.email, "name": user.name},
    })
