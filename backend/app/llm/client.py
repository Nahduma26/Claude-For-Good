"""
Gemini client configuration and model initialization for Professor Inbox Copilot
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY not found in environment variables. "
        "Please add it to your .env file: GEMINI_API_KEY=your_api_key_here"
    )

# Configure Gemini API
genai.configure(api_key=api_key)

# Initialize the Gemini model
model = genai.GenerativeModel("gemini-2.0-flash")

def get_model():
    """Return the configured Gemini model instance"""
    return model

def is_configured():
    """Check if Gemini API is properly configured"""
    return bool(api_key)

def list_available_models():
    """List available Gemini models"""
    try:
        models = genai.list_models()
        return [model.name for model in models if 'generateContent' in model.supported_generation_methods]
    except Exception as e:
        return [f"Error listing models: {str(e)}"]