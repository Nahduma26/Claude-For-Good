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
REDIRECT_URI = os.getenv("MICROSOFT_REDIRECT_URI", "http://localhost:3000/auth/callback")

AUTHORITY = "https://login.microsoftonline.com/common"
SCOPES = ["User.Read", "Mail.Read", "Mail.Send"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@auth_bp.route('/login', methods=['GET'])
def login():
    print("CLIENT ID:", CLIENT_ID)
    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )

    auth_url = msal_app.get_authorization_request_url(
        SCOPES,
        redirect_uri=REDIRECT_URI,
        state="inboxcopilot"
    )

    return jsonify({"auth_url": auth_url})


@auth_bp.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400

    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )

    token_result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    if "error" in token_result:
        return jsonify({"error": token_result["error_description"]}), 400

    access_token = token_result["access_token"]

    # Fetch user profile from Graph
    profile = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    ms_id   = profile["id"]
    email   = profile.get("mail") or profile.get("userPrincipalName")
    name    = profile.get("displayName", "Unknown")

    # -------------------------------
    #   USE REAL SQLALCHEMY SESSION
    # -------------------------------
    db_sess = SessionLocal()

    try:
        user = db_sess.query(User).filter_by(microsoft_user_id=ms_id).first()

        if not user:
            user = User(
                email=email,
                name=name,
                microsoft_user_id=ms_id,
                access_token=access_token,
                refresh_token=token_result.get("refresh_token"),
            )
            db_sess.add(user)
        else:
            user.access_token  = access_token
            user.refresh_token = token_result.get("refresh_token")

        db_sess.commit()

    finally:
        db_sess.close()

    jwt = create_access_token(identity=str(user.id))

    return jsonify({
        "jwt": jwt,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
        }
    })
