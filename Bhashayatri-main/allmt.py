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
        self.session = requests.Session()

    def get_mt_model(self, source_lang: str, target_lang: str) -> Dict:
        source_code = self.language_codes.get(source_lang.lower())
        target_code = self.language_codes.get(target_lang.lower())
        if not source_code or not target_code:
            return None
        return self.mt_models.get(f"{source_code}-{target_code}")

    # ✅ Added this helper
    def is_pair_available(self, source_lang: str, target_lang: str) -> bool:
        """Check if model exists for a given language pair"""
        return self.get_mt_model(source_lang, target_lang) is not None

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        cache_key = f"{source_lang}_{target_lang}_{hash(text)}"
        if cache_key in self.translation_cache:
            return self.translation_cache[cache_key]

        model_config = self.get_mt_model(source_lang, target_lang)
        if not model_config:
            return {'success': False, 'error': f"No MT model for {source_lang} → {target_lang}", 'cached': False}

        try:
            payload = {"input_text": text}
            headers = {
                'access-token': model_config['token'],
                'Content-Type': 'application/json'
            }

            response = self.session.post(
                model_config['endpoint'], json=payload, headers=headers, verify=False, timeout=10
            )

            if response.status_code == 200:
                result_data = response.json()
                if result_data.get('status') == 'success':
                    result = {
                        'success': True,
                        'translated_text': result_data['data']['output_text'],
                        'cached': False
                    }
                    self.translation_cache[cache_key] = result
                    return result
                else:
                    return {'success': False, 'error': result_data.get('message', 'Translation failed'), 'cached': False}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}', 'cached': False}

        except Exception as e:
            return {'success': False, 'error': str(e), 'cached': False}


# ==================== INTERACTIVE MODE ====================

def run_interactive_translation():
    mt = BhashiniMT()
    print("\n🌐 Welcome to Bhashini MT Translator")
    print("===================================")

    # Ask input language
    source_lang = input("\nEnter source language (e.g. english, hindi, tamil): ").strip().lower()
    target_lang = input("Enter target language (e.g. hindi, english, telugu): ").strip().lower()
    
    if not mt.is_pair_available(source_lang, target_lang):
        print(f"⚠️  Sorry, no model available for {source_lang} → {target_lang}")
        return
    
    text = input(f"\nEnter the text in {source_lang.title()}: ").strip()
    
    print("\n⏳ Translating... please wait...")
    result = mt.translate(text, source_lang, target_lang)
    
    print("\n================ TRANSLATION RESULT ================")
    if result['success']:
        print(f"\n✅ Translated ({source_lang} → {target_lang}):\n")
        print(result['translated_text'])
    else:
        print(f"❌ Error: {result['error']}")


if __name__ == "__main__":
    run_interactive_translation()