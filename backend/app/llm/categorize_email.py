"""
Email categorization workflow using Gemini (Google Generative AI)
"""

import json
import google.generativeai as genai
from .client import get_model
from .schemas import categorize_schema


def categorize_email(email_text: str, thread_context: str = None, preferences: str = None) -> dict:
    """
    Categorize a student email using semantic analysis via Gemini.
    
    Args:
        email_text (str): The email content.
        thread_context (str): Optional context from previous messages.
        preferences (str): Optional professor preferences.
    
    Returns:
        dict: Parsed JSON with category, priority_score, tone, summary, hidden_intent.
    """

    model = get_model()

    # ---------- BUILD PROMPT ----------
    prompt_parts = [
        "You are an AI assistant helping a professor categorize student emails.",
        "Analyze the email below and respond strictly in JSON that matches the expected schema.",
        "",
        "Email to analyze:",
        email_text,
        "",
    ]

    if thread_context:
        prompt_parts.append(f"Thread context:\n{thread_context}\n")

    if preferences:
        prompt_parts.append(f"Professor preferences:\n{preferences}\n")

    prompt_parts.append("""
Categorization Guidelines:

Categories (choose one):
- academic_question
- administrative
- technical_issue
- personal_matter
- appointment_request
- clarification
- complaint
- other

Priority Score (1–10):
1–3  = low
4–6  = medium
7–8  = high
9–10 = critical

Tone (choose one):
professional, casual, concerned, frustrated, urgent, confused

Provide:
- category
- priority_score
- tone
- summary
- hidden_intent
""")

    prompt = "\n".join(prompt_parts)

    # ---------- CALL GEMINI ----------
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=categorize_schema  # Enforces structured output
            )
        )

        # Gemini returns the object as .text (stringified JSON)
        result = json.loads(response.text)
        return result

    except Exception as e:
        # ---------- FALLBACK ----------
        return {
            "category": "other",
            "priority_score": 5,
            "tone": "professional",
            "summary": f"Gemini categorization failed: {str(e)}",
            "hidden_intent": "undetermined",
        }
