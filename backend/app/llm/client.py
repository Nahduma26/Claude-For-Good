"""
Gemini client configuration and model initialization for Professor Inbox Copilot
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

# Retrieve API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "❌ GEMINI_API_KEY not found. "
        "Please add to your .env file:\n\n  GEMINI_API_KEY=your_key_here\n"
    )

# Configure SDK
genai.configure(api_key=api_key)

# ---------------------------
# Preferred model for backend
# ---------------------------
DEFAULT_MODEL_NAME = "gemini-2.0-flash"   # Fast & cheap for production
# Alternate option: "gemini-2.0-pro"     # Slower, more accurate


# Create a reusable model instance
_model_instance = genai.GenerativeModel(DEFAULT_MODEL_NAME)


def get_model():
    """
    Retrieve the configured Gemini model instance.
    Safe to call repeatedly — returns a cached object.
    """
    return _model_instance


def is_configured() -> bool:
    """
    Verify that Gemini can be used (API key present and non-empty).
    """
    return bool(api_key)


def list_available_models():
    """
    Return a list of available Gemini models that support text generation.
    Filters to only models supporting generateContent.
    """
    try:
        models = genai.list_models()
        usable = [
            m.name
            for m in models
            if hasattr(m, "supported_generation_methods")
            and "generateContent" in m.supported_generation_methods
        ]
        return sorted(usable)
    except Exception as e:
        return [f"Error listing models: {str(e)}"]
"""
Gemini client configuration and model initialization for Professor Inbox Copilot
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

# Retrieve API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "❌ GEMINI_API_KEY not found. "
        "Please add to your .env file:\n\n  GEMINI_API_KEY=your_key_here\n"
    )

# Configure SDK
genai.configure(api_key=api_key)

# ---------------------------
# Preferred model for backend
# ---------------------------
DEFAULT_MODEL_NAME = "gemini-2.0-flash"   # Fast & cheap for production
# Alternate option: "gemini-2.0-pro"     # Slower, more accurate


# Create a reusable model instance
_model_instance = genai.GenerativeModel(DEFAULT_MODEL_NAME)


def get_model():
    """
    Retrieve the configured Gemini model instance.
    Safe to call repeatedly — returns a cached object.
    """
    return _model_instance


def is_configured() -> bool:
    """
    Verify that Gemini can be used (API key present and non-empty).
    """
    return bool(api_key)


def list_available_models():
    """
    Return a list of available Gemini models that support text generation.
    Filters to only models supporting generateContent.
    """
    try:
        models = genai.list_models()
        usable = [
            m.name
            for m in models
            if hasattr(m, "supported_generation_methods")
            and "generateContent" in m.supported_generation_methods
        ]
        return sorted(usable)
    except Exception as e:
        return [f"Error listing models: {str(e)}"]
