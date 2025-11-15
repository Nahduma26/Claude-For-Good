"""
Daily digest generation workflow using Gemini
"""

import json
import google.generativeai as genai
from .client import get_model
from .schemas import daily_digest_schema


def daily_digest(digest_inputs: list[str]) -> dict:
    """
    Generate a daily digest of all messages for the professor.

    Args:
        digest_inputs: List of string summaries or JSON-like strings for each email

    Returns:
        dict containing:
            - summary (str)
            - categories (dict)
            - high_priority (list)
            - common_themes (list)
            - recommendations (list)
            - statistics (dict)
    """

    model = get_model()

    # Join entries safely into a block
    formatted_inputs = "\n".join(f"- {item}" for item in digest_inputs)

    prompt = f"""
    You are an AI assistant generating a professional daily digest for a university professor.

    Below is a list of student email summaries and metadata from today:

    {formatted_inputs}

    Produce a comprehensive JSON digest with the following fields:

    {{
        "summary": string,                               # High-level overview
        "categories": {{                                 # Counts or lists per category
            "<category>": int
        }},
        "high_priority": [string],                       # Items requiring immediate attention
        "common_themes": [string],                       # Repeated issues/questions
        "recommendations": [string],                     # Actionable next steps
        "statistics": {{
            "total_emails": int,
            "priority_distribution": {{
                "low": int,
                "medium": int,
                "high": int
            }}
        }}
    }}

    Guidelines:
    - Be professional, concise, and actionable.
    - Highlight urgent matters clearly.
    - Identify patterns from recurring student messages.
    - Provide useful next steps for the professor.
    - Ensure all JSON fields are present and valid.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=daily_digest_schema,
            ),
        )

        return json.loads(response.text)

    except Exception as e:
        return {
            "summary": "Daily digest generation failed.",
            "error": str(e),
            "recommendations": [
                "Review the individual emails manually.",
                "Retry digest generation once the LLM is available."
            ]
        }
