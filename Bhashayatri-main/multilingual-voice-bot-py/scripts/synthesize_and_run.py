import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.text_to_speech import TextToSpeech
from services.speech_to_text import SpeechToText

phrases = {
    'examples/generated_es.mp3': ('es', 'Hola, esto es una prueba en español.'),
    'examples/generated_hi.mp3': ('hi', 'नमस्ते, यह हिंदी में एक परीक्षण है।')
}

def main():
    tts = TextToSpeech()
    stt = SpeechToText()
    for path, (lang, text) in phrases.items():
        print('Synthesizing', path, lang)
        out = tts.synthesize_speech(text, language=lang, output_path=path)
        print('Synth result:', out)
        print('Running pipeline on', path)
        res = stt.process_audio_file(path)
        print('Pipeline result for', path)
        print(res)

if __name__ == '__main__':
    main()
