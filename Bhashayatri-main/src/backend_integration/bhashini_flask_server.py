"""
BhashaYatri - Python Flask Backend
Simplified version - works with available pairs directly
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import urllib3
from typing import Dict, List

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend


# ==================== BHASHINI MT CLASS ====================

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
        
        # MT Models Registry - Only available working pairs
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
            'hi-pa': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316388f', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-or': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217304f34535ffa89b93e', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            'hi-ur': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb923163870', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
            
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
            'mr-gu': {'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/687217354f34535ffa89ba0b', 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'},
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

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        cache_key = f"{source_lang}_{target_lang}_{hash(text)}"
        if cache_key in self.translation_cache:
            cached_result = self.translation_cache[cache_key].copy()
            cached_result['cached'] = True
            return cached_result

        model_config = self.get_mt_model(source_lang, target_lang)
        
        if not model_config:
            return {
                'success': False, 
                'error': f"Translation not available for {source_lang} → {target_lang}", 
                'cached': False
            }

        try:
            payload = {"input_text": text}
            headers = {
                'access-token': model_config['token'],
                'Content-Type': 'application/json'
            }

            response = self.session.post(
                model_config['endpoint'], 
                json=payload, 
                headers=headers, 
                verify=False, 
                timeout=10
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
                    return {
                        'success': False, 
                        'error': result_data.get('message', 'Translation failed'), 
                        'cached': False
                    }
            else:
                return {
                    'success': False, 
                    'error': f'HTTP {response.status_code}', 
                    'cached': False
                }

        except Exception as e:
            return {
                'success': False, 
                'error': str(e), 
                'cached': False
            }

    def get_supported_languages(self) -> List[str]:
        """Return list of supported languages"""
        return list(self.language_codes.keys())

    def get_available_pairs(self) -> List[Dict]:
        """Return list of available translation pairs"""
        pairs = []
        for pair_key in self.mt_models.keys():
            source, target = pair_key.split('-')
            source_name = [k for k, v in self.language_codes.items() if v == source][0]
            target_name = [k for k, v in self.language_codes.items() if v == target][0]
            pairs.append({
                'source': source_name,
                'target': target_name,
                'pair': f"{source_name} → {target_name}"
            })
        return pairs


# Initialize Bhashini MT
mt_translator = BhashiniMT()


# ==================== API ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'BhashaYatri Backend',
        'version': '1.0.0'
    })


@app.route('/bhashini/translate', methods=['POST'])
def translate_text():
    """
    Translate text using Bhashini MT API
    """
    try:
        data = request.get_json()
        
        text = data.get('text', '').strip()
        source_lang = data.get('source_language', '').lower()
        target_lang = data.get('target_language', '').lower()
        
        # Validation
        if not text:
            return jsonify({'success': False, 'error': 'Text is required'}), 400
        
        if not source_lang or not target_lang:
            return jsonify({'success': False, 'error': 'Source and target languages are required'}), 400
        
        # Perform translation
        print(f"📝 Translating: '{text}' from {source_lang} to {target_lang}")
        result = mt_translator.translate(text, source_lang, target_lang)
        
        if result['success']:
            print(f"✅ Translation successful: '{result['translated_text']}'")
            return jsonify(result)
        else:
            print(f"❌ Translation failed: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/bhashini/languages', methods=['GET'])
def get_languages():
    """Get list of supported languages"""
    return jsonify({
        'success': True,
        'languages': mt_translator.get_supported_languages()
    })


@app.route('/bhashini/pairs', methods=['GET'])
def get_translation_pairs():
    """Get list of available translation pairs"""
    return jsonify({
        'success': True,
        'pairs': mt_translator.get_available_pairs(),
        'total': len(mt_translator.mt_models)
    })


# ==================== RUN SERVER ====================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 BhashaYatri Backend Server Starting...")
    print("="*60)
    print(f"📡 API Server: http://localhost:8000")
    print(f"🔧 Health Check: http://localhost:8000/health")
    print(f"📝 Translation Endpoint: POST /bhashini/translate")
    print(f"🌐 Supported Languages: {len(mt_translator.get_supported_languages())}")
    print(f"🔗 Available Pairs: {len(mt_translator.mt_models)}")
    print("="*60)
    print("✅ Ready to receive translation requests!")
    print("="*60 + "\n")
    
    # Run Flask app
    app.run(host='0.0.0.0', port=8000, debug=True)