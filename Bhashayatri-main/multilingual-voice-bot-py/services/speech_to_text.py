import assemblyai as aai
import pyaudio
import wave
import asyncio
import threading
import time
import os
from typing import Optional, Dict, Any
from config_local import config
from arya_ai_client import AryaAIClient
from utils.language_utils import (
    detect_script_language,
    normalize_language_code as normalize_code,
    is_indian_language,
    detect_language_fallback,
)
# Imports for the full real-time pipeline example
from services.response_generator import ResponseGenerator
from services.text_to_speech import TextToSpeech
from services.vosk_stt import VoskSTT
from utils.audio_utils import AudioPlayer


aai.settings.api_key = config.ASSEMBLYAI_API_KEY

class BaseAudioHandler:
    """Base class for handling PyAudio settings and resources."""
    def __init__(self):
        # Audio settings
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000  # Standardized to 16kHz for better STT compatibility
        self.audio = pyaudio.PyAudio()

    def cleanup(self):
        """Cleanup PyAudio resources."""
        if hasattr(self, 'audio') and self.audio:
            self.audio.terminate()

# --- Existing File-Based SpeechToText Class ---
class SpeechToText(BaseAudioHandler):
    """Handles speech-to-text with reliable language detection"""
    
    def __init__(self):
        super().__init__()
        self.api_key = config.ASSEMBLYAI_API_KEY
        if self.api_key:
            aai.settings.api_key = self.api_key
        else:
            print("⚠️ AssemblyAI API key not found")
        
        # Audio settings
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000  # Standardized to 16kHz for better STT compatibility
        self.audio = pyaudio.PyAudio()
        self.frames = []
        self.is_recording = False
        self.stream = None
    
    def record_audio(self, duration: int = 7, output_path: str = "recorded_audio.wav") -> str:
        """Record audio with better quality settings"""
        print(f"🎤 Recording for {duration} seconds...")
        
        self.frames = []
        self.is_recording = True
        
        try:
            self.stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                frames_per_buffer=self.chunk
            )
            
            for _ in range(0, int(self.rate / self.chunk * duration)):
                if self.is_recording:
                    data = self.stream.read(self.chunk)
                    self.frames.append(data)
                else:
                    break
            
            self.stream.stop_stream()
            self.stream.close()
            
            # Save with better quality
            wf = wave.open(output_path, 'wb')
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.audio.get_sample_size(self.format))
            wf.setframerate(self.rate)
            wf.writeframes(b''.join(self.frames))
            wf.close()
            
            print(f"✅ Audio saved: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Recording error: {e}")
            return ""
    
    def record_audio_interactive(self, output_path: str = "user_input.wav") -> str:
        """Record until user stops with better feedback"""
        print("🎤 Recording... Press Enter when finished")
        print("💬 Speak clearly in any language...")
        
        self.frames = []
        self.is_recording = True
        
        def record_thread():
            try:
                self.stream = self.audio.open(
                    format=self.format,
                    channels=self.channels,
                    rate=self.rate,
                    input=True,
                    frames_per_buffer=self.chunk
                )
                
                while self.is_recording:
                    data = self.stream.read(self.chunk)
                    self.frames.append(data)
            except Exception as e:
                print(f"❌ Recording thread error: {e}")
        
        record_thread = threading.Thread(target=record_thread)
        record_thread.start()
        
        input()  # Wait for user to press Enter
        self.stop_recording()
        record_thread.join()
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        
        if self.frames:
            wf = wave.open(output_path, 'wb')
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.audio.get_sample_size(self.format))
            wf.setframerate(self.rate)
            wf.writeframes(b''.join(self.frames))
            wf.close()
            
            file_size = os.path.getsize(output_path)
            print(f"✅ Recorded {file_size} bytes to: {output_path}")
            return output_path
        else:
            print("❌ No audio recorded")
            return ""
    
    def stop_recording(self):
        """Stop recording"""
        self.is_recording = False
    
    def transcribe_audio_file(self, audio_file_path: str) -> Optional[Dict[str, Any]]:
        """Transcribe audio with RELIABLE language detection"""
        if not self.api_key:
            print("⚠️ AssemblyAI API key not configured - attempting VOSK offline fallback")
            try:
                vosk = VoskSTT()
                result = vosk.transcribe_file(audio_file_path)
                if result and result.get('text'):
                    return {'text': result['text'], 'language': None, 'confidence': result.get('confidence', 0.0)}
            except Exception:
                pass
            return None
        
        try:
            print("🔊 Transcribing audio...")
            
            # Use AssemblyAI with language detection
            config_aai = aai.TranscriptionConfig(
                language_detection=True
            )
            
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(audio_file_path, config=config_aai)
            
            if transcript.status == aai.TranscriptStatus.error:
                print(f"❌ Transcription error: {transcript.error} - attempting VOSK fallback")
                try:
                    vosk = VoskSTT()
                    vres = vosk.transcribe_file(audio_file_path)
                    if vres and vres.get('text'):
                        return {'text': vres['text'], 'language': None, 'confidence': vres.get('confidence', 0.0)}
                except Exception:
                    pass
                return None
            
            text = transcript.text
            if not text or not text.strip():
                print("❌ No text transcribed from AssemblyAI - attempting VOSK fallback")
                try:
                    vosk = VoskSTT()
                    vres = vosk.transcribe_file(audio_file_path)
                    if vres and vres.get('text'):
                        return {'text': vres['text'], 'language': None, 'confidence': vres.get('confidence', 0.0)}
                except Exception:
                    pass
                return None
            
            print(f"📝 Transcribed: '{text}'")
            
            # RELIABLE language detection
            detected_language = self._reliable_language_detection(text, transcript)
            confidence = 0.9
            
            return {
                'text': text.strip(),
                'language': detected_language,
                'confidence': confidence
            }
            
        except Exception as e:
            print(f"❌ Transcription error: {e} - attempting VOSK fallback")
            try:
                vosk = VoskSTT()
                result = vosk.transcribe_file(audio_file_path)
                if result and result.get('text'):
                    return {'text': result['text'], 'language': None, 'confidence': result.get('confidence', 0.0)}
            except Exception:
                pass
            return None
    
    def _reliable_language_detection(self, text: str, transcript) -> str:
        """RELIABLE multi-method language detection"""
        print("🔍 Detecting language reliably...")
        
        methods_used = []
        
        # Method 1: AssemblyAI's detection
        if hasattr(transcript, 'language_code') and transcript.language_code:
            assembly_lang = transcript.language_code
            methods_used.append(f"AssemblyAI: {assembly_lang}")

            # If AssemblyAI identifies an Indian language, trust it immediately
            if is_indian_language(assembly_lang):
                print(f"   ✅ Trusting AssemblyAI (Indian): {assembly_lang}")
                return assembly_lang

            # Otherwise, trust non-English detections
            if assembly_lang != 'en':
                print(f"   ✅ Trusting AssemblyAI: {assembly_lang}")
                return assembly_lang
        
        # Method 2: Arya AI (most reliable for non-English)
        try:
            from services.language_detection import LanguageDetector
            detector = LanguageDetector()
            arya_result = detector.detect_language(text)
            arya_lang = arya_result['language']
            arya_confidence = arya_result['confidence']
            
            methods_used.append(f"AryaAI: {arya_lang} ({arya_confidence:.2f})")

            # Prefer Indian-language detections even at slightly lower confidence
            if arya_lang in config.INDIAN_LANGUAGES and arya_confidence > 0.5:
                print(f"   ✅ Trusting Arya AI (Indian): {arya_lang} (confidence: {arya_confidence})")
                return arya_lang

            if arya_confidence > 0.6 and arya_lang != 'en':
                print(f"   ✅ Trusting Arya AI: {arya_lang} (confidence: {arya_confidence})")
                return arya_lang
            elif arya_lang != 'en':
                print(f"   ⚠️ Arya AI detected {arya_lang} but confidence low: {arya_confidence}")
                
        except Exception as e:
            methods_used.append(f"AryaAI: Failed ({e})")
        
        # Method 3: Script-based detection from transcript text (strong signal for Indian languages)
        try:
            script_lang = detect_script_language(text)
            if script_lang:
                print(f"   ✅ Script-based detection: {script_lang}")
                return script_lang
        except Exception:
            pass

        # Final decision: fall back to heuristic fallback detector, then English
        print(f"   🔍 Methods tried: {', '.join(methods_used)}")
        fallback = detect_language_fallback(text)
        print(f"   ⚠️ Falling back to heuristic: {fallback}")
        return fallback or 'en'
    
    def cleanup(self):
        """Cleanup resources"""
        if hasattr(self, 'audio'):
            self.audio.terminate()

    # --- New: end-to-end pipeline for file input -> language-aware response audio ---
    def process_audio_file(self, audio_file_path: str, output_audio_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        1) Transcribe the given audio file
        2) Detect the language (reliable multi-method)
        3) Generate a response text (using ResponseGenerator)
        4) Synthesize response in the detected language and return paths

        Supports at least English (en), Spanish (es) and Hindi (hi) via simple mappings.
        """
        # 1) Transcribe
        # Prefer local VOSK Hindi model if present (national-language-first)
        vosk_model_dir = os.path.join('models', 'vosk-hi')
        transcription = None
        if os.path.isdir(vosk_model_dir):
            try:
                print("🔎 Found local VOSK Hindi model - using offline STT for better Hindi recognition")
                vosk = VoskSTT()
                vres = vosk.transcribe_file(audio_file_path, language_hint='hi')
                if vres and vres.get('text'):
                    transcription = {'text': vres['text'], 'language': 'hi', 'confidence': vres.get('confidence', 0.85)}
            except Exception as e:
                print(f"⚠️ VOSK Hindi model usage failed: {e}")

        if not transcription:
            transcription = self.transcribe_audio_file(audio_file_path)
        if not transcription:
            print("❌ Transcription failed - aborting pipeline")
            return None

        detected = transcription['language']
        text = transcription['text']
        print(f"🗣️ Detected language: {detected} | Text: {text}")

        # Normalize language code to short form for TTS and response mapping
        lang_short = self._normalize_language_code(detected)

        # 2) Generate response text (use ResponseGenerator if available)
        try:
            rg = ResponseGenerator()
            response_text = rg.generate_response(text, language=lang_short)
        except Exception as e:
            print(f"⚠️ ResponseGenerator failed: {e} - falling back to echo")
            response_text = f"You said: {text}"

        print(f"💬 Response text ({lang_short}): {response_text}")

        # 3) Synthesize response audio in same language
        try:
            tts = TextToSpeech()
            if not output_audio_path:
                output_audio_path = f"response_{lang_short}.mp3"

            audio_path = tts.synthesize_speech(response_text, language=lang_short, output_path=output_audio_path)
            if not audio_path:
                print("❌ TTS failed to produce audio")
                return None
        except Exception as e:
            print(f"❌ TTS pipeline error: {e}")
            return None

        print(f"✅ Pipeline complete. Response audio: {audio_path}")
        return {
            'input_file': audio_file_path,
            'transcript': text,
            'detected_language': detected,
            'language_short': lang_short,
            'response_text': response_text,
            'response_audio': audio_path
        }

    def _normalize_language_code(self, code: str) -> str:
        """Map a detected language code to a short code used by TTS/response generators.

        Examples:
            'en', 'en_us' -> 'en'
            'es', 'es_es' -> 'es'
            'hi', 'hi_in' -> 'hi'
        """
        # Delegate to shared normalize to keep behavior consistent across modules
        return normalize_code(code)

# --- New Real-time SpeechToText Class ---

class RealtimeSpeechToText(BaseAudioHandler):
    """
    Handles real-time speech-to-text using Arya.ai for initial language detection
    and AssemblyAI for continuous transcription.
    """

    def __init__(self, transcript_queue: Optional[asyncio.Queue] = None, detection_buffer_seconds: int = 3):
        super().__init__()
        self.arya_client = AryaAIClient()
        self.transcriber = None
        self.is_listening = False
        self.detected_language = None
        self.transcript_queue = transcript_queue
        self.detection_buffer_seconds = detection_buffer_seconds
        self.audio_queue = asyncio.Queue()
        self._stop_event = asyncio.Event()

        # Audio settings
        # Using 16000Hz as it's standard for most STT services and was used in the previous implementation
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000
        self.chunk = int(self.rate * 0.1) # 100ms
        self.audio = pyaudio.PyAudio()

    def _on_open(self, session_opened: aai.RealtimeSessionOpened):
        """Called when the real-time connection to AssemblyAI is established."""
        print(f"AssemblyAI session opened with ID: {session_opened.session_id}")

    def _on_data(self, transcript: aai.RealtimeTranscript):
        """Processes real-time transcription data from AssemblyAI."""
        if not transcript.text:
            return

        if isinstance(transcript, aai.RealtimeFinalTranscript):
            final_text = transcript.text.strip()
            if final_text:
                print(f"Final Transcript: {final_text}")
                if self.transcript_queue:
                    self.transcript_queue.put_nowait(final_text)
        else:
            print(f"Partial: {transcript.text}", end="\r")

    def _on_error(self, error: aai.RealtimeError):
        """Handles errors from the AssemblyAI real-time service."""
        print(f"❌ AssemblyAI real-time error: {error}")

    def _on_close(self):
        """Called when the real-time connection to AssemblyAI is closed."""
        print("AssemblyAI session closed.")

    def _audio_reader_thread(self):
        """
        Reads audio from the microphone in a separate thread and puts it into an async queue.
        This prevents blocking the main asyncio event loop.
        """
        try:
            stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                frames_per_buffer=self.chunk
            )
            print("🎤 Audio reader thread started. Listening...")
            while not self._stop_event.is_set():
                try:
                    data = stream.read(self.chunk, exception_on_overflow=False)
                    # Use run_coroutine_threadsafe to interact with the asyncio queue
                    asyncio.run_coroutine_threadsafe(self.audio_queue.put(data), asyncio.get_running_loop())
                except Exception as e:
                    print(f"Audio read error: {e}")
                    break
        finally:
            if 'stream' in locals() and stream.is_active():
                stream.stop_stream()
                stream.close()
            print("🎤 Audio reader thread stopped.")

    async def listen(self):
        """
        Starts listening to the microphone, detects language, and transcribes in real-time.
        """
        self.is_listening = True
        self.detected_language = None
        self._stop_event.clear()

        # Start the audio reading in a background thread
        reader_thread = threading.Thread(target=self._audio_reader_thread, daemon=True)
        reader_thread.start()

        print("🤫 Buffering initial audio for language detection...")

        # 1. Buffer audio for language detection
        detection_buffer = bytearray()
        # Buffer ~3 seconds of audio for language detection
        num_chunks_for_detection = int(self.detection_buffer_seconds * self.rate / self.chunk)

        for _ in range(num_chunks_for_detection):
            data = await self.audio_queue.get()
            detection_buffer.extend(data)

        # 2. Detect language with Arya.ai (blocking call - run in executor)
        loop = asyncio.get_running_loop()
        try:
            detected = await loop.run_in_executor(None, self.arya_client.detect_language, bytes(detection_buffer))
        except Exception as e:
            print(f"⚠️ Arya detection exception: {e}")
            detected = None

        if not detected:
            print("❌ Could not detect language via Arya.ai. Defaulting to English ('en').")
            self.detected_language = "en"
        else:
            self.detected_language = detected
            print(f"✅ Language detected as: {self.detected_language}. Starting real-time transcription.")

        # 3. Initialize and connect AssemblyAI RealtimeTranscriber
        self.transcriber = aai.RealtimeTranscriber(
            sample_rate=self.rate,
            language_code=self.detected_language,
            on_data=self._on_data,
            on_error=self._on_error,
            on_open=self._on_open,
            on_close=self._on_close,
        )

        # The connect method establishes the websocket connection.
        self.transcriber.connect()

        # 4. Start streaming audio to AssemblyAI
        # First, send the buffer we already collected
        self.transcriber.stream(bytes(detection_buffer))

        print("🔴 Now transcribing in real-time. Press Ctrl+C to stop.")
        while not self._stop_event.is_set():
            try:
                data = await self.audio_queue.get()
                self.transcriber.stream(data)
            except asyncio.CancelledError:
                break
        
        if self.transcriber:
            await self.transcriber.close()

    def stop(self):
        """Stops the listening loop."""
        print("\nStopping listener...")
        self._stop_event.set()

    def cleanup(self):
        """Clean up PyAudio resources."""
        self.audio.terminate()


