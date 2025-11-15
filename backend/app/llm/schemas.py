"""
JSON schemas for all Gemini workflow functions
"""

# Schema for email categorization
categorize_schema = {
    "type": "object",
    "properties": {
        "category": {"type": "string"},
        "priority_score": {"type": "number"},
        "tone": {"type": "string"},
        "summary": {"type": "string"},
        "hidden_intent": {"type": "string"}
    },
    "required": ["category", "priority_score", "tone", "summary"]
}

# Schema for thread summarization
summarize_thread_schema = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "key_points": {"type": "array", "items": {"type": "string"}},
        "latest_student_question": {"type": "string"}
    },
    "required": ["summary"]
}

# Schema for reply generation
generate_reply_schema = {
    "type": "object",
    "properties": {
        "draft": {"type": "string"},
        "reasoning": {"type": "string"}
    },
    "required": ["draft"]
}

# Schema for daily digest
daily_digest_schema = {
    "type": "object",
    "properties": {
        "digest": {"type": "string"}
    },
    "required": ["digest"]
}

# Schema for inbox search (RAG)
search_inbox_schema = {
    "type": "object",
    "properties": {
        "answer": {"type": "string"},
        "sources": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["answer"]
}