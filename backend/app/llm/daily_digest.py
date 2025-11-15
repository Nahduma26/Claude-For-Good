"""
Daily digest generation workflow using Gemini
"""
import json
import google.generativeai as genai
from .client import get_model
from .schemas import daily_digest_schema


def daily_digest(digest_inputs: list[str]) -> dict:
    """
    Generate a daily digest of all messages for the professor
    
    Args:
        digest_inputs: List of email summaries, categories, and key information
    
    Returns:
        Dictionary with comprehensive daily digest
    """
    model = get_model()
    
    # Build the prompt
    prompt = f"""
    You are an AI assistant creating a daily email digest for a professor. Summarize all the day's student communications into a comprehensive overview.

    Today's email data:
    {chr(10).join(digest_inputs)}
    
    Please create a daily digest that includes:
    1. Overview summary of the day's communications
    2. Breakdown by category (academic questions, administrative, etc.)
    3. High priority items that need immediate attention
    4. Common themes or recurring questions
    5. Suggested actions for the professor
    6. Statistics (total emails, categories, priority distribution)
    
    Format the digest to be:
    - Professional and organized
    - Easy to scan quickly
    - Actionable with clear next steps
    - Highlighting urgent matters at the top
    - Including relevant metrics and trends
    
    The digest should help the professor quickly understand what happened today and what requires their attention.
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=daily_digest_schema
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        # Return a fallback response if Gemini fails
        return {
            "digest": f"Daily digest generation failed: {str(e)}. Please review individual emails manually."
        }