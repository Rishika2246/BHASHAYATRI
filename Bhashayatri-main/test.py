import json
import requests
import os
import tempfile
from gtts import gTTS
import simpleaudio as sa
import urllib3

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load configuration
with open("tts_endpoints.json", "r") as f:
    CONFIG = json.load(f)

LANG_CODES = CONFIG  # your JSON structure already maps languages
# Example: LANG_CODES["en"]["api_url"], LANG_CODES["en"]["token"]

def play_audio_file(file_path):
    """Play WAV audio inside terminal using simpleaudio"""
    try:
        wave_obj = sa.WaveObject.from_wave_file(file_path)
        play_obj = wave_obj.play()
        play_obj.wait_done()
    except Exception as e:
        print(f"❌ Error playing audio: {e}")

def bhashini_tts(text, lang="en", gender="female"):
    """Use Bhashini TTS API"""
    if lang not in LANG_CODES:
        print(f"❌ Language '{lang}' not supported.")
        return False

    url = LANG_CODES[lang]["api_url"]
    token = LANG_CODES[lang]["token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {"text": text, "gender": gender}

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60, verify=False)
        response.raise_for_status()
        data = response.json()
        audio_url = data.get("data", {}).get("s3_url")

        if not audio_url:
            print("⚠️ No audio URL returned by Bhashini. Using local TTS fallback.")
            return local_tts(text, lang)

        # Download audio
        r = requests.get(audio_url, timeout=60)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(r.content)
            tmp_path = tmp.name

        print(f"🔊 Playing TTS for '{text}' in {lang}")
        play_audio_file(tmp_path)
        os.remove(tmp_path)
        return True

    except Exception as e:
        print(f"❌ Bhashini TTS failed: {e}")
        return local_tts(text, lang)

def local_tts(text, lang="en"):
    """Fallback using gTTS"""
    gtts_lang_map = {
        "en": "en", "ta": "ta", "te": "te", "mr": "mr", "gu": "gu", "as": "en"
    }
    if lang not in gtts_lang_map:
        print(f"❌ Local TTS does not support '{lang}'")
        return False

    tts = gTTS(text=text, lang=gtts_lang_map[lang])
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tts.save(tmp.name)
        tmp_path = tmp.name

    print(f"🔊 Playing fallback TTS for '{text}' in {lang}")
    if os.name == "nt":
        # Convert mp3 -> wav using simpleaudio can't play mp3 directly
        try:
            import pydub
            from pydub import AudioSegment
            sound = AudioSegment.from_mp3(tmp_path)
            wav_path = tmp_path.replace(".mp3", ".wav")
            sound.export(wav_path, format="wav")
            play_audio_file(wav_path)
            os.remove(wav_path)
        except ImportError:
            print("❌ Install 'pydub' to play MP3 fallback in terminal: pip install pydub")
            os.system(f"start {tmp_path}")  # fallback to external player
    else:
        # macOS / Linux
        os.system(f"mpg123 {tmp_path}")

    os.remove(tmp_path)
    return True

def main():
    print("=== 🌐 BHASHINI MULTI-LANGUAGE TTS ===")
    print("Commands:")
    print("  speak [lang] [text] [gender]")
    print("Languages:", ", ".join(LANG_CODES.keys()))
    print("="*40)

    while True:
        try:
            user_input = input("\n🎤 Enter command: ").strip()
            if user_input.lower() in ["quit", "exit", "q"]:
                print("👋 Goodbye!")
                break

            if user_input.startswith("speak "):
                parts = user_input.split(" ", 3)
                if len(parts) >= 3:
                    _, lang, text = parts[:3]
                    gender = parts[3] if len(parts) == 4 else "female"
                    bhashini_tts(text, lang, gender)
                else:
                    print("❌ Usage: speak [lang] [text] [gender]")
            else:
                print("❌ Unknown command. Use 'speak [lang] [text] [gender]'")

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
