import pyttsx3

engine = pyttsx3.init()
# Try to set a voice for each language; this depends on the system having such voices installed.
voices = engine.getProperty('voices')

# Helper to pick voice by language substring
def find_voice(lang_substr):
    for v in voices:
        if lang_substr.lower() in v.name.lower() or lang_substr.lower() in v.id.lower():
            return v.id
    return None

samples = {
    'examples/spoken_en.wav': ('en', 'Hello, this is a test in English.'),
    'examples/spoken_es.wav': ('es', 'Hola, esto es una prueba en español.'),
    'examples/spoken_hi.wav': ('hi', 'नमस्ते, यह हिंदी में एक परीक्षण है।')
}

for path, (lang, text) in samples.items():
    voice_id = find_voice(lang)
    if voice_id:
        engine.setProperty('voice', voice_id)
    engine.save_to_file(text, path)
    engine.runAndWait()
    print('Saved', path, 'using voice', voice_id)

print('Done')
