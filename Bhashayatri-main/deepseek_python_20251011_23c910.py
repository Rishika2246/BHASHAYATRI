import requests
import json
import urllib3
from typing import Dict, List

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class BhashiniMT:
    def __init__(self):
        self.language_codes = {
            'assamese': 'as', 'bengali': 'bn', 'bodo': 'brx', 'dogri': 'doi',
            'gujarati': 'gu', 'hindi': 'hi', 'kannada': 'kn', 'kashmiri': 'ks',
            'konkani': 'kok', 'maithili': 'mai', 'malayalam': 'ml', 'manipuri': 'mni',
            'marathi': 'mr', 'nepali': 'ne', 'odia': 'or', 'punjabi': 'pa',
            'sanskrit': 'sa', 'santali': 'sat', 'sindhi': 'sd', 'tamil': 'ta',
            'telugu': 'te', 'urdu': 'ur', 'english': 'en'
        }
        
        # MT Models Registry - ADD ALL YOUR MODELS HERE
        self.mt_models = {
            # Hindi <-> Other Languages
            'hi-en': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316384a', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'en-hi': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316383c', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-ta': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217304f34535ffa89b944', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'ta-hi': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/688fbcc48a64d68b8ea9391e', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-te': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316388e', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'te-hi': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb923163897', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-mr': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217304f34535ffa89b93b', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'mr-hi': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217354f34535ffa89ba0c', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-gu': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316389c', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'gu-hi': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb923163894', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-kn': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb9231638a3', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'kn-hi': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb9231638a9', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-ml': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb9231638c3', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'ml-hi': {'endpoint': 'YOUR_ML_HI_ENDPOINT', 'token': 'YOUR_ML_HI_TOKEN'},
            'hi-pa': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316388f', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'pa-hi': {'endpoint': 'YOUR_PA_HI_ENDPOINT', 'token': 'YOUR_PA_HI_TOKEN'},
            'hi-or': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217304f34535ffa89b93e', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'or-hi': {'endpoint': 'YOUR_OR_HI_ENDPOINT', 'token': 'YOUR_OR_HI_TOKEN'},
            'hi-ur': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb923163870', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8N'},
            'ur-hi': {'endpoint': 'YOUR_UR_HI_ENDPOINT', 'token': 'YOUR_UR_HI_TOKEN'},
            
            # English <-> Other Languages
            'en-ta': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872172f4f34535ffa89b90e', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'ta-en': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872173a4f34535ffa89bafd', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'en-te': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872172f4f34535ffa89b90f', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'te-en': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb923163869', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'en-bn': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb9231638b4', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'bn-en': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872172d4f34535ffa89b88f', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'en-mr': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872172f4f34535ffa89b905', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'mr-en': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/688fbcbf8a64d68b8ea93881', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'en-kn': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb923163823', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'kn-en': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316389d', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            

            
            # Regional Language Pairs
            'ta-te': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872173a4f34535ffa89bb10', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'te-ta': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872173b4f34535ffa89bb2b', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'bn-ta': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/6872172d4f34535ffa89b8a2', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'ta-bn': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/688fbcc48a64d68b8ea93918', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'mr-gu': {'endpoint': 'Yhttps://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217354f34535ffa89ba0b', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            
            
            # Add ALL your remaining MT models here...
            # Format: 'source-target': {'endpoint': 'URL', 'token': 'TOKEN'}
        }
        
        # Cache for faster repeated translations
        self.translation_cache = {}
        
        # Session for connection pooling
        self.session = requests.Session()

    def get_mt_model(self, source_lang: str, target_lang: str) -> Dict:
        """Get model config for language pair"""
        source_code = self.language_codes.get(source_lang)
        target_code = self.language_codes.get(target_lang)
        
        if not source_code or not target_code:
            return None
            
        model_key = f"{source_code}-{target_code}"
        return self.mt_models.get(model_key)

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        """
        Ultra-fast translation with caching
        """
        # Create cache key
        cache_key = f"{source_lang}_{target_lang}_{hash(text)}"
        
        # Check cache first
        if cache_key in self.translation_cache:
            return self.translation_cache[cache_key]
        
        # Get model config
        model_config = self.get_mt_model(source_lang, target_lang)
        if not model_config:
            result = {
                'success': False,
                'error': f"No MT model for {source_lang} → {target_lang}",
                'cached': False
            }
            self.translation_cache[cache_key] = result
            return result

        try:
            # Prepare request
            payload = {"input_text": text}
            headers = {
                'access-token': model_config['token'],
                'Content-Type': 'application/json'
            }
            
            # Make request with timeout
            response = self.session.post(
                model_config['endpoint'],
                json=payload,
                headers=headers,
                verify=False,
                timeout=10  # Short timeout for speed
            )
            
            # Process response
            if response.status_code == 200:
                result_data = response.json()
                if result_data.get('status') == 'success':
                    result = {
                        'success': True,
                        'translated_text': result_data['data']['output_text'],
                        'source_lang': source_lang,
                        'target_lang': target_lang,
                        'model_used': f"{source_lang}-{target_lang}",
                        'cached': False
                    }
                    # Cache successful translation
                    self.translation_cache[cache_key] = result
                    return result
                else:
                    result = {
                        'success': False,
                        'error': result_data.get('message', 'Translation failed'),
                        'cached': False
                    }
                    return result
            else:
                result = {
                    'success': False,
                    'error': f'HTTP {response.status_code}',
                    'cached': False
                }
                return result
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'cached': False
            }

    def batch_translate(self, texts: List[str], source_lang: str, target_lang: str) -> List[Dict]:
        """Translate multiple texts efficiently"""
        return [self.translate(text, source_lang, target_lang) for text in texts]

    def multi_target_translate(self, text: str, source_lang: str, target_langs: List[str]) -> Dict:
        """Translate to multiple target languages"""
        results = {}
        for target_lang in target_langs:
            results[target_lang] = self.translate(text, source_lang, target_lang)
        return {
            'success': True,
            'original_text': text,
            'source_language': source_lang,
            'translations': results
        }

    def get_available_pairs(self) -> List[str]:
        """Get list of all available language pairs"""
        return list(self.mt_models.keys())

    def is_pair_available(self, source_lang: str, target_lang: str) -> bool:
        """Check if language pair is available"""
        return self.get_mt_model(source_lang, target_lang) is not None

    def clear_cache(self):
        """Clear translation cache"""
        self.translation_cache.clear()

# ==================== USAGE ====================

def demo_mt_system():
    """Demo the MT system"""
    mt = BhashiniMT()
    
    print("🚀 Bhashini MT System - Fast & Efficient")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        ("नमस्ते, आप कैसे हैं?", "hindi", "english"),
        ("Hello, how are you?", "english", "hindi"),
        ("வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?", "tamil", "hindi"),
        ("Hello, how are you?", "english", "tamil"),
        ("નમસ્કાર, તમે કેમ છો?", "gujarati", "hindi"),
    ]
    
    for i, (text, source, target) in enumerate(test_cases, 1):
        print(f"\n{i}. 🔤 {source.upper()} → {target.upper()}")
        
        if mt.is_pair_available(source, target):
            result = mt.translate(text, source, target)
            if result['success']:
                print(f"   ✅ {result['translated_text']}")
                if result['cached']:
                    print("   💾 (from cache)")
            else:
                print(f"   ❌ {result['error']}")
        else:
            print(f"   ⚠️  Model not available")

    # Batch translation demo
    print(f"\n🔄 Batch Translation Demo:")
    texts = ["Hello", "How are you?", "Thank you"]
    batch_results = mt.batch_translate(texts, "english", "hindi")
    for original, result in zip(texts, batch_results):
        if result['success']:
            print(f"   '{original}' → '{result['translated_text']}'")

if __name__ == "__main__":
    demo_mt_system()