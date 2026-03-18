from utils import language_utils as lu


def test_detect_script_language_basic():
    assert lu.detect_script_language("यह एक परीक्षण है") == 'hi'
    assert lu.detect_script_language("আমি বাংলা বলছি") == 'bn'
    assert lu.detect_script_language("நான் தமிழ் பேசுகிறேன்") == 'ta'
    assert lu.detect_script_language("ఈ తెలుగు వాక్యం") == 'te'


def test_normalize_language_code():
    assert lu.normalize_language_code('en-US') == 'en'
    assert lu.normalize_language_code('hi_IN') == 'hi'
    assert lu.normalize_language_code('bn') == 'bn'
    assert lu.normalize_language_code('es') == 'es'


def test_is_indian_language():
    assert lu.is_indian_language('hi')
    assert lu.is_indian_language('bn')
    assert not lu.is_indian_language('es')


def test_detect_language_fallback():
    assert lu.detect_language_fallback('नमस्ते यह एक परीक्षण है') == 'hi'
    assert lu.detect_language_fallback('Hola esto es una prueba') == 'es'
    # fallback to English when unclear
    assert lu.detect_language_fallback('asdf qwer') == 'en'
