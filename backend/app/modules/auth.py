from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import msal
import os
from datetime import datetime, timedelta
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)

# Microsoft Graph OAuth configuration
CLIENT_ID = os.getenv('MICROSOFT_CLIENT_ID')
CLIENT_SECRET = os.getenv('MICROSOFT_CLIENT_SECRET')
TENANT_ID = os.getenv('MICROSOFT_TENANT_ID', 'common')
REDIRECT_URI = os.getenv('MICROSOFT_REDIRECT_URI', 'http://localhost:8000/auth/callback')

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ['User.Read', 'Mail.Read', 'Mail.Send']

@auth_bp.route('/login', methods=['GET'])
def login():
    """Initiate Microsoft OAuth flow"""
    try:
        # Create MSAL app
        msal_app = msal.ConfidentialClientApplication(
            CLIENT_ID,
            authority=AUTHORITY,
            client_credential=CLIENT_SECRET
        )
        
        # Generate authorization URL
        auth_url = msal_app.get_authorization_request_url(
            SCOPES,
            redirect_uri=REDIRECT_URI,
            state=request.args.get('state', 'default_state')
        )
        
        return jsonify({
            'success': True,
            'auth_url': auth_url,
            'message': 'Redirect to this URL to authenticate with Microsoft'
        })
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to initiate authentication',
            'message': str(e)
        }), 500

@auth_bp.route('/callback', methods=['GET'])
def callback():
    """Handle Microsoft OAuth callback"""
    try:
        # Get authorization code from callback
        code = request.args.get('code')
        if not code:
            return jsonify({
                'success': False,
                'error': 'Authorization code not received'
            }), 400
        
        # Create MSAL app
        msal_app = msal.ConfidentialClientApplication(
            CLIENT_ID,
            authority=AUTHORITY,
            client_credential=CLIENT_SECRET
        )
        
        # Exchange code for token
        result = msal_app.acquire_token_by_authorization_code(
            code,
            scopes=SCOPES,
            redirect_uri=REDIRECT_URI
        )
        
        if 'error' in result:
            current_app.logger.error(f"Token exchange error: {result}")
            return jsonify({
                'success': False,
                'error': 'Token exchange failed',
                'message': result.get('error_description', 'Unknown error')
            }), 400
        
        # Get user info from Microsoft Graph
        access_token = result['access_token']
        headers = {'Authorization': f'Bearer {access_token}'}
        
        user_info_response = requests.get(
            'https://graph.microsoft.com/v1.0/me',
            headers=headers
        )
        
        if user_info_response.status_code != 200:
            return jsonify({
                'success': False,
                'error': 'Failed to fetch user information'
            }), 400
        
        user_info = user_info_response.json()
        
        # Find or create user
        user = User.query.filter_by(
            microsoft_user_id=user_info['id']
        ).first()
        
        if not user:
            user = User(
                email=user_info['mail'] or user_info['userPrincipalName'],
                name=user_info['displayName'],
                microsoft_user_id=user_info['id']
            )
            db.session.add(user)
        else:
            # Update existing user info
            user.email = user_info['mail'] or user_info['userPrincipalName']
            user.name = user_info['displayName']
            user.updated_at = datetime.utcnow()
        
        # Store tokens (in production, these should be encrypted)
        user.access_token = access_token
        user.refresh_token = result.get('refresh_token')
        
        if 'expires_in' in result:
            user.token_expires_at = datetime.utcnow() + timedelta(
                seconds=result['expires_in']
            )
        
        db.session.commit()
        
        # Create JWT token for our app
        jwt_token = create_access_token(
            identity=user.id,
            additional_claims={
                'email': user.email,
                'name': user.name
            }
        )
        
        return jsonify({
            'success': True,
            'token': jwt_token,
            'user': user.to_dict(),
            'message': 'Authentication successful'
        })
        
    except Exception as e:
        current_app.logger.error(f"Callback error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Authentication failed',
            'message': str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        current_app.logger.error(f"Get user error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch user information',
            'message': str(e)
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_microsoft_token():
    """Refresh Microsoft access token"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.refresh_token:
            return jsonify({
                'success': False,
                'error': 'Refresh token not available'
            }), 400
        
        # Create MSAL app
        msal_app = msal.ConfidentialClientApplication(
            CLIENT_ID,
            authority=AUTHORITY,
            client_credential=CLIENT_SECRET
        )
        
        # Refresh token
        result = msal_app.acquire_token_by_refresh_token(
            user.refresh_token,
            scopes=SCOPES
        )
        
        if 'error' in result:
            return jsonify({
                'success': False,
                'error': 'Token refresh failed',
                'message': result.get('error_description', 'Unknown error')
            }), 400
        
        # Update stored tokens
        user.access_token = result['access_token']
        if 'refresh_token' in result:
            user.refresh_token = result['refresh_token']
        
        if 'expires_in' in result:
            user.token_expires_at = datetime.utcnow() + timedelta(
                seconds=result['expires_in']
            )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Token refreshed successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to refresh token',
            'message': str(e)
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user and clear tokens"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user:
            # Clear tokens (optional - tokens will expire anyway)
            user.access_token = None
            user.refresh_token = None
            user.token_expires_at = None
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Logout failed',
            'message': str(e)
        }), 500