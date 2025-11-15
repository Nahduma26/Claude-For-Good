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
    
    # Root endpoint
    @app.route('/')
    def index():
        return {
            'message': 'Professor Inbox Copilot API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'auth': '/auth/',
                'emails': '/emails/',
                'processing': '/process/'
            }
        }
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Professor Inbox Copilot API is running'}
    
    # Test endpoints for frontend
    @app.route('/auth/test')
    def auth_test():
        return {
            'status': 'success',
            'message': 'Auth service is working',
            'endpoint': '/auth/test'
        }
    
    @app.route('/emails/test')
    def emails_test():
        return {
            'status': 'success',
            'message': 'Email service is working',
            'endpoint': '/emails/test'
        }
    
    # LLM workflow test endpoint
    @app.route('/llm/test')
    def llm_test():
        try:
            from app.llm.client import is_configured
            
            # Check if API key is configured
            if not is_configured():
                return {
                    'status': 'error',
                    'message': 'GEMINI_API_KEY not configured',
                    'note': 'Please add GEMINI_API_KEY to your .env file'
                }
            
            from app.llm import categorize_email
            # Simple test
            result = categorize_email(
                "Hi Professor, I'm struggling with the homework assignment. Can you help me understand question 3?",
                preferences="Be helpful and encouraging"
            )
            return {
                'status': 'success',
                'message': 'LLM workflows are working',
                'sample_result': result,
                'note': 'Gemini API is properly configured and functional'
            }
        except ValueError as e:
            return {
                'status': 'error',
                'message': f'Configuration error: {str(e)}',
                'note': 'Check your .env file configuration'
            }
        except Exception as e:
            return {
                'status': 'error', 
                'message': f'LLM workflow error: {str(e)}',
                'note': 'Make sure GEMINI_API_KEY is valid and has proper permissions'
            }
    
    # List available Gemini models
    @app.route('/llm/models')
    def llm_models():
        try:
            from app.llm.client import is_configured, list_available_models
            
            if not is_configured():
                return {
                    'status': 'error',
                    'message': 'GEMINI_API_KEY not configured'
                }
            
            models = list_available_models()
            return {
                'status': 'success',
                'available_models': models,
                'current_model': 'gemini-2.0-flash',
                'server_port': 8000
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error listing models: {str(e)}'
            }
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    port = int(os.getenv('PORT', 8000))
    app.run(debug=True, host='0.0.0.0', port=port)