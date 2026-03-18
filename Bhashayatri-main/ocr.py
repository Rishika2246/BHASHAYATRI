import requests
import json
import urllib3
from typing import Dict, List
import base64
from pathlib import Path

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class BhashiniOCR:
    def __init__(self):
        # Single OCR model configuration
        self.ocr_config = {
            'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/6711fe751595b8ffe97adc1f',
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
        }
        
        # Supported image formats
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
        
        # Cache for repeated OCR on same image
        self.ocr_cache = {}
        
        # Session for connection pooling
        self.session = requests.Session()

    def extract_text(self, image_path: str) -> Dict:
        """
        Extract text from image using Bhashini OCR
        """
        # Validate file exists and format
        if not self._validate_image(image_path):
            return {
                'success': False,
                'error': 'Invalid image file or format'
            }
        
        # Create cache key
        cache_key = self._get_file_hash(image_path)
        
        # Check cache first
        if cache_key in self.ocr_cache:
            result = self.ocr_cache[cache_key].copy()
            result['cached'] = True
            return result

        try:
            # Prepare request
            headers = {
                'access-token': self.ocr_config['token']
            }
            
            # Open and send image file
            with open(image_path, 'rb') as image_file:
                files = {'file': image_file}
                
                response = self.session.post(
                    self.ocr_config['endpoint'],
                    files=files,
                    headers=headers,
                    verify=False,
                    timeout=15
                )
            
            # Process response
            if response.status_code == 200:
                result_data = response.json()
                
                if result_data.get('status') == 'success':
                    extracted_text = result_data['data']['decoded_text']
                    
                    result = {
                        'success': True,
                        'extracted_text': extracted_text,
                        'image_path': image_path,
                        'file_size': self._get_file_size(image_path),
                        'cached': False
                    }
                    
                    # Cache successful result
                    self.ocr_cache[cache_key] = result.copy()
                    return result
                    
                else:
                    return {
                        'success': False,
                        'error': result_data.get('message', 'OCR extraction failed'),
                        'cached': False
                    }
                    
            else:
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code} - {response.text}',
                    'cached': False
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'OCR request timed out (15 seconds)',
                'cached': False
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'OCR processing failed: {str(e)}',
                'cached': False
            }

    def batch_extract(self, image_paths: List[str]) -> List[Dict]:
        """
        Extract text from multiple images
        """
        return [self.extract_text(img_path) for img_path in image_paths]

    def extract_and_translate(self, image_path: str, target_lang: str, mt_model) -> Dict:
        """
        OCR + Translation pipeline
        """
        # Step 1: Extract text
        ocr_result = self.extract_text(image_path)
        
        if not ocr_result['success']:
            return ocr_result
        
        # Step 2: Translate text
        translated_result = mt_model.translate(
            ocr_result['extracted_text'], 
            'auto',  # Source language auto-detected or from OCR
            target_lang
        )
        
        return {
            'success': True,
            'ocr_result': ocr_result,
            'translation_result': translated_result,
            'extracted_text': ocr_result['extracted_text'],
            'translated_text': translated_result.get('translated_text') if translated_result['success'] else None
        }

    def _validate_image(self, image_path: str) -> bool:
        """Validate image file exists and format"""
        try:
            path = Path(image_path)
            return path.exists() and path.suffix.lower() in self.supported_formats
        except:
            return False

    def _get_file_hash(self, file_path: str) -> str:
        """Simple file hash for caching"""
        try:
            stat = Path(file_path).stat()
            return f"{file_path}_{stat.st_mtime}_{stat.st_size}"
        except:
            return file_path

    def _get_file_size(self, file_path: str) -> str:
        """Get file size in readable format"""
        try:
            size = Path(file_path).stat().st_size
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size/1024:.1f} KB"
            else:
                return f"{size/(1024*1024):.1f} MB"
        except:
            return "Unknown"

    def get_supported_formats(self) -> List[str]:
        """Get list of supported image formats"""
        return self.supported_formats

    def clear_cache(self):
        """Clear OCR cache"""
        self.ocr_cache.clear()

    def get_model_info(self) -> Dict:
        """Get OCR model information"""
        return {
            'endpoint': self.ocr_config['endpoint'],
            'supported_formats': self.supported_formats,
            'cache_size': len(self.ocr_cache)
        }

# ==================== USAGE EXAMPLES ====================

def demo_ocr_system():
    """Demo the OCR system"""
    ocr = BhashiniOCR()
    
    print("🚀 Bhashini OCR System - Fast & Efficient")
    print("=" * 50)
    print(f"📷 Supported formats: {', '.join(ocr.get_supported_formats())}")
    print(f"🔗 Endpoint: {ocr.ocr_config['endpoint']}")
    print("=" * 50)
    
    # Test with actual image paths
    test_images = [
        r"C:\Users\juluk\Downloads\hindi menu.jpg",
    ]
    
    for i, image_path in enumerate(test_images, 1):
        print(f"\n{i}. 📄 Processing: {Path(image_path).name}")
        
        if not ocr._validate_image(image_path):
            print(f"   ❌ Image not found or unsupported format")
            continue
            
        result = ocr.extract_text(image_path)
        
        if result['success']:
            print(f"   ✅ Text extracted ({result['file_size']}):")
            print(f"   📝 {result['extracted_text'][:100]}..." if len(result['extracted_text']) > 100 else f"   📝 {result['extracted_text']}")
            if result['cached']:
                print("   💾 (served from cache)")
        else:
            print(f"   ❌ Failed: {result['error']}")

def demo_ocr_translation_pipeline():
    """Demo OCR + Translation pipeline"""
    from htoef import BhashiniMT  # Import your MT class
    
    ocr = BhashiniOCR()
    mt = BhashiniMT()  # Your MT instance
    
    print("\n🔄 OCR + Translation Pipeline")
    print("=" * 50)
    
    image_path = "path/to/hindi_text_image.jpg"
    
    if ocr._validate_image(image_path):
        pipeline_result = ocr.extract_and_translate(image_path, "english", mt)
        
        if pipeline_result['success']:
            print("✅ Pipeline successful!")
            print(f"📷 Extracted: {pipeline_result['extracted_text']}")
            print(f"🔤 Translated: {pipeline_result['translated_text']}")
        else:
            print("❌ Pipeline failed")

if __name__ == "__main__":
    demo_ocr_system()
    # demo_ocr_translation_pipeline()