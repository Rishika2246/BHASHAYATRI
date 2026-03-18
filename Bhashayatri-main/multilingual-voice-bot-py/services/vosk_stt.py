"""Simple VOSK offline speech-to-text wrapper.

This wrapper attempts to load a model from a provided path or from
`models/vosk-<lang>` where <lang> is 'hi','te','ta' etc. It expects wav
files (PCM 16-bit) at an appropriate sample rate (16000 or 24000).

If VOSK is not installed or models are missing, methods return None.
"""
import os
import wave
from typing import Optional, Dict, Any


class VoskSTT:
    def __init__(self):
        try:
            from vosk import Model, KaldiRecognizer
            self.Model = Model
            self.KaldiRecognizer = KaldiRecognizer
        except Exception:
            self.Model = None
            self.KaldiRecognizer = None

    def _find_model_path(self, language_hint: Optional[str] = None) -> Optional[str]:
        # Prefer explicit model paths under models/; convention: models/vosk-<lang>
        if language_hint:
            candidate = os.path.join('models', f'vosk-{language_hint}')
            if os.path.isdir(candidate):
                return candidate

        # Try common names
        for p in os.listdir('models') if os.path.isdir('models') else []:
            if p.lower().startswith('vosk-'):
                return os.path.join('models', p)

        return None

    def transcribe_file(self, wav_path: str, language_hint: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Transcribe the provided WAV file using a VOSK model.

        Returns dict {'text': str, 'confidence': float} or None on failure.
        """
        if not self.Model or not self.KaldiRecognizer:
            print("⚠️ VOSK is not installed in this environment.")
            return None

        if not os.path.exists(wav_path):
            print(f"⚠️ Audio file not found: {wav_path}")
            return None

        model_path = self._find_model_path(language_hint)
        if not model_path:
            print("⚠️ No VOSK model found in models/; please download and place a model under models/vosk-<lang>")
            return None

        try:
            model = self.Model(model_path)
            wf = wave.open(wav_path, 'rb')
            sample_rate = wf.getframerate()
            channels = wf.getnchannels()

            # VOSK expects mono input; if stereo, this simple wrapper won't convert
            if channels != 1:
                print("⚠️ VOSK requires mono WAV files. Please provide mono audio or resample to mono.")
                wf.close()
                return None

            rec = self.KaldiRecognizer(model, sample_rate)
            rec.SetWords(True)

            results = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    part = rec.Result()
                    results.append(part)

            final = rec.FinalResult()
            wf.close()

            # Simple extraction of text from JSON strings returned by VOSK
            import json
            texts = []
            for r in results:
                try:
                    j = json.loads(r)
                    if 'text' in j and j['text']:
                        texts.append(j['text'])
                except Exception:
                    pass

            try:
                fj = json.loads(final)
                if 'text' in fj and fj['text']:
                    texts.append(fj['text'])
            except Exception:
                pass

            transcript = ' '.join(t for t in texts if t)
            confidence = 0.8 if transcript else 0.0

            return {'text': transcript, 'confidence': confidence}

        except Exception as e:
            print(f"❌ VOSK transcription error: {e}")
            return None
