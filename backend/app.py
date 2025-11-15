from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///professor_inbox.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # CORS configuration
    CORS(app, origins=[
        "http://localhost:3000",
        os.getenv('FRONTEND_URL', 'http://localhost:3000')
    ])
    
    # Register blueprints
    try:
        from app.modules.auth import auth_bp
        from app.modules.emails import emails_bp
        from app.modules.processing import processing_bp
        
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(emails_bp, url_prefix='/emails')
        app.register_blueprint(processing_bp, url_prefix='/process')
    except ImportError as e:
        print(f"Warning: Could not import modules: {e}")
        print("Running with basic health check only")
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Professor Inbox Copilot API is running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=8000)