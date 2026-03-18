import cv2
import pytesseract
import numpy as np
import os
import requests
import json
from pathlib import Path

# ===========================================================
# ✅ CONFIGURATION
# ===========================================================
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

API_ENDPOINT = "https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316384a"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8"

# ===========================================================
# 🧠 OCR FUNCTION (Optimized)
# ===========================================================
def extract_text_from_image(image_path: str) -> str:
    print(f"\n🚀 OCR Started: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        print("❌ Error: Image not found.")
        return ""

    # Downscale large images
    if max(image.shape[:2]) > 1000:
        scale = 1000 / max(image.shape[:2])
        image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    try:
        data = pytesseract.image_to_data(
            thresh, lang="hin+eng", config="--oem 3 --psm 6", output_type=pytesseract.Output.DICT
        )
        valid_text = [t for i, t in enumerate(data["text"]) if int(data["conf"][i]) > 30]
        text = " ".join(valid_text).strip()
        confidences = [int(x) for x in data["conf"] if int(x) > 0]
        avg_conf = np.mean(confidences) if confidences else 0

        print(f"✅ OCR Done (Confidence: {avg_conf:.2f}%)")
        print(f"📝 Extracted Text: {text[:200]}{'...' if len(text) > 200 else ''}")
        return text
    except Exception as e:
        print(f"❌ OCR Error: {e}")
        return ""

# ===========================================================
# 🌍 HINDI → ENGLISH TRANSLATION
# ===========================================================
def translate_hindi_to_english(text: str) -> str:
    if not text.strip():
        return ""
    payload = {"input_text": text}
    headers = {"access-token": ACCESS_TOKEN, "Content-Type": "application/json"}
    try:
        response = requests.post(API_ENDPOINT, json=payload, headers=headers, verify=False, timeout=30)
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success" and result.get("data", {}).get("output_text"):
                translated = result["data"]["output_text"]
                print(f"🔄 Translation Done: {translated[:200]}{'...' if len(translated) > 200 else ''}")
                return translated
        print(f"❌ Translation API Error: {response.status_code}")
        return ""
    except Exception as e:
        print(f"❌ Translation Exception: {e}")
        return ""

# ===========================================================
# 🖼 IMAGE → TEXT → TRANSLATION
# ===========================================================
def process_image(image_path: str):
    print("="*60)
    print(f"📄 Processing Image: {image_path}")
    text = extract_text_from_image(image_path)
    if text:
        translated = translate_hindi_to_english(text)
        print("\n🎯 FINAL RESULT")
        print(f"🇮🇳 Hindi: {text}")
        print(f"🇬🇧 English: {translated if translated else '(Translation failed)'}")
    else:
        print("❌ No text detected in image.")
    print("="*60 + "\n")

# ===========================================================
# 🔹 MAIN EXECUTION
# ===========================================================
if __name__ == "__main__":
    # Example: Replace with your image paths
    images_to_process = [
        r"C:\Users\juluk\OneDrive\Pictures\Screenshots\Screenshot 2025-10-12 025857.png",
        # Add more images here
    ]

    for img_path in images_to_process:
        process_image(img_path)

