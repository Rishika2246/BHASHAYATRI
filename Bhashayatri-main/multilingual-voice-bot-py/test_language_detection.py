"""Simple test script for language detection using example audio files.
This is used by `main.py --mode test-languages`.
"""
from services.speech_to_text import SpeechToText
from utils.language_utils import get_language_name


def test_language_detection():
    stt = SpeechToText()
    samples = [
        'examples/spoken_en.wav',
        'examples/generated_es.mp3',
        'examples/generated_hi.mp3'
    ]

    print("\n🔎 Running language detection/transcription tests on sample files:\n")
    for s in samples:
        print(f"---\nFile: {s}")
        try:
            result = stt.transcribe_audio_file(s)
            if result:
                lang = result.get('language')
                text = result.get('text')
                print(f"Detected language: {lang} ({get_language_name(lang)})")
                print(f"Transcript: {text}\n")
            else:
                print("No transcription result (possible silent file or API error)\n")
        except Exception as e:
            print(f"Error processing {s}: {e}\n")

if __name__ == '__main__':
    test_language_detection()
