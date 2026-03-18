import requests
import json
import os

# ===========================================================
# 🔑 CONFIGURATION
# ===========================================================
BASE_URL = "https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316384a"
API_KEY = "67b86729b5cc0eb92316384a"  # 🔸Replace with your actual key if different
def test_mt(text):
    print("\n🌍 Testing MT (Text Translation)...")
    if not text:
        print("⚠️  No input text found from ASR.")
        return None

    url = f"{BASE_URL}/generate_nmt/{API_KEY}"
    payload = {
        "source_language": "hi",
        "target_language": "en",
        "text": text
    }

    try:
        r = requests.post(url, json=payload)
        r.raise_for_status()
        result = r.json()
        translated = result.get("translated_text", "")
        print("✅ MT Output:", translated)
        return translated
    except Exception as e:
        print("❌ MT Error:", e)
        return None
