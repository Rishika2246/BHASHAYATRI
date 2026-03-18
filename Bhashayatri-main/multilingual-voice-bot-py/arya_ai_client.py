import logging
from typing import Optional
import requests
from config_local import config
from utils.language_utils import detect_language_fallback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AryaAIClient:
    """Synchronous client for Arya.ai language-detection endpoints.

    This client prefers configuration from `config_local.config` but will
    accept explicit api_key/api_url if provided.
    """

    def __init__(self, api_key: Optional[str] = None, api_url: Optional[str] = None):
        self.api_key = api_key or config.ARYA_AI_API_KEY
        # Default to the configured base URL + language-detection path
        base = api_url or config.ARYA_AI_BASE_URL
        if base:
            # Ensure no trailing slash
            base = base.rstrip('/')
            self.api_url = f"{base}/language-detection"
        else:
            self.api_url = None

        if not self.api_key or not self.api_url:
            logger.warning("AryaAIClient: API key or URL not configured - falling back to text-based heuristics when possible")

    def detect_language(self, audio_chunk: bytes) -> Optional[str]:
        """Detect language from an audio chunk by POSTing to Arya.ai.

        Returns a language code like 'en', 'es', or 'hi', or None on failure.
        """
        if not self.api_key or not self.api_url:
            logger.info("AryaAIClient: no API credentials — cannot perform audio-based detection")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }

        # Upload as a file field — many APIs accept multipart uploads
        files = {
            "audio": ("audio.wav", audio_chunk, "audio/wav")
        }

        try:
            logger.info("Sending audio to Arya.ai for language detection...")
            resp = requests.post(self.api_url, headers=headers, files=files, timeout=15)
            if resp.status_code != 200:
                logger.error(f"Arya.ai returned {resp.status_code}: {resp.text}")
                return None

            data = resp.json()
            # The exact response key may differ; try common keys
            language = data.get('language') or data.get('language_code') or data.get('lang')
            logger.info(f"Arya.ai detected language: {language}")
            return language

        except requests.exceptions.RequestException as e:
            logger.error(f"Arya.ai request failed: {e}")
            return None

    def detect_language_from_text(self, text: str) -> str:
        """Fallback text-based detection using internal heuristics."""
        return detect_language_fallback(text)