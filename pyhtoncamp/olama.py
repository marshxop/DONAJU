import streamlit as st
import ollama

# --- Configuration ---
# NOTE: The model must be downloaded locally via Ollama (e.g., 'ollama pull llama3')
# The user's provided model 'llama3.2' might not be standard. Using a common model.
DEFAULT_MODEL = "llama3.2" 

# Function to generate a response from the LLM using Ollama
def generate_llm_response(prompt, model=DEFAULT_MODEL):
    """
    Connects to the local Ollama service to generate a response.
    
    Args:
        prompt (str): The user's text prompt.
        model (str): The name of the model to use (must be installed locally).
        
    Returns:
        str: The generated text response.
    """
    try:
        messages = [
            {
                "role": "user",
                "content": prompt,
            }
        ]
        
        # This call relies on the Ollama service running on localhost:11434
        response = ollama.chat(model=model, messages=messages)
        return response['message']['content']
    
    except ollama.core.OllamaAPIError as e:
        # Handle cases where the model is not found or connection is refused
        st.error(f"Ollama API Error: Ensure the model '{model}' is installed and Ollama is running.")
        st.code(str(e))
        return "Failed to generate response due to an Ollama API issue."
    except Exception as e:
        # Catch generic connection errors (like the one you encountered previously)
        st.error("Connection Error: Failed to connect to Ollama. Is the Ollama server running?")
        st.code(str(e))
        return "Failed to generate response due to connection failure."

# --- Streamlit Application Layout ---
st.set_page_config(page_title="Agentic AI Demo Chatbot", layout="centered")

st.title("🤖 Local LLM Chatbot (Ollama Demo)")
st.caption(f"Powered by Ollama and the '{DEFAULT_MODEL}' model, running locally.")
st.markdown("This application demonstrates a core component of agentic AI: using a local LLM as the **Reasoning** engine.")

# Model selection (optional, but good for a workshop)
model_name = st.selectbox(
    "Select Local Model (Must be pulled via 'ollama pull <model>')",
    options=[DEFAULT_MODEL, "mistral", "gemma:2b"], # Suggesting common models
    index=0
)

# Text input for user prompt
user_prompt = st.text_area(
    "Enter your prompt here (e.g., 'Explain the difference between Generative AI and Agentic AI'):",
    height=150
)

# Button to generate response
if st.button("Generate Response", type="primary"):
    if user_prompt:
        with st.container(border=True):
            st.subheader("Agent Response")
            # Using a spinner for the loading state
            with st.spinner(f"Connecting to Ollama and generating response with {model_name}..."):
                reply = generate_llm_response(user_prompt, model=model_name)
                # Display the generated reply
                st.markdown(reply)
    else:
        st.warning("Please enter a prompt to generate a response.")