import asyncio

from services.speech_to_text import RealtimeSpeechToText
from services.response_generator import ResponseGenerator
from services.text_to_speech import TextToSpeech
from utils.audio_utils import AudioPlayer

class RealtimeVoiceBot:
    """Orchestrates the real-time speech-to-speech conversation."""

    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir
        self.stt_service = None
        self.audio_player = AudioPlayer()

    async def _transcript_consumer(self, queue: asyncio.Queue, stop_event: asyncio.Event):
        """Waits for transcripts, generates responses, and plays them."""
        response_generator = ResponseGenerator()
        tts_service = TextToSpeech()
        
        text_buffer = ""
        last_processing_time = asyncio.get_event_loop().time()
        processing_interval = 10.0  # 10-second delay

        while not stop_event.is_set():
            try:
                try:
                    transcript_text = await asyncio.wait_for(queue.get(), timeout=1.0)
                    print(f"\n[Consumer] Buffered: '{transcript_text}'")
                    text_buffer += transcript_text + " "
                    queue.task_done()
                except asyncio.TimeoutError:
                    pass

                current_time = asyncio.get_event_loop().time()
                
                if current_time - last_processing_time >= processing_interval and text_buffer.strip():
                    print(f"\n[Consumer] Processing buffered text: '{text_buffer.strip()}'")

                    if not self.stt_service.detected_language:
                        print("[Consumer] ⚠️ Language not detected yet, skipping.")
                        continue

                    response_text = response_generator.generate_response(
                        text_buffer.strip(), self.stt_service.detected_language
                    )
                    print(f"[Consumer] <- Got response: '{response_text}'")

                    audio_output_path = tts_service.synthesize_speech(
                        response_text, self.stt_service.detected_language
                    )

                    if audio_output_path:
                        print(f"[Consumer] -> Playing audio response...")
                        self.audio_player.play_audio(audio_output_path)

                    text_buffer = ""
                    last_processing_time = current_time

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"💥 Error in consumer: {e}")

    async def run(self):
        """Main loop to run the real-time bot."""
        transcript_queue = asyncio.Queue()
        self.stt_service = RealtimeSpeechToText(transcript_queue, detection_buffer_seconds=2)

        print(f"\n{'='*70}")
        print("🚀 REAL-TIME MULTILINGUAL VOICE BOT")
        print("💬 Speak naturally → Get intelligent responses in the same language")
        print("⏹️  Press Ctrl+C to exit")
        print(f"{'='*70}\n")

        listener_task = asyncio.create_task(self.stt_service.listen())
        consumer_task = asyncio.create_task(
            self._transcript_consumer(transcript_queue, self.stt_service._stop_event)
        )

        await asyncio.gather(listener_task, consumer_task)

    def cleanup(self):
        """Cleanup all resources"""
        try:
            if self.stt_service:
                self.stt_service.cleanup()
            if self.audio_player:
                self.audio_player.cleanup()
            print("✅ All resources cleaned up")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")