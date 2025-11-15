"""
Thread summarization workflow using Gemini
"""
import json
import google.generativeai as genai
from .client import get_model
from .schemas import summarize_thread_schema


def summarize_thread(thread_text: str) -> dict:
    """
    Summarize an entire email thread
    
    Args:
        thread_text: Complete email thread text with all messages
    
    Returns:
        Dictionary with summary, key_points, and latest_student_question
    """
    model = get_model()
    
    # Build the prompt
    prompt = f"""
    You are an AI assistant helping a professor understand email threads. Analyze the following email thread and provide a structured summary.

    Email thread:
    {thread_text}
    
    Please provide:
    1. A concise summary of the entire conversation
    2. Key points or decisions made in the thread
    3. The latest question or request from the student (if any)
    
    Guidelines:
    - Keep the summary under 200 words
    - Extract 3-5 key points maximum
    - Focus on actionable items and important information
    - Identify what the student is currently asking for or needs
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=summarize_thread_schema
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        # Return a fallback response if Gemini fails
        return {
            "summary": f"Thread summarization failed: {str(e)}",
            "key_points": ["Unable to extract key points"],
            "latest_student_question": "Unable to determine latest question"
        }