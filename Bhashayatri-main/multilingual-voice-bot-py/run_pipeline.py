"""
Small CLI runner for the file-based pipeline.
Usage:
  python run_pipeline.py path/to/audio.wav

This script will call services.speech_to_text.SpeechToText.process_audio_file
and print the result. If API keys are not configured it will try to run with
fallback behavior.
"""
import sys
from services.speech_to_text import SpeechToText


def main():
    if len(sys.argv) < 2:
        print("Usage: python run_pipeline.py path/to/audio.wav")
        return

    audio_path = sys.argv[1]
    stt = SpeechToText()
    result = stt.process_audio_file(audio_path)
    print("Result:")
    print(result)


if __name__ == '__main__':
    main()
