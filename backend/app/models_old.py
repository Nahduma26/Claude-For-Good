from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# This will be initialized from app.py
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    microsoft_user_id = db.Column(db.String(255), unique=True, nullable=False)
    refresh_token = db.Column(db.Text, nullable=True)  # Encrypted
    access_token = db.Column(db.Text, nullable=True)   # Encrypted
    token_expires_at = Column(DateTime, nullable=True)
    
    # Preferences
    tone_profile = Column(String(50), default='professional')  # professional, friendly, formal
    reply_length = Column(String(20), default='medium')       # short, medium, long
    auto_reply_enabled = Column(Boolean, default=False)
    
    # Course policies and context
    course_policies = Column(Text, nullable=True)
    signature = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    emails = relationship("Email", back_populates="user")
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'tone_profile': self.tone_profile,
            'reply_length': self.reply_length,
            'auto_reply_enabled': self.auto_reply_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Email(Base):
    __tablename__ = 'emails'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    microsoft_message_id = Column(String(255), unique=True, nullable=False)
    
    # Email metadata
    subject = Column(String(500), nullable=False)
    sender_email = Column(String(255), nullable=False)
    sender_name = Column(String(255), nullable=True)
    body_preview = Column(Text, nullable=True)
    body_content = Column(Text, nullable=False)
    received_at = Column(DateTime, nullable=False)
    is_read = Column(Boolean, default=False)
    
    # Threading
    conversation_id = Column(String(255), nullable=True)
    thread_id = Column(String(255), nullable=True)
    
    # Processing status
    processed = Column(Boolean, default=False)
    processing_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="emails")
    llm_metadata = relationship("LLMMetadata", back_populates="email", uselist=False)
    embeddings = relationship("Embedding", back_populates="email")
    
    def to_dict(self):
        return {
            'id': self.id,
            'microsoft_message_id': self.microsoft_message_id,
            'subject': self.subject,
            'sender_email': self.sender_email,
            'sender_name': self.sender_name,
            'body_preview': self.body_preview,
            'body_content': self.body_content,
            'received_at': self.received_at.isoformat() if self.received_at else None,
            'is_read': self.is_read,
            'processed': self.processed,
            'llm_metadata': self.llm_metadata.to_dict() if self.llm_metadata else None
        }

class LLMMetadata(Base):
    __tablename__ = 'llm_metadata'
    
    id = Column(Integer, primary_key=True)
    email_id = Column(Integer, ForeignKey('emails.id'), nullable=False, unique=True)
    
    # Classification results
    category = Column(String(50), nullable=True)  # clarification, extension_request, emergency, etc.
    urgency = Column(String(20), nullable=True)   # low, medium, high, critical
    urgency_score = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # Risk detection
    honor_code_risk = Column(Boolean, default=False)
    risk_score = Column(Float, nullable=True)     # 0.0 to 1.0
    risk_explanation = Column(Text, nullable=True)
    
    # Emotional analysis
    student_emotion = Column(String(30), nullable=True)  # stressed, confused, angry, etc.
    tone_detected = Column(String(30), nullable=True)    # formal, casual, urgent, etc.
    
    # Content analysis
    summary = Column(Text, nullable=True)
    key_points = Column(JSON, nullable=True)      # List of key points
    action_items = Column(JSON, nullable=True)    # List of required actions
    
    # Reply generation
    draft_reply = Column(Text, nullable=True)
    reply_confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # Metadata
    claude_model_used = Column(String(50), nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    email = relationship("Email", back_populates="llm_metadata")
    
    def to_dict(self):
        return {
            'id': self.id,
            'email_id': self.email_id,
            'category': self.category,
            'urgency': self.urgency,
            'urgency_score': self.urgency_score,
            'honor_code_risk': self.honor_code_risk,
            'risk_score': self.risk_score,
            'student_emotion': self.student_emotion,
            'summary': self.summary,
            'key_points': self.key_points,
            'action_items': self.action_items,
            'draft_reply': self.draft_reply,
            'reply_confidence': self.reply_confidence,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Embedding(Base):
    __tablename__ = 'embeddings'
    
    id = Column(Integer, primary_key=True)
    email_id = Column(Integer, ForeignKey('emails.id'), nullable=False)
    
    # Vector data
    embedding_vector = Column(JSON, nullable=False)  # Store as JSON array
    chunk_text = Column(Text, nullable=False)        # The text that was embedded
    chunk_index = Column(Integer, default=0)         # For long emails split into chunks
    
    # Metadata
    embedding_model = Column(String(50), nullable=True)  # claude-3-haiku, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    email = relationship("Email", back_populates="embeddings")
    
    def to_dict(self):
        return {
            'id': self.id,
            'email_id': self.email_id,
            'chunk_text': self.chunk_text[:200] + '...' if len(self.chunk_text) > 200 else self.chunk_text,
            'chunk_index': self.chunk_index,
            'embedding_model': self.embedding_model,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Template(Base):
    __tablename__ = 'templates'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # extension_response, clarification_response, etc.
    template_text = Column(Text, nullable=False)
    
    is_default = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'template_text': self.template_text,
            'is_default': self.is_default,
            'usage_count': self.usage_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SyncStatus(Base):
    __tablename__ = 'sync_status'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    last_sync_at = Column(DateTime, nullable=True)
    last_sync_token = Column(Text, nullable=True)  # Microsoft Graph delta token
    emails_synced = Column(Integer, default=0)
    sync_in_progress = Column(Boolean, default=False)
    
    # Error tracking
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'emails_synced': self.emails_synced,
            'sync_in_progress': self.sync_in_progress,
            'error_count': self.error_count
        }