import json
import requests
import os
import tempfile
from gtts import gTTS
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load Bhashini config
with open("tts_endpoints.json", "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

LANG_CODES = CONFIG.keys()

def bhashini_tts(text, lang="en", gender="female"):
    if lang not in LANG_CODES:
        print(f"❌ Language '{lang}' not supported.")
        return False

    url = CONFIG[lang]["api_url"]
    token = CONFIG[lang]["token"]

    payload = {"text": text.strip(), "gender": gender.lower()}
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Debug info
    print(f"🔹 URL: {url}")
    print(f"🔹 Payload: {payload}")

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60, verify=False)
        response.raise_for_status()

        data = response.json()
        audio_url = data.get("data", {}).get("s3_url")
        if not audio_url:
            print("⚠️ No audio URL returned. Falling back to local TTS.")
            return local_tts(text, lang)

        # Download audio
        r = requests.get(audio_url, timeout=60)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(r.content)
            tmp_path = tmp.name

        # Play audio
        if os.name == "nt":
            os.system(f"start {tmp_path}")
        else:
            os.system(f"afplay {tmp_path}" if os.uname().sysname == "Darwin" else f"aplay {tmp_path}")

        print("✅ Bhashini TTS played successfully.")
        return True

    except requests.exceptions.HTTPError as e:
        print(f"❌ Bhashini TTS failed: {e} - {response.text}")
        return local_tts(text, lang)
    except Exception as e:
        print(f"❌ Bhashini TTS exception: {e}")
        return local_tts(text, lang)

def local_tts(text, lang="en"):
    gtts_lang_map = {"en": "en", "ta": "ta", "te": "te", "mr": "mr", "gu": "gu", "as": "en"}
    if lang not in gtts_lang_map:
        print(f"❌ Local TTS does not support '{lang}'")
        return False

    tts = gTTS(text=text, lang=gtts_lang_map[lang])
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tts.save(tmp.name)
        tmp_path = tmp.name

    if os.name == "nt":
        os.system(f"start {tmp_path}")
    else:
        os.system(f"afplay {tmp_path}" if os.uname().sysname == "Darwin" else f"mpg123 {tmp_path}")

    print("✅ Local TTS played successfully.")
    return True

def main():
    print("=== 🌐 BHASHINI MULTI-LANGUAGE TTS ===")
    print("Commands:")
    print("  speak [lang] [text] [gender]")
    print("Languages:", ", ".join(LANG_CODES))
    print("=====================================")

    while True:
        try:
            user_input = input("\n🎤 Enter command: ").strip()
            if user_input.lower() in ["quit", "exit", "q"]:
                print("👋 Goodbye!")
                break

            if user_input.startswith("speak "):
                parts = user_input.split(" ", 3)
                if len(parts) < 3:
                    print("❌ Usage: speak [lang] [text] [gender]")
                    continue

                lang = parts[1].lower()
                text = parts[2]
                gender = parts[3] if len(parts) == 4 else "female"
                bhashini_tts(text, lang, gender)

            else:
                print("❌ Unknown command. Use 'speak [lang] [text] [gender]'")

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
