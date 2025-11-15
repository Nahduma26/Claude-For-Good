"""
Reply generation workflow using Gemini
"""
import json
import google.generativeai as genai
from .client import get_model
from .schemas import generate_reply_schema


def generate_reply(email_text: str, category: str, policies: str, professor_tone: str, thread_summary: str) -> dict:
    """
    Generate a policy-aware, tone-aligned draft reply
    
    Args:
        email_text: The original email to reply to
        category: Email category from categorization
        policies: Course policies and guidelines
        professor_tone: Preferred tone (professional, friendly, formal)
        thread_summary: Summary of previous thread context
    
    Returns:
        Dictionary with draft reply and reasoning
    """
    model = get_model()
    
    # Build the prompt
    prompt = f"""
    You are an AI assistant helping a professor write email replies to students. Generate a professional, helpful response.

    Original email:
    {email_text}
    
    Email category: {category}
    Course policies: {policies}
    Professor's preferred tone: {professor_tone}
    Thread context: {thread_summary}
    
    Guidelines for the reply:
    - Be {professor_tone} in tone
    - Reference relevant course policies when applicable
    - Provide clear, actionable guidance
    - Be encouraging and supportive
    - Keep the response concise but comprehensive
    - If it's a question, provide a direct answer
    - If it's a request, clearly state next steps
    - Sign off appropriately for an academic context
    
    Based on the category "{category}":
    - academic_question: Provide educational guidance and point to resources
    - administrative: Reference policies and provide clear procedures
    - technical_issue: Offer troubleshooting steps or direct to support
    - personal_matter: Show empathy and provide accommodation options
    - appointment_request: Suggest times or direct to scheduling system
    - clarification: Provide clear, detailed explanations
    - complaint: Address concerns professionally and offer solutions
    
    Please generate a draft reply and explain your reasoning for the approach taken.
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=generate_reply_schema
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        # Return a fallback response if Gemini fails
        return {
            "draft": f"Thank you for your email. I'll review your message and get back to you soon. (Reply generation failed: {str(e)})",
            "reasoning": "Fallback response due to generation error"
        }