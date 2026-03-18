import requests
import os
import json
from pathlib import Path
from typing import Dict, List, Optional
import cv2
import base64


OCR_APIS = {
    'hindi': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/6711fe751595b8ffe97adc1f',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'english': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f420802ae0a1948845594', 
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'bengali': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f5c8902ae0a19488455a6',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'tamil': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f65df02ae0a19488455b4',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'telugu': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f65f502ae0a19488455b5',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'marathi': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f650402ae0a19488455b2',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'gujarati': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f64c202ae0a19488455af',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'kannada': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f64db02ae0a19488455b0',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    },
    'punjabi': {
        'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/687f651a02ae0a19488455b3',
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
    }
}

# Common OCR API (if using single endpoint for all languages)
COMMON_OCR_API = {
    'endpoint': 'YOUR_COMMON_OCR_API_ENDPOINT',
    'token': 'YOUR_COMMON_OCR_API_TOKEN'
}

# Supported languages
SUPPORTED_LANGUAGES = list(OCR_APIS.keys())


def extract_text_with_api(image_path: str, language: str = 'english') -> Dict:
    """
    Extract text from image using OCR API with form-data
    Returns: {'success': bool, 'text': str, 'error': str}
    """
    print(f"\n🚀 OCR API Started for {language.upper()}")
    print(f"📁 Image: {image_path}")
    
    if not os.path.exists(image_path):
        return {'success': False, 'text': '', 'error': 'Image file not found'}
    
    # Get API configuration
    api_config = OCR_APIS.get(language, COMMON_OCR_API)
    
    if not api_config.get('endpoint') or not api_config.get('token'):
        return {'success': False, 'text': '', 'error': f'API configuration missing for {language}'}
    
    try:
        # Prepare form-data with file
        files = {
            'file': (
                os.path.basename(image_path), 
                open(image_path, 'rb'), 
                self._get_mime_type(image_path)
            )
        }
        
        # Prepare headers with authorization
        headers = {
            'Authorization': f'Bearer {api_config["token"]}',
            'Accept': 'application/json'
        }
        
        # Prepare data with language parameter
        data = {
            'language': language,
            'source_lang': language
        }
        
        print(f"📤 Sending to: {api_config['endpoint']}")
        response = requests.post(
            api_config['endpoint'],
            files=files,
            data=data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ OCR API Success")
            
            # Extract text from response
            extracted_text = self._extract_text_from_response(result, language)
            
            if extracted_text:
                return {
                    'success': True, 
                    'text': extracted_text, 
                    'language': language,
                    'api_used': api_config['endpoint']
                }
            else:
                return {
                    'success': False, 
                    'text': '', 
                    'error': 'No text found in API response'
                }
                
        else:
            error_msg = f"API Error {response.status_code}"
            try:
                error_data = response.json()
                if 'error' in error_data:
                    error_msg = error_data['error']
                elif 'message' in error_data:
                    error_msg = error_data['message']
            except:
                error_msg = response.text[:200]
            
            print(f"❌ {error_msg}")
            return {'success': False, 'text': '', 'error': error_msg}
            
    except requests.exceptions.Timeout:
        error_msg = "OCR API timeout (30s)"
        print(f"❌ {error_msg}")
        return {'success': False, 'text': '', 'error': error_msg}
        
    except requests.exceptions.ConnectionError:
        error_msg = "Cannot connect to OCR API"
        print(f"❌ {error_msg}")
        return {'success': False, 'text': '', 'error': error_msg}
        
    except Exception as e:
        error_msg = f"OCR API Exception: {str(e)}"
        print(f"❌ {error_msg}")
        return {'success': False, 'text': '', 'error': error_msg}
        
    finally:
        # Ensure file is closed
        if 'files' in locals():
            files['file'][1].close()

def _get_mime_type(self, file_path: str) -> str:
    """Get MIME type based on file extension"""
    ext = Path(file_path).suffix.lower()
    if ext in ['.jpg', '.jpeg']:
        return 'image/jpeg'
    elif ext == '.png':
        return 'image/png'
    elif ext == '.gif':
        return 'image/gif'
    elif ext == '.bmp':
        return 'image/bmp'
    else:
        return 'image/jpeg'  # default

def _extract_text_from_response(self, response_data: Dict, language: str) -> str:
    """Extract text from various API response formats"""
    
    # Try different response structures
    text_paths = [
        ['text'],
        ['data', 'text'],
        ['result', 'text'],
        ['output', 'text'],
        ['ocr_result', 'text'],
        ['extracted_text'],
        [language, 'text'],
        ['results', 0, 'text']  # For array responses
    ]
    
    for path in text_paths:
        try:
            current = response_data
            for key in path:
                if isinstance(current, list) and isinstance(key, int) and key < len(current):
                    current = current[key]
                elif isinstance(current, dict) and key in current:
                    current = current[key]
                else:
                    break
            else:
                if isinstance(current, str) and current.strip():
                    return current.strip()
        except:
            continue
    
    # If no structured text found, try to find any string in the response
    return self._find_any_text(response_data)

def _find_any_text(self, data) -> str:
    """Recursively find any text in the response"""
    if isinstance(data, str) and data.strip():
        return data.strip()
    elif isinstance(data, dict):
        for value in data.values():
            result = self._find_any_text(value)
            if result:
                return result
    elif isinstance(data, list):
        for item in data:
            result = self._find_any_text(item)
            if result:
                return result
    return ""

# ===========================================================
# 🖼 IMAGE VALIDATION & PREPROCESSING
# ===========================================================

def validate_image_file(image_path: str) -> Dict:
    """Validate image file before processing"""
    if not os.path.exists(image_path):
        return {'valid': False, 'error': 'File does not exist'}
    
    if not os.path.isfile(image_path):
        return {'valid': False, 'error': 'Path is not a file'}
    
    # Check file extension
    valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif']
    file_ext = Path(image_path).suffix.lower()
    if file_ext not in valid_extensions:
        return {'valid': False, 'error': f'Invalid file extension. Supported: {valid_extensions}'}
    
    # Check file size (max 10MB)
    file_size = os.path.getsize(image_path) / (1024 * 1024)  # MB
    if file_size > 10:
        return {'valid': False, 'error': f'File too large ({file_size:.1f}MB). Max 10MB allowed'}
    
    # Try to open image with OpenCV to verify it's a valid image
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {'valid': False, 'error': 'Invalid image file or corrupted'}
        
        return {
            'valid': True, 
            'dimensions': f"{img.shape[1]}x{img.shape[0]}",
            'size_mb': file_size
        }
    except Exception as e:
        return {'valid': False, 'error': f'Image validation failed: {str(e)}'}

def preprocess_image(image_path: str, output_path: str = None) -> str:
    """
    Basic image preprocessing to improve OCR accuracy
    Returns path to processed image
    """
    if output_path is None:
        output_path = image_path  # Overwrite original
    
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return image_path  # Return original if can't process
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Resize if too large (max 2000px on longer side)
        height, width = gray.shape
        max_dimension = 2000
        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            gray = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Apply noise reduction
        denoised = cv2.medianBlur(gray, 3)
        
        # Apply sharpening
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(denoised, -1, kernel)
        
        # Save processed image
        cv2.imwrite(output_path, sharpened)
        print(f"🖼 Image preprocessed: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"⚠️ Preprocessing failed: {e}, using original image")
        return image_path

# ===========================================================
# 🎯 BATCH PROCESSING
# ===========================================================

def process_multiple_images(image_paths: List[str], language: str = 'english') -> List[Dict]:
    """Process multiple images in batch"""
    results = []
    
    print(f"\n🔄 Batch processing {len(image_paths)} images in {language.upper()}")
    print("=" * 60)
    
    for i, image_path in enumerate(image_paths, 1):
        print(f"\n📄 Processing {i}/{len(image_paths)}: {os.path.basename(image_path)}")
        
        # Validate image
        validation = validate_image_file(image_path)
        if not validation['valid']:
            result = {
                'success': False,
                'image': image_path,
                'error': validation['error'],
                'language': language
            }
            results.append(result)
            continue
        
        # Preprocess image
        processed_path = preprocess_image(image_path)
        
        # Extract text
        ocr_result = extract_text_with_api(processed_path, language)
        ocr_result['image'] = image_path
        ocr_result['dimensions'] = validation.get('dimensions', 'Unknown')
        
        results.append(ocr_result)
        
        # Print result summary
        if ocr_result['success']:
            text_preview = ocr_result['text'][:100] + "..." if len(ocr_result['text']) > 100 else ocr_result['text']
            print(f"✅ SUCCESS: {text_preview}")
        else:
            print(f"❌ FAILED: {ocr_result['error']}")
    
    return results



def save_results_to_file(results: List[Dict], output_file: str = "ocr_results.json"):
    """Save OCR results to JSON file"""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Results saved to: {output_file}")
    except Exception as e:
        print(f"❌ Failed to save results: {e}")

def print_summary_report(results: List[Dict]):
    """Print summary report of OCR processing"""
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print("\n" + "=" * 60)
    print("📊 OCR PROCESSING SUMMARY")
    print("=" * 60)
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Failed: {len(failed)}")
    print(f"📁 Total: {len(results)}")
    
    if successful:
        total_chars = sum(len(r['text']) for r in successful)
        avg_chars = total_chars / len(successful)
        print(f"📝 Total characters extracted: {total_chars}")
        print(f"📝 Average text length: {avg_chars:.1f} chars")
    
    if failed:
        print(f"\n❌ Failed images:")
        for result in failed:
            print(f"   - {os.path.basename(result['image'])}: {result['error']}")

# ===========================================================
# 🔍 LANGUAGE DETECTION (Optional)
# ===========================================================

def detect_language_from_filename(image_path: str) -> str:
    """Simple language detection based on filename keywords"""
    filename = Path(image_path).stem.lower()
    
    language_keywords = {
        'hindi': ['hindi', 'hin', 'hi', 'हिंदी'],
        'bengali': ['bengali', 'ben', 'bn', 'বাংলা'],
        'tamil': ['tamil', 'tam', 'ta', 'தமிழ்'],
        'telugu': ['telugu', 'tel', 'te', 'తెలుగు'],
        'marathi': ['marathi', 'mar', 'mr', 'मराठी'],
        'gujarati': ['gujarati', 'guj', 'gu', 'ગુજરાતી'],
        'kannada': ['kannada', 'kan', 'kn', 'ಕನ್ನಡ'],
        'malayalam': ['malayalam', 'mal', 'ml', 'മലയാളം'],
        'punjabi': ['punjabi', 'pan', 'pa', 'ਪੰਜਾਬੀ']
    }
    
    for lang, keywords in language_keywords.items():
        if any(keyword in filename for keyword in keywords):
            print(f"🔍 Detected language from filename: {lang.upper()}")
            return lang
    
    return 'english'  # default

# ===========================================================
# 🖥 USER INTERFACE & INPUT HANDLING
# ===========================================================

def get_user_input() -> Dict:
    """Get input from user via command line"""
    print("\n" + "=" * 50)
    print("🖼 MULTI-LANGUAGE OCR SYSTEM")
    print("=" * 50)
    
    # Get image path(s)
    while True:
        image_input = input("\n📁 Enter image path or folder path (or 'quit' to exit): ").strip()
        
        if image_input.lower() == 'quit':
            return {'action': 'quit'}
        
        if not image_input:
            print("❌ Please enter a valid path")
            continue
            
        # Check if path exists
        if not os.path.exists(image_input):
            print("❌ Path does not exist")
            continue
            
        break
    
    # Get language
    print(f"\n🌍 Supported languages: {', '.join(SUPPORTED_LANGUAGES)}")
    while True:
        language = input("🔤 Enter language (default: english): ").strip().lower()
        
        if not language:
            language = 'english'
            break
            
        if language in SUPPORTED_LANGUAGES:
            break
        else:
            print(f"❌ Unsupported language. Choose from: {', '.join(SUPPORTED_LANGUAGES)}")
    
    # Determine if single file or folder
    if os.path.isfile(image_input):
        image_paths = [image_input]
        mode = 'single'
    else:
        # Get all image files from folder
        image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.gif']
        image_paths = []
        for ext in image_extensions:
            image_paths.extend(Path(image_input).glob(f"**/{ext}"))
            image_paths.extend(Path(image_input).glob(f"**/{ext.upper()}"))
        
        if not image_paths:
            print("❌ No image files found in folder")
            return get_user_input()
            
        mode = 'batch'
    
    return {
        'image_paths': [str(p) for p in image_paths],
        'language': language,
        'mode': mode
    }

# ===========================================================
# 🔹 MAIN EXECUTION
# ===========================================================

def main():
    """Main OCR system"""
    
    # Display welcome message
    print("\n" + "=" * 60)
    print("🚀 MULTI-LANGUAGE OCR SYSTEM")
    print("=" * 60)
    print(f"📖 Supported Languages: {len(SUPPORTED_LANGUAGES)}")
    print(f"🔤 Languages: {', '.join(SUPPORTED_LANGUAGES)}")
    print("=" * 60)
    
    while True:
        # Get user input
        user_input = get_user_input()
        
        if user_input['action'] == 'quit':
            print("\n👋 Thank you for using Multi-Language OCR System!")
            break
        
        # Process images
        results = process_multiple_images(
            user_input['image_paths'], 
            user_input['language']
        )
        
        # Show summary
        print_summary_report(results)
        
        # Save results
        save_option = input("\n💾 Save results to file? (y/n): ").strip().lower()
        if save_option in ['y', 'yes']:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"ocr_results_{timestamp}.json"
            save_results_to_file(results, output_file)
        
        # Continue or exit
        continue_option = input("\n🔄 Process more images? (y/n): ").strip().lower()
        if continue_option not in ['y', 'yes']:
            print("\n👋 Thank you for using Multi-Language OCR System!")
            break

# ===========================================================
# 🧪 TEST FUNCTION
# ===========================================================

def test_ocr_system():
    """Test the OCR system with sample configuration"""
    print("\n🧪 TESTING OCR SYSTEM")
    print("=" * 50)
    
    # Test configuration
    test_images = [
        r"C:\Users\juluk\OneDrive\Pictures\Screenshots\Screenshot 2025-10-12 025857.png",
        # Add more test images here
    ]
    
    test_languages = ['english', 'hindi']  # Test with these languages
    
    for language in test_languages:
        print(f"\n🔬 Testing {language.upper()} OCR:")
        print("-" * 30)
        
        for image_path in test_images:
            if os.path.exists(image_path):
                print(f"\n📄 Testing: {os.path.basename(image_path)}")
                result = extract_text_with_api(image_path, language)
                
                if result['success']:
                    print(f"✅ SUCCESS: {result['text'][:100]}...")
                else:
                    print(f"❌ FAILED: {result['error']}")
            else:
                print(f"⚠️ Test image not found: {image_path}")

# ===========================================================
# RUN SYSTEM
# ===========================================================

if __name__ == "__main__":
    import numpy as np
    from datetime import datetime
    
    # Check if running in test mode
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        test_ocr_system()
    else:
        main()