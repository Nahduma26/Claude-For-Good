from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from sqlalchemy import text


# SQLAlchemy (REAL engine, NOT Flask-SQLAlchemy)
from .db import SessionLocal, engine, Base

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

    # Init JWT
    jwt = JWTManager(app)

    # Enable CORS
    CORS(app, origins=[
        os.getenv('FRONTEND_URL', 'http://localhost:3000')
    ])

    # --- Register Blueprints (safe import) ---
    try:
        from app.modules.auth import auth_bp
        from app.modules.emails import emails_bp
        from app.modules.processing import processing_bp

        app.register_blueprint(auth_bp, url_prefix="/auth")
        app.register_blueprint(emails_bp, url_prefix="/emails")
        app.register_blueprint(processing_bp, url_prefix="/process")

    except Exception as e:
        print("⚠️ Warning: Blueprints failed to import:", e)
        print("Running with health check only.")

    # --- ROUTES BELOW ---

    @app.route("/")
    def index():
        return {
            "message": "Professor Inbox Copilot API",
            "version": "1.0.0",
            "status": "running",
        }

    @app.route("/health")
    def health():
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"

        return {
            "status": "healthy",
            "db": db_status
        }

    # Simple test endpoint (frontend sanity check)
    @app.route("/auth/test")
    def auth_test():
        return {
            "status": "success",
            "message": "Auth service working"
        }

    @app.route("/emails/test")
    def email_test():
        return {
            "status": "success",
            "message": "Email service working"
        }

    # LLM checks
    @app.route("/llm/test")
    def llm_test():
        try:
            from app.llm.client import is_configured
            from app.llm import categorize_email

            if not is_configured():
                return {"status": "error", "message": "GEMINI_API_KEY missing"}

            result = categorize_email("Hello professor…", preferences="friendly")
            return {
                "status": "success",
                "sample_result": result
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.route("/llm/models")
    def llm_models():
        try:
            from app.llm.client import list_available_models, is_configured

            if not is_configured():
                return {"status": "error", "message": "GEMINI_API_KEY missing"}

            return {
                "status": "success",
                "available_models": list_available_models(),
                "current_model": "gemini-2.0-flash"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    return app


# ---------- RUN SERVER ----------
if __name__ == "__main__":
    app = create_app()

    # DO NOT USE Flask-SQLAlchemy create_all()
    # Supabase already has your schema
    # Alembic manages migrations
    # Base.metadata.create_all(bind=engine)  <-- ONLY if you're running local-only DB

    port = int(os.getenv("PORT", 8000))
    app.run(debug=True, host="0.0.0.0", port=port)
