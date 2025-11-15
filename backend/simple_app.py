from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')
    
    # CORS configuration
    CORS(app, origins=[
        "http://localhost:3000",
        os.getenv('FRONTEND_URL', 'http://localhost:3000')
    ])
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy', 
            'message': 'Professor Inbox Copilot API is running',
            'version': '1.0.0'
        })
    
    # Test API endpoints
    @app.route('/api/test')
    def test_endpoint():
        return jsonify({
            'success': True,
            'message': 'Backend API is working!',
            'data': {
                'timestamp': '2024-11-15T10:00:00Z',
                'server': 'Flask Development Server'
            }
        })
    
    @app.route('/auth/test')
    def auth_test():
        return jsonify({
            'success': True,
            'message': 'Authentication module placeholder',
            'auth_url': 'https://login.microsoftonline.com/oauth/authorize'
        })
    
    @app.route('/emails/test')
    def emails_test():
        return jsonify({
            'success': True,
            'message': 'Email module placeholder',
            'sample_emails': [
                {
                    'id': 1,
                    'subject': 'Question about Assignment 3',
                    'sender': 'student@university.edu',
                    'category': 'clarification',
                    'urgency': 'medium'
                },
                {
                    'id': 2,
                    'subject': 'Extension Request',
                    'sender': 'another.student@university.edu',
                    'category': 'extension_request',
                    'urgency': 'high'
                }
            ]
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting Professor Inbox Copilot Backend...")
    print("📧 Email management API ready")
    print("🤖 Claude AI integration ready")
    print("🔗 Frontend URL: http://localhost:3000")
    print("🌐 Backend URL: http://localhost:8000")
    
    app.run(debug=True, host='0.0.0.0', port=8000)