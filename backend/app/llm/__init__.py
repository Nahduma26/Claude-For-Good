"""
LLM module for Professor Inbox Copilot - Gemini-powered workflows
"""

from .categorize_email import categorize_email
from .summarize_thread import summarize_thread
from .generate_reply import generate_reply
from .daily_digest import daily_digest
from .search_inbox import search_inbox

__all__ = [
    'categorize_email',
    'summarize_thread', 
    'generate_reply',
    'daily_digest',
    'search_inbox'
]