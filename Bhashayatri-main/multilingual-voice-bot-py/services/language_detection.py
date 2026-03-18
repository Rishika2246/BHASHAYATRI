import requests
from typing import Dict, Any, Optional
from config_local import config  # Changed import

class LanguageDetector:
    """Handles language detection using Arya AI API"""
    
    def __init__(self):
        self.api_key = config.ARYA_AI_API_KEY
        self.base_url = f"{config.ARYA_AI_BASE_URL}/language-detection"
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """
        Detect the language of the given text using Arya AI
        """
        if not self.api_key:
            return self._fallback_detection(text)
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'text': text
            }
            
            response = requests.post(self.base_url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'language': data.get('language_code', 'en'),
                'confidence': data.get('confidence', 0.9),
                'language_name': data.get('language_name', 'English')
            }
            
        except Exception as e:
            print(f"⚠️ Language detection API error: {e}")
            return self._fallback_detection(text)
    
    def _fallback_detection(self, text: str) -> Dict[str, Any]:
        """Fallback language detection using simple pattern matching"""
        from utils.language_utils import detect_language_fallback
        
        language_code = detect_language_fallback(text)
        language_name = config.LANGUAGE_NAMES.get(language_code, 'Unknown')
        
        return {
            'language': language_code,
            'confidence': 0.7,
            'language_name': language_name
        }