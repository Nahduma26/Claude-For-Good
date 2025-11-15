from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from datetime import datetime, timedelta
from app.models import User, Email, LLMMetadata, SyncStatus
from app import db
import os

emails_bp = Blueprint('emails', __name__)

@emails_bp.route('/', methods=['GET'])
@jwt_required()
def get_emails():
    """Get user's emails with pagination and filtering"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        category = request.args.get('category')
        urgency = request.args.get('urgency')
        unread_only = request.args.get('unread_only', False, type=bool)
        
        # Build query
        query = db.session.query(Email).filter(Email.user_id == user_id)
        
        if unread_only:
            query = query.filter(Email.is_read == False)
        
        # Join with LLM metadata for filtering
        if category or urgency:
            query = query.join(LLMMetadata, Email.id == LLMMetadata.email_id)
            
            if category:
                query = query.filter(LLMMetadata.category == category)
            if urgency:
                query = query.filter(LLMMetadata.urgency == urgency)
        
        # Order by received date (newest first)
        query = query.order_by(Email.received_at.desc())
        
        # Paginate
        emails = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'emails': [email.to_dict() for email in emails.items],
            'pagination': {
                'page': emails.page,
                'pages': emails.pages,
                'per_page': emails.per_page,
                'total': emails.total,
                'has_next': emails.has_next,
                'has_prev': emails.has_prev
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Get emails error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch emails',
            'message': str(e)
        }), 500

@emails_bp.route('/<int:email_id>', methods=['GET'])
@jwt_required()
def get_email(email_id):
    """Get a specific email with full details"""
    try:
        user_id = get_jwt_identity()
        
        email = Email.query.filter_by(
            id=email_id,
            user_id=user_id
        ).first()
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email not found'
            }), 404
        
        return jsonify({
            'success': True,
            'email': email.to_dict()
        })
        
    except Exception as e:
        current_app.logger.error(f"Get email error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch email',
            'message': str(e)
        }), 500

@emails_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_emails():
    """Sync emails from Microsoft Graph"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.access_token:
            return jsonify({
                'success': False,
                'error': 'User not authenticated with Microsoft'
            }), 401
        
        # Check if sync is already in progress
        sync_status = SyncStatus.query.filter_by(user_id=user_id).first()
        if sync_status and sync_status.sync_in_progress:
            return jsonify({
                'success': False,
                'error': 'Sync already in progress'
            }), 409
        
        # Create or update sync status
        if not sync_status:
            sync_status = SyncStatus(user_id=user_id)
            db.session.add(sync_status)
        
        sync_status.sync_in_progress = True
        sync_status.updated_at = datetime.utcnow()
        db.session.commit()
        
        try:
            # Fetch emails from Microsoft Graph
            headers = {'Authorization': f'Bearer {user.access_token}'}
            
            # Build Graph API URL with filters
            graph_url = 'https://graph.microsoft.com/v1.0/me/messages'
            params = {
                '$top': 50,
                '$select': 'id,subject,sender,receivedDateTime,bodyPreview,body,isRead,conversationId',
                '$orderby': 'receivedDateTime desc'
            }
            
            # Use delta token if available for incremental sync
            if sync_status.last_sync_token:
                graph_url = f'https://graph.microsoft.com/v1.0/me/messages/delta'
                params['$deltatoken'] = sync_status.last_sync_token
            
            response = requests.get(graph_url, headers=headers, params=params)
            
            if response.status_code == 401:
                # Token expired, try to refresh
                return jsonify({
                    'success': False,
                    'error': 'Token expired',
                    'requires_refresh': True
                }), 401
            
            if response.status_code != 200:
                raise Exception(f"Graph API error: {response.status_code} - {response.text}")
            
            data = response.json()
            new_emails = 0
            
            # Process emails
            for msg in data.get('value', []):
                # Check if email already exists
                existing_email = Email.query.filter_by(
                    microsoft_message_id=msg['id'],
                    user_id=user_id
                ).first()
                
                if existing_email:
                    continue
                
                # Create new email record
                email = Email(
                    user_id=user_id,
                    microsoft_message_id=msg['id'],
                    subject=msg['subject'],
                    sender_email=msg['sender']['emailAddress']['address'],
                    sender_name=msg['sender']['emailAddress']['name'],
                    body_preview=msg.get('bodyPreview', ''),
                    body_content=msg['body']['content'],
                    received_at=datetime.fromisoformat(
                        msg['receivedDateTime'].replace('Z', '+00:00')
                    ),
                    is_read=msg['isRead'],
                    conversation_id=msg.get('conversationId')
                )
                
                db.session.add(email)
                new_emails += 1
            
            # Update sync status
            sync_status.last_sync_at = datetime.utcnow()
            sync_status.emails_synced += new_emails
            sync_status.sync_in_progress = False
            sync_status.last_error = None
            sync_status.error_count = 0
            
            # Store delta token for next sync
            if '@odata.deltaLink' in data:
                delta_link = data['@odata.deltaLink']
                if '$deltatoken=' in delta_link:
                    sync_status.last_sync_token = delta_link.split('$deltatoken=')[1]
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'new_emails': new_emails,
                'total_emails': sync_status.emails_synced,
                'message': f'Synced {new_emails} new emails'
            })
            
        except Exception as e:
            # Update sync status with error
            sync_status.sync_in_progress = False
            sync_status.last_error = str(e)
            sync_status.error_count += 1
            db.session.commit()
            raise e
        
    except Exception as e:
        current_app.logger.error(f"Email sync error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Email sync failed',
            'message': str(e)
        }), 500

@emails_bp.route('/<int:email_id>/mark-read', methods=['POST'])
@jwt_required()
def mark_email_read(email_id):
    """Mark email as read"""
    try:
        user_id = get_jwt_identity()
        
        email = Email.query.filter_by(
            id=email_id,
            user_id=user_id
        ).first()
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email not found'
            }), 404
        
        email.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Email marked as read'
        })
        
    except Exception as e:
        current_app.logger.error(f"Mark read error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to mark email as read',
            'message': str(e)
        }), 500

@emails_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_email_categories():
    """Get available email categories with counts"""
    try:
        user_id = get_jwt_identity()
        
        # Query categories with counts
        categories = db.session.query(
            LLMMetadata.category,
            db.func.count(LLMMetadata.id).label('count')
        ).join(
            Email, LLMMetadata.email_id == Email.id
        ).filter(
            Email.user_id == user_id
        ).group_by(
            LLMMetadata.category
        ).all()
        
        category_data = [
            {
                'category': cat.category,
                'count': cat.count
            }
            for cat in categories if cat.category
        ]
        
        return jsonify({
            'success': True,
            'categories': category_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Get categories error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch categories',
            'message': str(e)
        }), 500

@emails_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_email_stats():
    """Get email statistics dashboard"""
    try:
        user_id = get_jwt_identity()
        
        # Total emails
        total_emails = Email.query.filter_by(user_id=user_id).count()
        
        # Unread emails
        unread_emails = Email.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count()
        
        # Processed emails
        processed_emails = Email.query.filter_by(
            user_id=user_id,
            processed=True
        ).count()
        
        # Urgent emails
        urgent_emails = db.session.query(Email).join(
            LLMMetadata, Email.id == LLMMetadata.email_id
        ).filter(
            Email.user_id == user_id,
            LLMMetadata.urgency.in_(['high', 'critical'])
        ).count()
        
        # Honor code risks
        risk_emails = db.session.query(Email).join(
            LLMMetadata, Email.id == LLMMetadata.email_id
        ).filter(
            Email.user_id == user_id,
            LLMMetadata.honor_code_risk == True
        ).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_emails': total_emails,
                'unread_emails': unread_emails,
                'processed_emails': processed_emails,
                'urgent_emails': urgent_emails,
                'risk_emails': risk_emails,
                'processing_rate': (processed_emails / total_emails * 100) if total_emails > 0 else 0
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Get stats error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch statistics',
            'message': str(e)
        }), 500