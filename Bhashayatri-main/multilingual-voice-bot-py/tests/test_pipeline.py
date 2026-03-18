import os
import sys
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fully_working_voice_bot import FullyWorkingVoiceBot

class DummySTT:
    def transcribe_audio_file(self, path):
        return {'text': 'Hello world', 'language': 'en', 'confidence': 0.99}

class DummyResponseGen:
    def generate_response(self, text, language):
        return 'Echo: ' + text
    def get_last_provider(self):
        return 'Dummy'

class DummyTTS:
    def synthesize_speech(self, text, language, output_path=None):
        # create a tiny placeholder file
        if not output_path:
            output_path = 'tests/tmp_out.wav'
        with open(output_path, 'wb') as f:
            f.write(b'RIFF')
        return output_path

class DummyAudioPlayer:
    def play_audio(self, path):
        return True
    def cleanup(self):
        pass

@pytest.fixture(autouse=True)
def patch_services(monkeypatch):
    monkeypatch.setattr('fully_working_voice_bot.SpeechToText', lambda: None)
    monkeypatch.setattr('fully_working_voice_bot.ResponseGenerator', lambda: None)
    monkeypatch.setattr('fully_working_voice_bot.TextToSpeech', lambda: None)
    monkeypatch.setattr('fully_working_voice_bot.AudioPlayer', lambda: None)

    # inject dummy instances
    bot = FullyWorkingVoiceBot()
    bot.speech_to_text = DummySTT()
    bot.response_generator = DummyResponseGen()
    bot.text_to_speech = DummyTTS()
    bot.audio_player = DummyAudioPlayer()
    return bot

def test_process_conversation(tmp_path, patch_services):
    bot = patch_services
    # create a dummy audio file
    audio_file = tmp_path / 'in.wav'
    # create a file larger than the bot's minimum size check (1000 bytes)
    audio_file.write_bytes(b'\0' * 2000)

    res = bot.process_conversation(str(audio_file), output_dir=str(tmp_path))
    assert res['success'] is True
    assert 'Echo:' in res['bot_response']
    assert os.path.exists(res['audio_output'])