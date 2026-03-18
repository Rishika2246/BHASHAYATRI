import os
import time
from typing import Dict, Any, Optional, Tuple

from services.language_detection import LanguageDetector
from services.speech_to_text import SpeechToText
from services.response_generator import ResponseGenerator
from services.text_to_speech import TextToSpeech
from utils.audio_utils import AudioPlayer
from utils.file_utils import ensure_directory, save_response_to_file
from utils.language_utils import get_language_name, normalize_language_code

class FullyWorkingVoiceBot:
    """Complete multilingual voice bot with reliable language detection"""
    
    def __init__(self):
        self.language_detector = LanguageDetector()
        self.speech_to_text = SpeechToText()
        self.response_generator = ResponseGenerator()
        self.text_to_speech = TextToSpeech()
        self.audio_player = AudioPlayer()
        
        self.stats = {
            'total_conversations': 0,
            'successful_conversations': 0,
            'languages_used': {},
            'providers_used': {}
        }
    
    def _synthesize_and_play_response(self, response_text: str, language: str, output_dir: Optional[str]) -> Optional[str]:
        """Step 4 & 5: Convert response to speech and play it."""
        print("\n4️⃣  STEP 4: CONVERTING TO SPEECH")
        print("-" * 40)
        
        audio_filename = None
        if output_dir:
            ensure_directory(output_dir)
            audio_filename = os.path.join(output_dir, f"response_{self.stats['total_conversations'] + 1}.mp3")
        
        audio_output_path = self.text_to_speech.synthesize_speech(response_text, language, audio_filename)
        
        if not audio_output_path or not os.path.exists(audio_output_path):
            raise IOError("Speech synthesis failed, no output file created.")
        
        print(f"🔊 AUDIO GENERATED: {audio_output_path}")
        
        print("\n5️⃣  STEP 5: PLAYING RESPONSE")
        print("-" * 40)
        
        print("🎵 Playing audio response...")
        play_success = self.audio_player.play_audio(audio_output_path)
        
        if not play_success:
            print("⚠️  Audio playback failed, but file was saved")
            
        return audio_output_path

    def _generate_response(self, user_text: str, language: str) -> Tuple[str, str]:
        """Step 3: Generate an intelligent response."""
        print("\n3️⃣  STEP 3: GENERATING INTELLIGENT RESPONSE")
        print("-" * 40)
        
        response = self.response_generator.generate_response(user_text, language)
        provider = self.response_generator.get_last_provider()
        
        print(f"🤖 RESPONSE: {response}")
        print(f"⚡ PROVIDER: {provider}")
        
        if not response:
            raise ValueError("Failed to generate response from AI provider.")
            
        return response, provider

    def _transcribe_audio(self, audio_path: str) -> Tuple[str, str, float]:
        """Step 2: Transcribe audio to text and detect language."""
        print("\n2️⃣  STEP 2: CONVERTING SPEECH TO TEXT")
        print("-" * 40)
        
        transcription = self.speech_to_text.transcribe_audio_file(audio_path)
        if not transcription:
            raise ValueError("Speech recognition failed.")
        
        user_text = transcription['text'].strip()
        detected_language = transcription['language']
        confidence = transcription['confidence']
        
        print(f"📝 USER SAID: '{user_text}'")
        print(f"🌐 DETECTED LANGUAGE: {get_language_name(detected_language)} ({detected_language})")
        print(f"🎯 CONFIDENCE: {confidence:.2f}")
        
        if not user_text:
            raise ValueError("No speech detected in the audio.")
            
        return user_text, detected_language, confidence

    def _get_audio_input(self, audio_file_path: Optional[str]) -> str:
        """Step 1: Get audio input from file or recording."""
        print("\n1️⃣  STEP 1: CAPTURING AUDIO INPUT")
        print("-" * 40)
        
        if audio_file_path and os.path.exists(audio_file_path):
            print(f"📁 Using audio file: {audio_file_path}")
            audio_path = audio_file_path
        else:
            print("🎙️  Live recording starting...")
            print("💬 Speak naturally in ANY language...")
            audio_path = self.speech_to_text.record_audio_interactive("conversation_input.wav")
            if not audio_path:
                raise IOError("Audio recording failed or was cancelled.")
        
        if not os.path.exists(audio_path) or os.path.getsize(audio_path) < 1000:
            raise IOError("Audio file is empty or too small to process.")
            
        return audio_path

    def process_conversation(self, audio_file_path: str = None, output_dir: str = None) -> Dict[str, Any]:
        """
        Complete conversation pipeline: Audio In → Text → Response → Audio Out
        """
        print(f"\n{'='*70}")
        print("🎯 FULLY WORKING VOICE BOT - CONVERSATION STARTED")
        print(f"{'='*70}")
        
        try:
            # Pipeline steps are now in separate methods
            audio_path = self._get_audio_input(audio_file_path)
            user_text, detected_language, _ = self._transcribe_audio(audio_path)

            # Normalize the detected language to a short code (en, es, hi)
            normalized_lang = normalize_language_code(detected_language)

            response_text, provider = self._generate_response(user_text, normalized_lang)
            # STEP 4: Convert Response to Speech (use normalized language)
            audio_output_path = self._synthesize_and_play_response(response_text, normalized_lang, output_dir)
            
            # Update statistics
            self._update_stats(detected_language, provider, True)
            
            # Save conversation
            if output_dir:
                self._save_conversation(user_text, response_text, detected_language, audio_output_path, provider, output_dir)
            
            print(f"\n✅ CONVERSATION COMPLETED SUCCESSFULLY!")
            
            return {
                'success': True,
                'user_input': user_text,
                'bot_response': response_text,
                'language': normalized_lang,
                'language_name': get_language_name(normalized_lang),
                'audio_output': audio_output_path,
                'ai_provider': provider
            }

        except (IOError, FileNotFoundError) as e:
            print(f"\n❌ CONVERSATION FAILED (File/Audio Error): {e}")
            self._update_stats('unknown', 'none', False)
            return self._error_result(f"File or audio error: {e}")
        except ValueError as e:
            print(f"\n❌ CONVERSATION FAILED (Processing Error): {e}")
            self._update_stats('unknown', 'none', False)
            return self._error_result(f"Processing error: {e}")
        except Exception as e:
            print(f"\n❌ CONVERSATION FAILED: {e}")
            self._update_stats('unknown', 'none', False)
            return self._error_result(str(e))
    
    def _error_result(self, error_message: str) -> Dict[str, Any]:
        """Create error result"""
        return {
            'success': False,
            'error': error_message
        }
    
    def _update_stats(self, language: str, provider: str, success: bool):
        """Update conversation statistics"""
        self.stats['total_conversations'] += 1
        
        if success:
            self.stats['successful_conversations'] += 1
            
            # Track language usage
            self.stats['languages_used'][language] = self.stats['languages_used'].get(language, 0) + 1
            
            # Track AI provider usage
            self.stats['providers_used'][provider] = self.stats['providers_used'].get(provider, 0) + 1
    
    def _save_conversation(self, user_text: str, bot_response: str, language: str, 
                          audio_path: str, provider: str, output_dir: str):
        """Save conversation details"""
        filename = os.path.join(output_dir, f"conversation_{self.stats['total_conversations']}.txt")
        
        conversation_text = f"""FULLY WORKING VOICE BOT - CONVERSATION LOG
========================================

🗣️ USER INPUT ({get_language_name(language)}):
{user_text}

🤖 BOT RESPONSE:
{bot_response}

📊 METADATA:
- Language: {get_language_name(language)} ({language})
- AI Provider: {provider}
- Audio File: {audio_path}
- Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}
- Conversation #: {self.stats['total_conversations']}

💡 NOTE: Input and output languages are automatically matched!
"""
        
        save_response_to_file(conversation_text, filename)
        print(f"💾 Conversation saved: {filename}")
    
    def interactive_mode(self, output_dir: str = None):
        """
        Fully interactive voice conversation mode
        """
        print(f"\n{'='*70}")
        print("🚀 FULLY WORKING MULTILINGUAL VOICE BOT")
        print("🌍 Supports: English, Hindi, Spanish, French, German, Japanese, etc.")
        print("💬 Speak naturally → Get intelligent responses in same language")
        print("⏹️  Press Ctrl+C to exit")
        print(f"{'='*70}")
        
        conversation_count = 0
        
        try:
            while True:
                conversation_count += 1
                print(f"\n🎯 CONVERSATION #{conversation_count}")
                print("=" * 50)
                
                # Small delay for clean start
                time.sleep(1)
                
                try:
                    input("🎤 Press Enter to start speaking... ")
                except KeyboardInterrupt:
                    break
                
                print("🔴 RECORDING... Speak now!")
                result = self.process_conversation(output_dir=output_dir)

                if result.get('success'):
                    lang_name = result.get('language_name', 'Unknown')
                    provider = result.get('ai_provider', 'Unknown')
                    print(f"✅ Success! Language: {lang_name} | AI: {provider}")
                else:
                    print(f"❌ Failed: {result.get('error')}")
                    print("🔄 Let's try again...")

                # Brief pause between conversations
                time.sleep(2)
        except KeyboardInterrupt:
            print("\n\n🛑 Session ended by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")
    
    def show_detailed_stats(self):
        """Show comprehensive statistics"""
        print(f"\n{'='*60}")
        print("📊 COMPREHENSIVE STATISTICS")
        print(f"{'='*60}")
        
        total = self.stats['total_conversations']
        successful = self.stats['successful_conversations']
        success_rate = (successful / total * 100) if total > 0 else 0
        
        print(f"📈 Conversation Statistics:")
        print(f"   Total Attempts: {total}")
        print(f"   Successful: {successful}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        if self.stats['languages_used']:
            print(f"\n🌍 Language Distribution:")
            for lang_code, count in self.stats['languages_used'].items():
                lang_name = get_language_name(lang_code)
                percentage = (count / successful * 100) if successful > 0 else 0
                print(f"   {lang_name}: {count} ({percentage:.1f}%)")
        
        if self.stats['providers_used']:
            print(f"\n🤖 AI Provider Usage:")
            for provider, count in self.stats['providers_used'].items():
                percentage = (count / successful * 100) if successful > 0 else 0
                print(f"   {provider}: {count} ({percentage:.1f}%)")
    
    def cleanup(self):
        """Cleanup all resources"""
        try:
            self.audio_player.cleanup()
            self.speech_to_text.cleanup()
            print("✅ All resources cleaned up")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")