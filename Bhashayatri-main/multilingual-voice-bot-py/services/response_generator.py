from openai import OpenAI
from typing import Optional
import random
import time
from config_local import config
from services.gemini_client import GeminiClient
from utils.language_utils import (
    detect_script_language,
    normalize_language_code,
    detect_language_fallback,
    is_indian_language,
)

class ResponseGenerator:
    """Handles response generation with multiple AI APIs for best quality"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=config.OPENAI_API_KEY) if config.OPENAI_API_KEY else None
        self.gemini_client = GeminiClient()
        self.openai_model = config.OPENAI_MODEL
        
        # Response quality tracking
        self.last_provider = None
        self.conversation_context = []
    
    def generate_response(self, user_message: str, language: str) -> str:
        """
        Generate high-quality response using best available API
        """
        print("🚀 Generating intelligent response...")
        # Try Google Gemini first (free and high quality)
        # If Gemini returns, validate its language; otherwise fall back to OpenAI with stricter prompt
        if self.gemini_client.is_available():
            response = self.gemini_client.generate_response(user_message, language)
            if response and self._validate_response(response, language):
                self.last_provider = "Google Gemini"
                self._update_context(user_message, response)
                return response
            print("🔄 Gemini produced an invalid-language response, trying OpenAI with strict enforcement...")
        
        # Try OpenAI as backup
        if self.openai_client:
            try:
                # First attempt (normal)
                response = self._generate_openai_response(user_message, language, strict=False)
                if response and self._validate_response(response, language):
                    self.last_provider = "OpenAI"
                    self._update_context(user_message, response)
                    return response

                # Retry with strict enforcement (explicit system instruction to reply ONLY in target language)
                print("🔁 OpenAI response failed validation; retrying with strict language enforcement...")
                response_strict = self._generate_openai_response(user_message, language, strict=True)
                if response_strict and self._validate_response(response_strict, language):
                    self.last_provider = "OpenAI (strict)"
                    self._update_context(user_message, response_strict)
                    return response_strict
                print("⚠️ OpenAI strict attempt also failed language validation")
            except Exception as e:
                print(f"❌ OpenAI failed: {e}")
        
        # Final fallback: Enhanced intelligent responses
        print("🔄 Using enhanced fallback responses...")
        response = self._generate_enhanced_fallback(user_message, language)
        self.last_provider = "Enhanced Fallback"
        self._update_context(user_message, response)
        return response
    
    def _generate_openai_response(self, user_message: str, language: str) -> Optional[str]:
        """Generate response using OpenAI"""
        try:
            language_name = config.LANGUAGE_NAMES.get(language, 'the same language')

            # Build context-aware prompt
            messages = []
            if strict := False:
                pass

            system_content = (
                f"You are a helpful, engaging multilingual assistant. Respond ONLY in {language_name}. "
                f"Be conversational, empathetic, and natural. Use appropriate cultural context for {language_name} speakers."
            )

            if strict:
                # When strict, ask the model to return LANGUAGE_MISMATCH literal if it cannot comply
                system_content += (
                    " If you cannot produce a response in the requested language, reply exactly: LANGUAGE_MISMATCH"
                )

            messages.append({"role": "system", "content": system_content})

            # Add recent conversation context
            for context in self.conversation_context[-4:]:
                messages.append(context)

            messages.append({"role": "user", "content": user_message})

            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=messages,
                max_tokens=200,
                temperature=0.7
            )

            # Support different SDK response shapes
            try:
                content = response.choices[0].message.content
            except Exception:
                content = getattr(response, 'text', None) or str(response)

            return content
            
        except Exception as e:
            print(f"❌ OpenAI generation error: {e}")
            return None
    
    def _generate_enhanced_fallback(self, user_message: str, language: str) -> str:
        """High-quality fallback responses"""
        
        # Contextual response templates
        # Expand fallback templates prioritizing Indian languages
        contextual_responses = {
            'hi': [
                "यह एक दिलचस्प बात है! 🌟 आपने यह साझा किया, इसके लिए धन्यवाद। आप आगे क्या जानना चाहेंगे?",
                "इस पर चर्चा शुरू करने के लिए धन्यवाद! 💭 मुझे यह काफी विचारोत्तेजक लगता है। मैं आपकी और कैसे सहायता कर सकता हूं?",
                "मैं इस बातचीत को वाकई सराहता हूं! 🤔 आपका दृष्टिकोण बहुत सूचनापूर्ण है। अब आपके मन में क्या है?",
                "यह सुनकर बहुत अच्छा लगा! 😊 मुझे खुशी है कि हम यह चर्चा कर रहे हैं। आप किस बारे में बात करना चाहेंगे?",
                "क्या बढ़िया सवाल है! 🌈 मुझे इसके बारे में सोचने दो... इस बीच, क्या मैं आपकी किसी और चीज में सहायता कर सकता हूं?"
            ],
            'bn': [
                "এটি একটি মজার বিষয়! 🌟 শেয়ার করার জন্য ধন্যবাদ। আপনি পরবর্তীতে কী অন্বেষণ করতে চান?",
                "এটা বলার জন্য ধন্যবাদ! 💭 এটা আমার কাছে খুবই চিন্তাবিষয়ক। আমি আপনাকে আরও কীভাবে সাহায্য করতে পারি?",
                "আমি এই কথোপকথনটি সত্যিই মূল্যবান মনে করি! 🤔 আপনার দৃষ্টিভঙ্গি খুবই কার্যকরী। এখন আপনার কি মনে আছে?",
            ],
            'ta': [
                "இது ஒரு சுவாரசியமான கேள்வி! 🌟 இதை பகிர்ந்ததற்கு நன்றி. அடுத்ததாக என்ன ஆராய விரும்புகிறீர்கள்?",
                "இந்த விவாதத்தை தொடங்கியதற்கு நன்றி! 💭 இது மிகவும் சிந்தனையூட்டும் உள்ளது. நான் உங்களுக்கு மேலும் எப்படி உதவலாம்?",
            ],
            'te': [
                "ఇది ఒక ఆసక్తికర విషయం! 🌟 షేర్ చేసినందుకు ధన్యవాదాలు. మీరు తర్వాత ఏమి అన్వేషించాలనుకుంటున్నారు?",
            ],
            'ml': [
                "ഇത് ഒരു രസകരമായ വിഷയം ആണ്! 🌟 പങ്കുവെച്ചതിന് നന്ദി. ഇനി നീന്തി എന്ത് കണ്ടെത്തണം എന്ന് നിങ്ങൾക്ക് ആഗ്രഹമുണ്ടോ?",
            ],
            'pa': [
                "ਇਹ ਇੱਕ ਦਿਲਚਸਪ ਗੱਲ ਹੈ! 🌟 ਸਾਂਝਾ ਕਰਨ ਲਈ ਧੰਨਵਾਦ। ਤੁਸੀਂ ਅਗਲੀ ਵਾਰੀ ਕੀ ਖੋਜਣਾ ਚਾਹੋਗੇ?",
            ],
            'mr': [
                "हे एक मनोरंजक मुद्दा आहे! 🌟 शेअर केल्याबद्दल धन्यवाद. पुढे तुम्हाला काय जाणून घ्यायचे आहे?",
            ],
            'gu': [
                "આ એક રોમાંચક મુદ્દો છે! 🌟 શેર કરવા બદલ આભાર. તમે આગળ શું શોધવા માંગો છો?",
            ],
            'kn': [
                "ಇದು ಒಂದು ಆಸಕ್ತಿಕರ ವಿಷಯ! � ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು. ಮುಂದಕ್ಕೆ ನೀವು ಏನು ಅನ್ವೇಷಣೆ ಮಾಡಬೇಕು ಎಂದು ಆಶಿಸುತ್ತೀರಿ?",
            ],
            'or': [
                "ଏହା ଏକ ରୋଚକ ବିଷୟ! 🌟 ଅଂଶୀଦାର ହେବା ପାଇଁ ଧନ୍ୟବାଦ। ଆପଣ ପରେ କଣ ଖୋଜିବାକୁ ଚାହାଁତେ?",
            ],
            'ur': [
                "یہ ایک دلچسپ بات ہے! 🌟 شیئر کرنے کا شکریہ۔ آپ آگے کیا دریافت کرنا چاہیں گے؟",
            ],
            # fallbacks to English/Spanish/French when needed
            'en': [
                "That's an interesting point! 🌟 I appreciate you sharing that. What would you like to explore next?",
                "Thanks for bringing this up! 💭 I find that quite thought-provoking. How can I assist you further?",
                "I really value this conversation! 🤔 Your perspective is insightful. What's on your mind now?",
            ],
            'es': [
                "¡Qué interesante! � Agradezco que compartas eso. ¿Qué te gustaría explorar a continuación?",
            ]
        }
        
        # Get responses for the language or default to English
        responses = contextual_responses.get(language, contextual_responses['en'])
        return random.choice(responses)
    
    def _validate_response(self, response: str, expected_language: str) -> bool:
        """Validate that response is appropriate and in correct language"""
        if not response or len(response.strip()) < 5:
            return False
        # Use script detection first (strong for Indian languages)
        try:
            script_lang = detect_script_language(response)
            if script_lang:
                # Normalize expected and script-detected codes
                if normalize_language_code(script_lang) == normalize_language_code(expected_language):
                    return True
                else:
                    print(f"⚠️ Script-based validation mismatch: detected {script_lang} vs expected {expected_language}")
                    return False
        except Exception:
            pass

        # Fallback: heuristic detection on content
        heur = detect_language_fallback(response)
        if heur and normalize_language_code(heur) == normalize_language_code(expected_language):
            return True

        # As a last-ditch check, look for a few common tokens for major Indian languages
        indicators = {
            'hi': ['मैं', 'तुम', 'है', 'का', 'हैं'],
            'bn': ['আমি', 'তুমি', 'কি', 'এটা'],
            'ta': ['நான்', 'நீ', 'இது', 'என்று'],
            'te': ['నేను', 'మీరు', 'ఇది'],
            'ml': ['ഞാൻ', 'നീ', 'ഇത്'],
            'pa': ['ਮੈਂ', 'ਤੂੰ', 'ਇਹ'],
            'ur': ['ہے', 'میں', 'یہ'],
            'en': ['the', 'and', 'is']
        }

        if expected_language in indicators:
            toks = indicators[expected_language]
            if any(tok in response for tok in toks):
                return True

        print(f"⚠️ Response language validation failed for {expected_language}; heuristic={heur}")
        return False
    
    def _update_context(self, user_message: str, bot_response: str):
        """Update conversation context (keep last 3 exchanges)"""
        self.conversation_context.extend([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": bot_response}
        ])
        
        # Keep only last 3 exchanges (6 messages)
        if len(self.conversation_context) > 6:
            self.conversation_context = self.conversation_context[-6:]
    
    def get_last_provider(self) -> str:
        """Get which provider was used for the last response"""
        return self.last_provider or "Unknown"