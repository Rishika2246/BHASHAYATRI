import requests
import time
from typing import Optional
from config_local import config

class SarvamTTS:
    """Text-to-Speech using Sarvam AI for Indian languages"""
    
    def __init__(self):
        self.api_key = config.SARVAM_AI_API_KEY
        self.base_url = config.SARVAM_AI_BASE_URL
    
    def synthesize_speech(self, text: str, language: str, output_path: Optional[str] = None) -> Optional[str]:
        """
        Convert text to speech using Sarvam AI
        """
        if not self.api_key:
            print("❌ Sarvam AI API key not configured")
            return None
        
        # Validate text length
        if not text or len(text.strip()) < 2:
            print("❌ Text too short for TTS")
            return None
        
        try:
            voice_id = config.SARVAM_AI_VOICE_IDS.get(language, config.SARVAM_AI_VOICE_IDS['hi'])
            
            payload = {
                "text": text[:500],  # Limit text length
                "language": language,
                "voice_id": voice_id,
                "output_format": "mp3",
                "sample_rate": config.SAMPLE_RATE
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            print(f"🔊 Calling Sarvam AI TTS for {language}...")
            
            response = requests.post(
                f"{self.base_url}/tts",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                if not output_path:
                    output_path = f"sarvam_response_{int(time.time())}.mp3"
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                # Verify file was created
                import os
                if os.path.exists(output_path) and os.path.getsize(output_path) > 100:
                    print(f"✅ Sarvam AI TTS successful: {output_path}")
                    return output_path
                else:
                    print("❌ Sarvam AI TTS failed - empty file created")
                    return None
            else:
                print(f"❌ Sarvam AI TTS failed: {response.status_code}")
                if response.status_code == 401:
                    print("   🔑 Invalid API key")
                elif response.status_code == 429:
                    print("   📊 Rate limit exceeded")
                return None
                
        except requests.exceptions.Timeout:
            print("❌ Sarvam AI TTS timeout - service not responding")
            return None
        except requests.exceptions.ConnectionError:
            print("❌ Sarvam AI TTS connection error - check internet")
            return None
        except Exception as e:
            print(f"❌ Sarvam AI TTS error: {e}")
            return None
    
    def get_supported_languages(self) -> list:
        """Get list of Indian languages supported by Sarvam AI"""
        return list(config.SARVAM_AI_VOICE_IDS.keys())