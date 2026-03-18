Multilingual Voice Bot
======================

This project demonstrates an end-to-end audio pipeline: audio input → language detection → transcription → intelligent response → text-to-speech in the same language.

Quick setup
-----------

1. Create a `.env` file in the project root with the API keys (examples):

```
ASSEMBLYAI_API_KEY=your_assemblyai_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ARYA_AI_API_KEY=your_arya_ai_key
SARVAM_AI_API_KEY=your_sarvam_key
GOOGLE_GEMINI_API_KEY=your_google_key
```

2. Install dependencies (use your venv):

```powershell
C:/voicebot/multilingual-voice-bot-py/venv/Scripts/python.exe -m pip install -r requirements.txt
```

3. Run the lightweight API checker:

```powershell
C:/voicebot/multilingual-voice-bot-py/venv/Scripts/python.exe scripts/check_apis.py
```

Running examples
----------------

Process a single audio file:

```powershell
C:/voicebot/multilingual-voice-bot-py/venv/Scripts/python.exe main.py --mode single --input examples/spoken_en.wav -o conversations
```

Run language detection tests:

```powershell
C:/voicebot/multilingual-voice-bot-py/venv/Scripts/python.exe main.py --mode test-languages
```

Notes
-----
- If cloud TTS services are unavailable, the project falls back to an offline TTS using `pyttsx3` and creates a WAV file.
- The project uses AssemblyAI for transcription and multiple backends (Gemini/OpenAI/fallback) for response generation.

Offline STT (VOSK) for Indian languages
---------------------------------------

If you'd like fully offline speech-to-text for Indian languages (useful for privacy or when cloud keys are unavailable), VOSK models are a good option.

1. Install the VOSK runtime in your venv:

```powershell
C:/voicebot/multilingual-voice-bot-py/venv/Scripts/python.exe -m pip install vosk
```

2. Download an appropriate model (example):

 - Hindi: https://alphacephei.com/vosk/models (choose a small/large hindi model)

Unpack the model into `models/vosk-hi` (for example). Then you can enable the offline STT fallback in the code (the project contains a `services/vosk_stt.py` wrapper to add).

Troubleshooting
---------------
- If AssemblyAI returns no transcript for silent files, ensure the audio contains speech and is recorded at 16kHz or 24kHz mono.
- If ElevenLabs returns 401/403, verify the key in `.env` and the header formats. Use `scripts/check_apis.py` to help debug.

