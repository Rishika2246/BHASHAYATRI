from elevenlabs.client import ElevenLabs
import os
from typing import Optional
from config_local import config
from services.sarvam_tts import SarvamTTS

class TextToSpeech:
    """Handles text-to-speech conversion with Sarvam AI priority for Indian languages"""

    def __init__(self):
        self.elevenlabs_key = config.ELEVENLABS_API_KEY
        self.sarvam_tts = SarvamTTS()

        # Initialize ElevenLabs client
        if self.elevenlabs_key:
            self.client = ElevenLabs(api_key=self.elevenlabs_key)
        else:
            self.client = None
            print("⚠️ ElevenLabs API key not found")

    def synthesize_speech(self, text: str, language: str, output_path: Optional[str] = None) -> Optional[str]:
        """
        Convert text to speech with intelligent service selection
        """
        # For Indian languages, prioritize Sarvam AI
        if language in config.INDIAN_LANGUAGES:
            print(f"🎯 Using Sarvam AI for Indian language: {language}")
            audio_path = self.sarvam_tts.synthesize_speech(text, language, output_path)
            if audio_path:
                return audio_path

            print("🔄 Sarvam AI failed, falling back to ElevenLabs")

        # For non-Indian languages or fallback, use ElevenLabs
        if self.client:
            audio_path = self._synthesize_elevenlabs(text, language, output_path)
            if audio_path:
                return audio_path

        # Final fallback: Use system TTS or return error
        print("❌ No TTS service available - using fallback")
        return self._synthesize_fallback(text, language, output_path)

    def _synthesize_elevenlabs(self, text: str, language: str, output_path: Optional[str] = None) -> Optional[str]:
        """Use ElevenLabs for TTS - FIXED METHOD"""
        try:
            # prefer an India-appropriate ElevenLabs voice if available
            voice_id = config.ELEVENLABS_VOICE_IDS.get(language)
            if not voice_id and language in config.INDIAN_LANGUAGES:
                # fallback to a neutral English voice for Indian languages if no specific voice exists
                voice_id = config.ELEVENLABS_VOICE_IDS.get('en')
            if not voice_id:
                voice_id = config.ELEVENLABS_VOICE_IDS['en']

            print(f"🔊 Using ElevenLabs for {language}...")

            # CORRECTED: Use text_to_speech.convert instead of generate
            audio = self.client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id=config.ELEVENLABS_MODEL,
                output_format="mp3_44100_128"
            )

            # Save to file
            if not output_path:
                output_path = "elevenlabs_response.mp3"

            # Write the audio chunks to file
            with open(output_path, "wb") as f:
                for chunk in audio:
                    if chunk:
                        f.write(chunk)

            print(f"✅ ElevenLabs TTS successful: {output_path}")
            return output_path

        except Exception as e:
            print(f"❌ ElevenLabs TTS error: {e}")
            return None

    def _synthesize_fallback(self, text: str, language: str, output_path: Optional[str] = None) -> Optional[str]:
        """Final fallback using system TTS or simple audio file"""
        try:
            if not output_path:
                output_path = "fallback_response.wav"

            # Try pyttsx3 for offline TTS (synchronous, platform TTS engines)
            try:
                import pyttsx3

                print("🔊 Using offline pyttsx3 fallback TTS...")
                engine = pyttsx3.init()

                # Attempt to pick a voice that matches language substring
                voices = engine.getProperty('voices')
                lang_lower = language.lower()
                chosen = None
                for v in voices:
                    if lang_lower in v.name.lower() or lang_lower in getattr(v, 'id', '').lower():
                        chosen = v.id
                        break

                if chosen:
                    engine.setProperty('voice', chosen)

                # Save to WAV file
                engine.save_to_file(text, output_path)
                engine.runAndWait()

                # Verify file
                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    print(f"⚠️ Created offline TTS audio file: {output_path}")
                    return output_path
                else:
                    print("❌ Offline TTS failed to create audio file")
            except Exception as e:
                print(f"❌ pyttsx3 offline TTS failed: {e}")

            # Final minimal placeholder when all else fails
            print("🔊 Using fallback placeholder audio (silent file)")
            placeholder = output_path if output_path.endswith('.mp3') else output_path.replace('.wav', '.mp3')
            with open(placeholder, "wb") as f:
                f.write(b'\xFF\xFB\x90\x00\x00\x00')
            return placeholder
            
        except Exception as e:
            print(f"❌ Fallback TTS also failed: {e}")
            return None