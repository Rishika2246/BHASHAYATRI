import requests
import os
import json
from pathlib import Path
from typing import Dict, List
import cv2
import sys
import numpy as np
from datetime import datetime

# ===========================================================
# ✅ OCR API CONFIGURATION
# ===========================================================

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

SUPPORTED_LANGUAGES = list(OCR_APIS.keys())

# ===========================================================
# 🧠 OCR API FUNCTION
# ===========================================================

def get_mime_type(file_path: str) -> str:
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
        return 'image/jpeg'

def extract_text_from_response(response_data: Dict, language: str) -> str:
    """Extract text from various API response formats"""
    # Try different response structures
    text_paths = [
        ['text'],
        ['data', 'text'],
        ['result', 'text'],
        ['output', 'text'],
        ['ocr_result', 'text'],
        ['extracted_text'],
        ['results', 0, 'text']
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
    
    return ""

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
    api_config = OCR_APIS.get(language)
    
    if not api_config:
        return {'success': False, 'text': '', 'error': f'Unsupported language: {language}'}
    
    try:
        # Prepare form-data with file
        with open(image_path, 'rb') as file:
            files = {
                'file': (os.path.basename(image_path), file, get_mime_type(image_path))
            }
            
            # Prepare headers with authorization
            headers = {
                'Authorization': f'Bearer {api_config["token"]}',
                'Accept': 'application/json'
            }
            
            print(f"📤 Sending to: {api_config['endpoint']}")
            response = requests.post(
                api_config['endpoint'],
                files=files,
                headers=headers,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ OCR API Success")
            
            # Extract text from response
            extracted_text = extract_text_from_response(result, language)
            
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

# ===========================================================
# 🖼 AUTOMATIC FILE DISCOVERY
# ===========================================================

def find_images_in_directory(directory: str = ".") -> List[str]:
    """Find all image files in directory and subdirectories"""
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.gif']
    image_paths = []
    
    for ext in image_extensions:
        image_paths.extend(Path(directory).glob(f"**/{ext}"))
        image_paths.extend(Path(directory).glob(f"**/{ext.upper()}"))
    
    return [str(p) for p in image_paths if p.is_file()]

def get_default_images() -> List[str]:
    """Get images from common directories"""
    common_dirs = [
        ".",
        "./images",
        "./pictures", 
        "./photos",
        "./downloads",
        "./desktop"
    ]
    
    all_images = []
    for directory in common_dirs:
        if os.path.exists(directory):
            images = find_images_in_directory(directory)
            all_images.extend(images)
    
    return all_images[:10]  # Limit to first 10 images

# ===========================================================
# 🎯 AUTOMATIC PROCESSING
# ===========================================================

def auto_process_images(language: str = 'english') -> List[Dict]:
    """Automatically find and process images without user input"""
    print("🔍 Scanning for images...")
    
    # Find images automatically
    image_paths = get_default_images()
    
    if not image_paths:
        print("❌ No images found in common directories")
        return []
    
    print(f"📁 Found {len(image_paths)} images")
    
    results = []
    for i, image_path in enumerate(image_paths, 1):
        print(f"\n📄 Processing {i}/{len(image_paths)}: {os.path.basename(image_path)}")
        
        # Process image
        ocr_result = extract_text_with_api(image_path, language)
        ocr_result['image'] = image_path
        
        results.append(ocr_result)
        
        # Print result
        if ocr_result['success']:
            text_preview = ocr_result['text'][:100] + "..." if len(ocr_result['text']) > 100 else ocr_result['text']
            print(f"✅ SUCCESS: {text_preview}")
        else:
            print(f"❌ FAILED: {ocr_result['error']}")
    
    return results

# ===========================================================
# 📊 RESULTS HANDLING
# ===========================================================

def save_results_to_file(results: List[Dict], output_file: str = "ocr_results.json"):
    """Save OCR results to JSON file"""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Results saved to: {output_file}")
        return True
    except Exception as e:
        print(f"❌ Failed to save results: {e}")
        return False

def print_detailed_results(results: List[Dict]):
    """Print detailed results"""
    print("\n" + "=" * 80)
    print("📊 DETAILED OCR RESULTS")
    print("=" * 80)
    
    for i, result in enumerate(results, 1):
        print(f"\n#{i} {os.path.basename(result['image'])}")
        print(f"   Language: {result['language'].upper()}")
        print(f"   Status: {'✅ SUCCESS' if result['success'] else '❌ FAILED'}")
        
        if result['success']:
            print(f"   Extracted Text: {result['text']}")
        else:
            print(f"   Error: {result['error']}")

def print_summary_report(results: List[Dict]):
    """Print summary report"""
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print("\n" + "=" * 60)
    print("📈 OCR PROCESSING SUMMARY")
    print("=" * 60)
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Failed: {len(failed)}")
    print(f"📁 Total Processed: {len(results)}")
    
    if successful:
        total_chars = sum(len(r['text']) for r in successful)
        avg_chars = total_chars / len(successful) if successful else 0
        print(f"📝 Total characters: {total_chars}")
        print(f"📝 Average length: {avg_chars:.1f} chars")
        
        # Show sample of successful extractions
        print(f"\n📋 Sample extracted texts:")
        for i, result in enumerate(successful[:3], 1):
            preview = result['text'][:80] + "..." if len(result['text']) > 80 else result['text']
            print(f"   {i}. {preview}")

# ===========================================================
# 🔹 MAIN AUTOMATED EXECUTION
# ===========================================================

def main_auto():
    """Main automated OCR system - no user input required"""
    print("\n" + "=" * 70)
    print("🚀 AUTOMATED MULTI-LANGUAGE OCR SYSTEM")
    print("=" * 70)
    print(f"🔤 Supported Languages: {', '.join(SUPPORTED_LANGUAGES)}")
    print("🔍 Automatically scanning for images...")
    print("=" * 70)
    
    # Process for all supported languages automatically
    all_results = []
    
    for language in SUPPORTED_LANGUAGES:
        print(f"\n🌍 Processing with {language.upper()} OCR...")
        print("-" * 50)
        
        results = auto_process_images(language)
        all_results.extend(results)
        
        # Brief summary for this language
        successful = [r for r in results if r['success']]
        print(f"📊 {language.upper()}: {len(successful)}/{len(results)} successful")
    
    # Overall summary
    if all_results:
        print_summary_report(all_results)
        
        # Save results automatically
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"auto_ocr_results_{timestamp}.json"
        if save_results_to_file(all_results, output_file):
            print(f"\n💡 Results automatically saved to: {output_file}")
        
        # Show detailed results option
        show_details = input("\n🔍 Show detailed results? (y/n): ").strip().lower()
        if show_details in ['y', 'yes']:
            print_detailed_results(all_results)
    else:
        print("\n❌ No images were processed successfully.")
    
    print("\n🎯 Automated OCR processing completed!")

def main_single_language(language: str = 'english'):
    """Process with a single specific language"""
    print(f"\n🔤 Processing with {language.upper()} OCR only")
    print("=" * 50)
    
    results = auto_process_images(language)
    
    if results:
        print_summary_report(results)
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"ocr_{language}_{timestamp}.json"
        save_results_to_file(results, output_file)
    else:
        print("❌ No images found or processed.")

# ===========================================================
# 🎯 QUICK TEST FUNCTION
# ===========================================================

def quick_test():
    """Quick test with sample images"""
    print("\n🧪 QUICK OCR TEST")
    print("=" * 50)
    
    # Test with English and Hindi
    test_languages = ['english', 'hindi']
    
    for language in test_languages:
        print(f"\n🔬 Testing {language.upper()} OCR:")
        print("-" * 30)
        
        # Find up to 2 test images
        test_images = get_default_images()[:2]
        
        if test_images:
            for image_path in test_images:
                print(f"📄 Testing: {os.path.basename(image_path)}")
                result = extract_text_with_api(image_path, language)
                
                if result['success']:
                    print(f"✅ SUCCESS: {result['text'][:100]}...")
                else:
                    print(f"❌ FAILED: {result['error']}")
        else:
            print("⚠️ No test images found")

# ===========================================================
# 🚀 EXECUTION OPTIONS
# ===========================================================

if __name__ == "__main__":
    # Check command line arguments for different modes
    if len(sys.argv) > 1:
        if sys.argv[1] == 'test':
            quick_test()
        elif sys.argv[1] in SUPPORTED_LANGUAGES:
            main_single_language(sys.argv[1])
        elif sys.argv[1] == 'all':
            main_auto()
        else:
            print("Usage: python ocr_system.py [test|all|language_name]")
            print(f"Supported languages: {', '.join(SUPPORTED_LANGUAGES)}")
    else:
        # Default: run automated multi-language processing
        main_auto()