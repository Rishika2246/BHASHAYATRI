import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

class Config:
    """Configuration class for API keys and settings"""
    
    # API Keys
    ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
    ARYA_AI_API_KEY = os.getenv('ARYA_AI_API_KEY')
    SARVAM_AI_API_KEY = os.getenv('SARVAM_AI_API_KEY')
    GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')  # New: Free Google AI
    
    # API Endpoints
    ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2"
    ARYA_AI_BASE_URL = "https://api.arya.ai"
    OPENAI_BASE_URL = "https://api.openai.com/v1"
    ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
    SARVAM_AI_BASE_URL = "https://api.sarvam.ai"
    GOOGLE_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1"  # New
    
    # Indian Languages Mapping
    INDIAN_LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or', 'as', 'sa']
    
    # Voice Settings
    ELEVENLABS_VOICE_IDS = {
        'en': '21m00Tcm4TlvDq8ikWAM',  # Rachel
        'es': 'MF3mGyEYCl7XYWbV9V6O',  # Arnold
        'fr': 'VR6AewLTigWG4xSOukaG',  # Charlotte
        'de': 'ThT5KcBeYPX3keUQqHPh',  # Klaus
        'it': 'VR6AewLTigWG4xSOukaG',  # Bella
        'ja': 'AZnzlk1XvdvUeBnXmlld',  # Mizuki
        'zh': 'VR6AewLTigWG4xSOukaG',  # Li
        'ko': 'VR6AewLTigWG4xSOukaG',  # Soo
    }
    
    # Sarvam AI Voice IDs for Indian Languages
    SARVAM_AI_VOICE_IDS = {
        'hi': 'hindi_female_1',
        'bn': 'bengali_female_1',
        'ta': 'tamil_female_1',
        'te': 'telugu_female_1',
        'mr': 'marathi_female_1',
        'gu': 'gujarati_female_1',
        'kn': 'kannada_female_1',
        'ml': 'malayalam_female_1',
        'pa': 'punjabi_female_1',
        'ur': 'urdu_female_1',
    }
    
    # Language Mapping
    LANGUAGE_NAMES = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ko': 'Korean',
        'hi': 'Hindi',
        'bn': 'Bengali', 
        'ta': 'Tamil',
        'te': 'Telugu',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi',
        'ur': 'Urdu',
        'or': 'Odia',
        'as': 'Assamese',
        'sa': 'Sanskrit',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'ar': 'Arabic',
    }
    
    # Model Settings
    OPENAI_MODEL = "gpt-3.5-turbo"
    ELEVENLABS_MODEL = "eleven_multilingual_v1"
    GEMINI_MODEL = "text-bison@001"  # More typical Generative Language model name
    
    # Audio Settings
    SAMPLE_RATE = 24000
    CHUNK_SIZE = 1024

config = Config()