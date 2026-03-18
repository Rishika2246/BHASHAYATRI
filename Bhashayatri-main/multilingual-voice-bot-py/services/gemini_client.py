import requests
import json
from typing import Optional
from config_local import config

class GeminiClient:
    """Google Gemini API client for free, high-quality responses"""
    
    def __init__(self):
        self.api_key = config.GOOGLE_GEMINI_API_KEY
        self.base_url = config.GOOGLE_GEMINI_BASE_URL
        self.model = config.GEMINI_MODEL
    
    def generate_response(self, prompt: str, language: str) -> Optional[str]:
        """
        Generate response using Google Gemini API
        """
        if not self.api_key:
            print("❌ Google Gemini API key not configured")
            return None
        
        try:
            language_name = config.LANGUAGE_NAMES.get(language, 'the same language')
            
            # Enhanced prompt for better responses
            enhanced_prompt = f"""
            You are a helpful, friendly, and engaging multilingual assistant.
            The user is speaking in {language_name}. 
            
            IMPORTANT INSTRUCTIONS:
            - Respond in {language_name} only
            - Be conversational and natural
            - Show genuine interest and empathy
            - Keep responses concise (2-3 sentences)
            - Ask relevant follow-up questions when appropriate
            - Use appropriate cultural context for {language_name}
            - Be helpful, informative, and warm
            
            User's message: {prompt}
            
            Your response in {language_name}:
            """
            
            # Google Generative Language `generate` endpoint
            url = f"{self.base_url}/models/{self.model}:generate"

            payload = {
                "prompt": {
                    "text": enhanced_prompt
                },
                "temperature": 0.7,
                "maxOutputTokens": 200
            }

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }

            print(f"🤖 Generating response with Google Gemini (Generative Language API)...")
            response = requests.post(url, json=payload, headers=headers, timeout=30)

            if response.status_code == 200:
                data = response.json()
                # The response format can vary; try to extract a reasonable text field
                if 'candidates' in data and len(data['candidates']) > 0:
                    response_text = data['candidates'][0].get('output', '').strip()
                else:
                    # Some responses include `output` or `candidates[].content` depending on API
                    response_text = data.get('output', '') or data.get('candidates', [{}])[0].get('content', '')

                if response_text:
                    print(f"✅ Gemini response successful")
                    return response_text.strip()
                else:
                    print(f"❌ Gemini response format error: {data}")
                    return None
            else:
                print(f"❌ Gemini API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Gemini API exception: {e}")
            return None
    
    def is_available(self) -> bool:
        """Check if Gemini API is available"""
        return bool(self.api_key)