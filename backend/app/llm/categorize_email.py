"""
Email categorization workflow using Gemini
"""
import json
import google.generativeai as genai
from .client import get_model
from .schemas import categorize_schema


def categorize_email(email_text: str, thread_context: str = None, preferences: str = None) -> dict:
    """
    Categorize a student email using semantic analysis
    
    Args:
        email_text: The email content to categorize
        thread_context: Optional context from previous emails in thread
        preferences: Optional professor preferences for categorization
    
    Returns:
        Dictionary with category, priority_score, tone, summary, and hidden_intent
    """
    model = get_model()
    
    # Build the prompt
    prompt = f"""
    You are an AI assistant helping a professor categorize student emails. Analyze the following email and provide a structured response.

    Email to analyze:
    {email_text}
    
    {f"Thread context: {thread_context}" if thread_context else ""}
    {f"Professor preferences: {preferences}" if preferences else ""}
    
    Please categorize this email with the following guidelines:
    
    Categories (choose one):
    - academic_question: Student asking about course content, assignments, concepts
    - administrative: Questions about grades, deadlines, course logistics
    - technical_issue: Problems with course platform, submission issues
    - personal_matter: Extensions, accommodations, personal circumstances
    - appointment_request: Office hours, meeting requests
    - clarification: Seeking clarification on instructions or requirements
    - complaint: Issues with course, grading, or policies
    - other: Doesn't fit other categories
    
    Priority Score (1-10):
    - 1-3: Low priority (general questions, non-urgent)
    - 4-6: Medium priority (assignment help, clarifications)
    - 7-8: High priority (deadline issues, important questions)
    - 9-10: Critical priority (emergencies, urgent academic matters)
    
    Tone (choose one):
    - professional: Formal, respectful tone
    - casual: Informal but appropriate
    - concerned: Worried or anxious tone
    - frustrated: Signs of frustration or dissatisfaction
    - urgent: Conveying urgency or time pressure
    - confused: Unclear or seeking understanding
    
    Provide a brief summary and identify any hidden intent or underlying concerns.
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=categorize_schema
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        # Return a fallback response if Gemini fails
        return {
            "category": "other",
            "priority_score": 5,
            "tone": "professional", 
            "summary": f"Email categorization failed: {str(e)}",
            "hidden_intent": "Unable to determine"
        }