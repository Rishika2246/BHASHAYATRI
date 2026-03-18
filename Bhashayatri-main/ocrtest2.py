import cv2
import pytesseract
import numpy as np
import os
from PIL import Image

# ===========================================================
# ✅ CONFIGURATION
# ===========================================================
# Set Tesseract path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Optional: Set TESSDATA_PREFIX to ensure language data is found
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

# ===========================================================
# 🧠 OPTIMIZED TESSERACT OCR FUNCTION
# ===========================================================
def extract_text_with_tesseract(image_path):
    print("\n🚀 Starting OCR:", image_path)

    # --- Step 1: Load image ---
    image = cv2.imread(image_path)
    if image is None:
        print("❌ Error: Image not found.")
        return None

    # --- Step 2: Downscale large images for faster processing ---
    if max(image.shape[:2]) > 1000:
        scale = 1000 / max(image.shape[:2])
        image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    # --- Step 3: Preprocess (fastest + effective) ---
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # --- Step 4: Define language(s) ---
    language = "hin+eng"  # mixed Hindi + English
    custom_config = r"--oem 3 --psm 6"

    # --- Step 5: Run Tesseract once (optimized path) ---
    try:
        data = pytesseract.image_to_data(
            thresh, lang=language, config=custom_config, output_type=pytesseract.Output.DICT
        )

        # Extract recognized text and calculate confidence
        valid_text = [t for i, t in enumerate(data["text"]) if int(data["conf"][i]) > 30]
        text = " ".join(valid_text).strip()

        confidences = [int(x) for x in data["conf"] if int(x) > 0]
        avg_conf = np.mean(confidences) if confidences else 0

        # --- Step 6: Display results ---
        print(f"✅ OCR Successful: {language}, Confidence: {avg_conf:.2f}%\n")
        print("📝 Full Extracted Text:\n")
        print(text if text else "(No readable text found.)")

        return text

    except pytesseract.TesseractNotFoundError:
        print("❌ Tesseract not found. Check your installation path.")
    except pytesseract.TesseractError as e:
        if "Failed loading language" in str(e):
            print("⚠️ Missing Hindi language data (hin.traineddata).")
            print("👉 Download it from: https://github.com/tesseract-ocr/tessdata_best")
        else:
            print("❌ OCR Error:", e)
    except Exception as e:
        print("❌ Unexpected Error:", e)

    return None

# ===========================================================
# 🧪 TESTING
# ===========================================================
if __name__ == "__main__":
    # 🔸 Change this path to your test image
    test_image = r"C:\Users\juluk\OneDrive\Pictures\Screenshots\Screenshot 2025-10-12 025857.png"
    print("\n🔍 Checking Tesseract setup...")
    print("Version:", pytesseract.get_tesseract_version())

    # Run OCR
    extract_text_with_tesseract(test_image)
