from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import anthropic
import json
import numpy as np
from datetime import datetime
from app.models import User, Email, LLMMetadata, Embedding
from app import db
import os

processing_bp = Blueprint('processing', __name__)

# Initialize Claude client
claude_client = anthropic.Anthropic(
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

@processing_bp.route('/classify', methods=['POST'])
@jwt_required()
def classify_email():
    """Classify email using Claude"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        email_id = data.get('email_id')
        if not email_id:
            return jsonify({
                'success': False,
                'error': 'email_id required'
            }), 400
        
        # Get email
        email = Email.query.filter_by(
            id=email_id,
            user_id=user_id
        ).first()
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email not found'
            }), 404
        
        # Get user for context
        user = User.query.get(user_id)
        
        # Build classification prompt
        classification_prompt = f"""
        You are an AI assistant helping a professor manage their email inbox. 
        
        Professor's Context:
        - Name: {user.name}
        - Preferred tone: {user.tone_profile}
        - Course policies: {user.course_policies or "Not specified"}
        
        Email to classify:
        Subject: {email.subject}
        From: {email.sender_name} <{email.sender_email}>
        Content: {email.body_content}
        
        Please analyze this email and provide a JSON response with the following fields:
        {{
            "category": "one of: clarification, extension_request, grade_dispute, emergency, logistics, honor_code_concern, general_question, other",
            "urgency": "one of: low, medium, high, critical",
            "urgency_score": "float between 0.0 and 1.0",
            "honor_code_risk": "boolean - true if there are signs of academic dishonesty",
            "risk_score": "float between 0.0 and 1.0 for honor code risk",
            "student_emotion": "detected emotional state: stressed, confused, angry, frustrated, neutral, excited, etc.",
            "tone_detected": "formal, casual, urgent, polite, demanding, etc.",
            "summary": "2-3 sentence summary of the email",
            "key_points": ["array", "of", "key", "points"],
            "action_items": ["array", "of", "required", "actions"],
            "risk_explanation": "explanation if honor_code_risk is true, null otherwise"
        }}
        
        Be thorough but concise. Focus on academic context and student needs.
        """
        
        start_time = datetime.utcnow()
        
        # Call Claude
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": classification_prompt}
            ]
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Parse Claude's response
        try:
            classification_result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            # Fallback parsing or default values
            classification_result = {
                "category": "other",
                "urgency": "medium",
                "urgency_score": 0.5,
                "honor_code_risk": False,
                "risk_score": 0.0,
                "student_emotion": "neutral",
                "tone_detected": "formal",
                "summary": "Email classification failed - manual review needed",
                "key_points": ["Classification error"],
                "action_items": ["Manual review required"],
                "risk_explanation": None
            }
        
        # Store or update LLM metadata
        llm_metadata = LLMMetadata.query.filter_by(email_id=email_id).first()
        if not llm_metadata:
            llm_metadata = LLMMetadata(email_id=email_id)
            db.session.add(llm_metadata)
        
        # Update fields
        llm_metadata.category = classification_result.get('category')
        llm_metadata.urgency = classification_result.get('urgency')
        llm_metadata.urgency_score = classification_result.get('urgency_score')
        llm_metadata.honor_code_risk = classification_result.get('honor_code_risk', False)
        llm_metadata.risk_score = classification_result.get('risk_score', 0.0)
        llm_metadata.student_emotion = classification_result.get('student_emotion')
        llm_metadata.tone_detected = classification_result.get('tone_detected')
        llm_metadata.summary = classification_result.get('summary')
        llm_metadata.key_points = classification_result.get('key_points')
        llm_metadata.action_items = classification_result.get('action_items')
        llm_metadata.risk_explanation = classification_result.get('risk_explanation')
        llm_metadata.claude_model_used = "claude-3-haiku-20240307"
        llm_metadata.processing_time_ms = int(processing_time)
        
        # Mark email as processed
        email.processed = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'classification': classification_result,
            'processing_time_ms': int(processing_time),
            'message': 'Email classified successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Classification error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Classification failed',
            'message': str(e)
        }), 500

@processing_bp.route('/draft', methods=['POST'])
@jwt_required()
def generate_draft_reply():
    """Generate draft reply using Claude"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        email_id = data.get('email_id')
        if not email_id:
            return jsonify({
                'success': False,
                'error': 'email_id required'
            }), 400
        
        # Get email and its metadata
        email = db.session.query(Email).filter_by(
            id=email_id,
            user_id=user_id
        ).first()
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email not found'
            }), 404
        
        # Get user and LLM metadata
        user = User.query.get(user_id)
        llm_metadata = LLMMetadata.query.filter_by(email_id=email_id).first()
        
        # Build draft generation prompt
        draft_prompt = f"""
        You are an AI assistant helping Professor {user.name} draft email replies to students.
        
        Professor's Preferences:
        - Tone: {user.tone_profile} (professional, friendly, formal)
        - Reply length: {user.reply_length} (short, medium, long)
        - Course policies: {user.course_policies or "Standard academic policies apply"}
        - Signature: {user.signature or "Best regards, Professor " + user.name}
        
        Student's Email:
        Subject: {email.subject}
        From: {email.sender_name} <{email.sender_email}>
        Content: {email.body_content}
        
        Email Analysis (if available):
        {f'''
        - Category: {llm_metadata.category}
        - Urgency: {llm_metadata.urgency}
        - Student emotion: {llm_metadata.student_emotion}
        - Summary: {llm_metadata.summary}
        - Key points: {llm_metadata.key_points}
        - Action items: {llm_metadata.action_items}
        ''' if llm_metadata else "No analysis available"}
        
        Please generate a helpful, appropriate email reply that:
        1. Acknowledges the student's concerns
        2. Addresses their questions or requests
        3. Maintains the professor's preferred tone
        4. Follows academic best practices
        5. Includes relevant policy information if applicable
        6. Ends with the professor's signature
        
        Reply length should be {user.reply_length}. Make it warm but professional.
        
        Provide your response as a JSON object with these fields:
        {{
            "subject": "Reply subject line (starting with Re: if appropriate)",
            "draft_reply": "The complete email reply text",
            "confidence": "float between 0.0 and 1.0 indicating confidence in the response",
            "suggestions": ["array", "of", "additional", "suggestions", "for", "the", "professor"],
            "requires_attention": "boolean - true if this needs special professor attention"
        }}
        """
        
        start_time = datetime.utcnow()
        
        # Call Claude
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1500,
            messages=[
                {"role": "user", "content": draft_prompt}
            ]
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Parse response
        try:
            draft_result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            draft_result = {
                "subject": f"Re: {email.subject}",
                "draft_reply": "I apologize, but I encountered an error generating your reply. Please draft this response manually.",
                "confidence": 0.1,
                "suggestions": ["Manual drafting required due to processing error"],
                "requires_attention": True
            }
        
        # Store draft in metadata
        if llm_metadata:
            llm_metadata.draft_reply = draft_result.get('draft_reply')
            llm_metadata.reply_confidence = draft_result.get('confidence', 0.5)
        else:
            # Create new metadata record
            llm_metadata = LLMMetadata(
                email_id=email_id,
                draft_reply=draft_result.get('draft_reply'),
                reply_confidence=draft_result.get('confidence', 0.5),
                claude_model_used="claude-3-haiku-20240307",
                processing_time_ms=int(processing_time)
            )
            db.session.add(llm_metadata)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'draft': draft_result,
            'processing_time_ms': int(processing_time),
            'message': 'Draft reply generated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Draft generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Draft generation failed',
            'message': str(e)
        }), 500

@processing_bp.route('/search', methods=['POST'])
@jwt_required()
def search_emails():
    """Semantic search across emails using embeddings"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        query = data.get('query', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query required'
            }), 400
        
        # For now, implement simple text search
        # In production, you'd want to use proper vector embeddings
        
        # Search in email content and metadata
        emails = db.session.query(Email).join(
            LLMMetadata, Email.id == LLMMetadata.email_id, isouter=True
        ).filter(
            Email.user_id == user_id,
            db.or_(
                Email.subject.ilike(f'%{query}%'),
                Email.body_content.ilike(f'%{query}%'),
                LLMMetadata.summary.ilike(f'%{query}%')
            )
        ).limit(20).all()
        
        search_results = []
        for email in emails:
            result = email.to_dict()
            # Add relevance score (simplified)
            relevance = 0.5  # Placeholder
            if query.lower() in email.subject.lower():
                relevance += 0.3
            if query.lower() in email.body_content.lower():
                relevance += 0.2
            
            result['relevance'] = min(relevance, 1.0)
            search_results.append(result)
        
        # Sort by relevance
        search_results.sort(key=lambda x: x['relevance'], reverse=True)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': search_results,
            'total_results': len(search_results),
            'message': f'Found {len(search_results)} relevant emails'
        })
        
    except Exception as e:
        current_app.logger.error(f"Search error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Search failed',
            'message': str(e)
        }), 500

@processing_bp.route('/digest', methods=['POST'])
@jwt_required()
def generate_daily_digest():
    """Generate daily digest of emails"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get date range (default to today)
        from_date = data.get('from_date', datetime.utcnow().date())
        if isinstance(from_date, str):
            from_date = datetime.fromisoformat(from_date).date()
        
        # Get emails from the specified date
        emails = db.session.query(Email).join(
            LLMMetadata, Email.id == LLMMetadata.email_id, isouter=True
        ).filter(
            Email.user_id == user_id,
            db.func.date(Email.received_at) == from_date
        ).all()
        
        if not emails:
            return jsonify({
                'success': True,
                'digest': {
                    'date': from_date.isoformat(),
                    'total_emails': 0,
                    'summary': 'No emails received on this date.',
                    'categories': {},
                    'urgent_items': [],
                    'action_required': []
                },
                'message': 'No emails to digest'
            })
        
        # Build digest prompt
        email_summaries = []
        for email in emails[:20]:  # Limit for prompt size
            summary = {
                'subject': email.subject,
                'sender': email.sender_name,
                'category': email.llm_metadata.category if email.llm_metadata else 'uncategorized',
                'urgency': email.llm_metadata.urgency if email.llm_metadata else 'unknown',
                'summary': email.llm_metadata.summary if email.llm_metadata else email.body_preview
            }
            email_summaries.append(summary)
        
        digest_prompt = f"""
        Create a daily email digest for Professor {User.query.get(user_id).name}.
        
        Emails received on {from_date}:
        {json.dumps(email_summaries, indent=2)}
        
        Please provide a comprehensive digest as a JSON response with:
        {{
            "summary": "Overall summary of the day's emails (2-3 sentences)",
            "total_emails": {len(emails)},
            "categories": {{
                "category_name": count,
                ...
            }},
            "urgent_items": [
                {{
                    "subject": "subject line",
                    "sender": "sender name", 
                    "reason": "why this is urgent",
                    "suggested_action": "what to do"
                }}
            ],
            "action_required": [
                "List of specific actions needed",
                "Based on student requests"
            ],
            "trends": [
                "Any patterns or trends noticed",
                "Common student concerns"
            ],
            "recommendations": [
                "Suggestions for the professor",
                "Proactive measures to consider"
            ]
        }}
        """
        
        # Call Claude
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": digest_prompt}
            ]
        )
        
        try:
            digest_result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            # Fallback digest
            categories = {}
            for email in emails:
                if email.llm_metadata and email.llm_metadata.category:
                    cat = email.llm_metadata.category
                    categories[cat] = categories.get(cat, 0) + 1
                    
            digest_result = {
                "summary": f"Received {len(emails)} emails today covering various student inquiries and administrative matters.",
                "total_emails": len(emails),
                "categories": categories,
                "urgent_items": [],
                "action_required": ["Review emails manually - digest generation encountered an error"],
                "trends": ["Unable to analyze trends due to processing error"],
                "recommendations": ["Manual review recommended"]
            }
        
        digest_result['date'] = from_date.isoformat()
        
        return jsonify({
            'success': True,
            'digest': digest_result,
            'message': 'Daily digest generated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Digest generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Digest generation failed',
            'message': str(e)
        }), 500

@processing_bp.route('/batch-classify', methods=['POST'])
@jwt_required()
def batch_classify_emails():
    """Classify multiple unprocessed emails"""
    try:
        user_id = get_jwt_identity()
        
        # Get unprocessed emails
        unprocessed_emails = Email.query.filter_by(
            user_id=user_id,
            processed=False
        ).limit(10).all()  # Process in batches
        
        if not unprocessed_emails:
            return jsonify({
                'success': True,
                'processed_count': 0,
                'message': 'No unprocessed emails found'
            })
        
        processed_count = 0
        errors = []
        
        for email in unprocessed_emails:
            try:
                # Call the classify function for each email
                # This is a simplified version - in production you'd want more efficient batching
                classify_result = classify_email_internal(email, user_id)
                if classify_result:
                    processed_count += 1
                else:
                    errors.append(f"Failed to classify email {email.id}")
            except Exception as e:
                errors.append(f"Error classifying email {email.id}: {str(e)}")
                continue
        
        return jsonify({
            'success': True,
            'processed_count': processed_count,
            'total_emails': len(unprocessed_emails),
            'errors': errors,
            'message': f'Processed {processed_count} of {len(unprocessed_emails)} emails'
        })
        
    except Exception as e:
        current_app.logger.error(f"Batch classification error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Batch classification failed',
            'message': str(e)
        }), 500

def classify_email_internal(email, user_id):
    """Internal function to classify a single email"""
    # This is a simplified version of the classify_email function
    # In a real implementation, you'd extract the common logic
    try:
        user = User.query.get(user_id)
        
        # Simple classification without Claude (for demo)
        llm_metadata = LLMMetadata.query.filter_by(email_id=email.id).first()
        if not llm_metadata:
            llm_metadata = LLMMetadata(email_id=email.id)
            db.session.add(llm_metadata)
        
        # Basic classification based on keywords
        subject_lower = email.subject.lower()
        body_lower = email.body_content.lower()
        
        if any(word in subject_lower or word in body_lower for word in ['extension', 'deadline', 'late']):
            llm_metadata.category = 'extension_request'
            llm_metadata.urgency = 'medium'
        elif any(word in subject_lower or word in body_lower for word in ['grade', 'score', 'points']):
            llm_metadata.category = 'grade_dispute'
            llm_metadata.urgency = 'medium'
        elif any(word in subject_lower or word in body_lower for word in ['emergency', 'urgent', 'asap']):
            llm_metadata.category = 'emergency'
            llm_metadata.urgency = 'high'
        else:
            llm_metadata.category = 'general_question'
            llm_metadata.urgency = 'low'
        
        llm_metadata.summary = email.body_preview or email.subject
        llm_metadata.processing_time_ms = 100  # Simulated
        
        email.processed = True
        db.session.commit()
        
        return True
    except Exception:
        db.session.rollback()
        return False