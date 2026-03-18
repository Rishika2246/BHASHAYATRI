import re
from typing import Dict, Optional
from config_local import config


def detect_language_fallback(text: str) -> str:
    """Fallback language detection using common word patterns.

    Biased toward Indian languages: includes patterns for Hindi, Bengali,
    Tamil, Telugu, Malayalam, Punjabi, Marathi, Gujarati and Kannada. This
    serves as a last-resort fallback when external language detectors are
    unavailable or inconclusive.
    """
    if not text:
        return 'en'

    text_lower = text.lower()

    language_patterns = {
        'hi': r'\b(है|हैं|मैं|तुम|क्या|यह|वह|कहना)\b',
        'bn': r'\b(আমি|তুমি|কি|হ্য|এটি|সে|তারা)\b',
        'ta': r'\b(நான்|நீ|என்|இது|எங்கே|எப்படி)\b',
        'te': r'\b(నేను|నువ్వు|ఇది|ఎక్కడ|ఎలా)\b',
        'ml': r'\b(ഞാൻ|നീ|ഇത്|എങ്ങനെ|എവിടെ)\b',
        'pa': r'\b(ਮੈਂ|ਤੂੰ|ਕੀ|ਇਹ|ਕਿੱਥੇ)\b',
        'mr': r'\b(मी|तू|हे|आहे|काय)\b',
        'gu': r'\b(હું|તમે|શું|આ|તે)\b',
        'kn': r'\b(ನಾನು|ನೀವು|ಇದು|ಎಲ್ಲಿ|ಎಷ್ಟು)\b',
        'ur': r'\b(ہے|ہیں|میں|کیا|یہ)\b',
        # fallback to common world languages if none of the above match
        'en': r'\b(the|and|is|in|to|of|a|that|it|for)\b',
        'es': r'\b(el|la|de|que|y|en|un|es|se|no)\b',
    }

    scores: Dict[str, int] = {}
    for lang, pattern in language_patterns.items():
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        scores[lang] = len(matches)

    detected_lang = max(scores.items(), key=lambda x: x[1])[0]
    if scores[detected_lang] == 0:
        return 'en'
    return detected_lang


def detect_script_language(text: str) -> Optional[str]:
    """Detect language by presence of script-specific unicode ranges.

    Returns a short language code when a clear script is present. This is
    useful for distinguishing Indian languages that use different scripts.
    """
    if not text:
        return None

    s = text
    # Devanagari (Hindi, Marathi, Sanskrit, Nepali) U+0900–U+097F
    if re.search(r'[\u0900-\u097F]', s):
        return 'hi'
    # Bengali and Assamese U+0980–U+09FF
    if re.search(r'[\u0980-\u09FF]', s):
        return 'bn'
    # Gurmukhi (Punjabi) U+0A00–U+0A7F
    if re.search(r'[\u0A00-\u0A7F]', s):
        return 'pa'
    # Gujarati U+0A80–U+0AFF
    if re.search(r'[\u0A80-\u0AFF]', s):
        return 'gu'
    # Oriya / Odia U+0B00–U+0B7F
    if re.search(r'[\u0B00-\u0B7F]', s):
        return 'or'
    # Tamil U+0B80–U+0BFF
    if re.search(r'[\u0B80-\u0BFF]', s):
        return 'ta'
    # Telugu U+0C00–U+0C7F
    if re.search(r'[\u0C00-\u0C7F]', s):
        return 'te'
    # Kannada U+0C80–U+0CFF
    if re.search(r'[\u0C80-\u0CFF]', s):
        return 'kn'
    # Malayalam U+0D00–U+0D7F
    if re.search(r'[\u0D00-\u0D7F]', s):
        return 'ml'
    # Arabic script (Urdu, Arabic, Persian) U+0600–U+06FF -> bias to 'ur'
    if re.search(r'[\u0600-\u06FF]', s):
        return 'ur'

    return None


def normalize_language_code(code: Optional[str]) -> str:
    """Normalize various language code formats to two-letter short codes.

    Bias toward Indian languages: if code already identifies an Indian
    language return it; otherwise fall back to first two letters.
    """
    if not code:
        return 'en'
    code = code.lower().replace('-', '_')

    # explicit mappings for Indian languages
    indian = set(config.INDIAN_LANGUAGES)
    for lang in indian:
        if code.startswith(lang):
            return lang

    # common languages
    if code.startswith('en'):
        return 'en'
    if code.startswith('es'):
        return 'es'
    if code.startswith('fr'):
        return 'fr'

    return code[:2]


def is_indian_language(code: Optional[str]) -> bool:
    """Return True if code is recognized as an Indian language by config."""
    if not code:
        return False
    return normalize_language_code(code) in set(config.INDIAN_LANGUAGES)


def get_language_name(language_code: str) -> str:
    """Get language name from code"""
    return config.LANGUAGE_NAMES.get(language_code, 'Unknown')
