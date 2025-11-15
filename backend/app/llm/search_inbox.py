"""
Inbox search (RAG) workflow using Gemini
"""
import json
import google.generativeai as genai
from .client import get_model
from .schemas import search_inbox_schema


def search_inbox(query: str, retrieved_chunks: list[str]) -> dict:
    """
    Answer professor questions using retrieved RAG chunks from database
    
    Args:
        query: The professor's question or search query
        retrieved_chunks: List of relevant email chunks from vector search
    
    Returns:
        Dictionary with answer and source references
    """
    model = get_model()
    
    # Build the prompt
    prompt = f"""
    You are an AI assistant helping a professor search through their email history. Answer their question using the provided email contexts.

    Professor's question: {query}
    
    Relevant email contexts:
    {chr(10).join([f"Context {i+1}: {chunk}" for i, chunk in enumerate(retrieved_chunks)])}
    
    Instructions:
    1. Answer the professor's question based on the provided email contexts
    2. Be specific and cite which contexts you're referencing
    3. If the contexts don't fully answer the question, say what information is available and what's missing
    4. Provide direct quotes when relevant
    5. Suggest follow-up actions if appropriate
    6. List the source contexts you used in your answer
    
    Guidelines:
    - Be factual and only use information from the provided contexts
    - Don't make assumptions beyond what's in the emails
    - If no relevant information is found, clearly state that
    - Organize the answer logically and clearly
    - Include context numbers in your source list
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=search_inbox_schema
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        # Return a fallback response if Gemini fails
        return {
            "answer": f"Search failed: {str(e)}. Please try rephrasing your question or search manually.",
            "sources": ["Error occurred during search"]
        }