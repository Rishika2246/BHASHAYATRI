import requests
import json
import urllib3
from typing import Dict, List, Optional
import base64
from pathlib import Path
import time
import hashlib
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import sys

# Try to set Tesseract path, but continue if not found
try:
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
except:
    pass

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class MultiOCR:
    def __init__(self):
        # Bhashini OCR configuration - UPDATED with better endpoint
        self.bhashini_config = {
            'endpoint': 'https://canvas.iiit.ac.in/sandboxbeprod/check_ocr_status_and_infer/6711fe751595b8ffe97adc1f',
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8'
        }
        
        # Multiple free OCR APIs as fallbacks
        self.alternative_apis = [
            {
                'name': 'OCR.Space',
                'url': 'https://api.ocr.space/parse/image',
                'key': 'K82717712788957',
                'method': 'POST'
            },
            {
                'name': 'FreeOCR',
                'url': 'https://api.freeocr.org/v1/ocr',
                'key': '',
                'method': 'POST'
            }
        ]
        
        # Supported image formats
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
        
        # Cache for repeated OCR on same image
        self.ocr_cache = {}
        
        # Session for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        })
        
        # Retry configuration
        self.max_retries = 3
        self.retry_delay = 2
        
        # Check Tesseract availability
        self.tesseract_available = self._check_tesseract()
        
        # Service status
        self.service_status = {
            'bhashini': True,  # Assume true initially, test later
            'ocr_space': True,
            'tesseract': self.tesseract_available
        }

    def _check_tesseract(self) -> bool:
        """Check if Tesseract OCR is available locally"""
        try:
            pytesseract.get_tesseract_version()
            print("✅ Tesseract found")
            return True
        except Exception as e:
            print(f"⚠️ Tesseract not available: {e}")
            return False

    def test_bhashini_connection(self) -> bool:
        """Test Bhashini endpoint with better error handling"""
        try:
            print("Testing Bhashini connection...")
            response = self.session.get(
                self.bhashini_config['endpoint'],
                timeout=10,
                verify=False
            )
            status_ok = response.status_code < 500
            print(f"Bhashini status: {response.status_code} - {'✅' if status_ok else '❌'}")
            return status_ok
        except Exception as e:
            print(f"Bhashini connection failed: {e}")
            return False

    def test_ocr_space_connection(self) -> bool:
        """Test OCR.Space endpoint"""
        try:
            print("Testing OCR.Space connection...")
            response = self.session.head(
                'https://api.ocr.space/parse/image',
                timeout=10
            )
            status_ok = response.status_code < 500
            print(f"OCR.Space status: {response.status_code} - {'✅' if status_ok else '❌'}")
            return status_ok
        except Exception as e:
            print(f"OCR.Space connection failed: {e}")
            return False

    def extract_text_with_bhashini(self, image_path: str) -> Dict:
        """Extract text using Bhashini OCR with improved error handling"""
        print("🔄 Attempting Bhashini OCR...")
        
        for attempt in range(self.max_retries + 1):
            try:
                headers = {
                    'access-token': self.bhashini_config['token'],
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                with open(image_path, 'rb') as image_file:
                    files = {'file': (Path(image_path).name, image_file, 'image/jpeg')}
                    
                    print(f"Sending request to Bhashini (attempt {attempt + 1})...")
                    response = self.session.post(
                        self.bhashini_config['endpoint'],
                        files=files,
                        headers=headers,
                        verify=False,
                        timeout=(10, 30)
                    )
                
                print(f"Bhashini response status: {response.status_code}")
                
                if response.status_code == 200:
                    result_data = response.json()
                    print(f"Bhashini response: {result_data}")
                    
                    if result_data.get('status') == 'success':
                        extracted_text = result_data['data']['decoded_text']
                        print(f"✅ Bhashini extracted {len(extracted_text)} characters")
                        return {
                            'success': True,
                            'extracted_text': extracted_text,
                            'service': 'bhashini',
                            'attempts': attempt + 1
                        }
                    else:
                        error_msg = result_data.get('message', 'Bhashini OCR processing failed')
                        print(f"❌ Bhashini error: {error_msg}")
                        return {
                            'success': False,
                            'error': error_msg,
                            'service': 'bhashini'
                        }
                else:
                    error_msg = f'HTTP {response.status_code}'
                    print(f"❌ Bhashini HTTP error: {error_msg}")
                    if attempt < self.max_retries:
                        print(f"Retrying in {self.retry_delay} seconds...")
                        time.sleep(self.retry_delay)
                        continue
                    return {
                        'success': False,
                        'error': error_msg,
                        'service': 'bhashini'
                    }
                    
            except Exception as e:
                error_msg = str(e)
                print(f"❌ Bhashini exception: {error_msg}")
                if attempt < self.max_retries:
                    print(f"Retrying in {self.retry_delay} seconds...")
                    time.sleep(self.retry_delay)
                    continue
                return {
                    'success': False,
                    'error': error_msg,
                    'service': 'bhashini'
                }

    def extract_text_with_ocr_space(self, image_path: str) -> Dict:
        """Extract text using OCR.Space API with improved handling"""
        print("🔄 Attempting OCR.Space...")
        try:
            with open(image_path, 'rb') as image_file:
                print("Sending to OCR.Space...")
                response = self.session.post(
                    'https://api.ocr.space/parse/image',
                    files={'image': image_file},
                    data={
                        'apikey': 'K82717712788957', 
                        'language': 'eng',  # Try 'hin' for Hindi
                        'isOverlayRequired': False,
                        'OCREngine': 2
                    },
                    timeout=30
                )
            
            print(f"OCR.Space response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"OCR.Space result keys: {result.keys()}")
                
                if result.get('IsErroredOnProcessing'):
                    error_msg = result.get('ErrorMessage', 'OCR.Space processing error')
                    print(f"❌ OCR.Space error: {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg,
                        'service': 'ocr_space'
                    }
                else:
                    text = ''
                    for item in result.get('ParsedResults', []):
                        text += item.get('ParsedText', '') + '\n'
                    
                    text = text.strip()
                    print(f"✅ OCR.Space extracted {len(text)} characters")
                    return {
                        'success': True,
                        'extracted_text': text,
                        'service': 'ocr_space'
                    }
            else:
                error_msg = f'HTTP {response.status_code}'
                print(f"❌ OCR.Space HTTP error: {error_msg}")
                return {
                    'success': False,
                    'error': error_msg,
                    'service': 'ocr_space'
                }
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ OCR.Space exception: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'service': 'ocr_space'
            }

    def extract_text_with_tesseract(self, image_path: str) -> Dict:
        """Extract text using local Tesseract OCR with improved preprocessing"""
        if not self.tesseract_available:
            return {
                'success': False,
                'error': 'Tesseract not available',
                'service': 'tesseract'
            }
        
        print("🔄 Attempting Tesseract OCR...")
        try:
            # Read and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                return {
                    'success': False,
                    'error': 'Could not read image file',
                    'service': 'tesseract'
                }
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Multiple preprocessing techniques
            processed_images = []
            
            # 1. Simple threshold
            _, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            processed_images.append(('threshold', thresh1))
            
            # 2. Adaptive threshold
            thresh2 = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                          cv2.THRESH_BINARY, 11, 2)
            processed_images.append(('adaptive', thresh2))
            
            # 3. Denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            processed_images.append(('denoised', denoised))
            
            # Try different language combinations for Hindi/English text
            language_combinations = [
                'hin+eng',  # Hindi + English
                'hin',      # Hindi only  
                'eng',      # English only
                'eng+hin'   # English + Hindi
            ]
            
            best_text = ""
            best_conf = 0
            best_method = ""
            
            for lang in language_combinations:
                for method_name, processed_img in processed_images:
                    try:
                        # Configure Tesseract
                        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळक्षज्ञािीुूृेैोौंःँॅॆॉॊोौ्ॐ॰ !@#$%^&*()_+-=[]{}|;:,.<>?/'
                        
                        data = pytesseract.image_to_data(
                            processed_img, 
                            lang=lang, 
                            config=custom_config,
                            output_type=pytesseract.Output.DICT
                        )
                        
                        # Calculate confidence from non-zero values
                        confidences = [int(x) for x in data['conf'] if int(x) > 0]
                        if confidences:
                            confidence = np.mean(confidences)
                        else:
                            confidence = 0
                        
                        # Extract text with reasonable confidence
                        text_parts = []
                        for i in range(len(data['text'])):
                            if int(data['conf'][i]) > 30 and data['text'][i].strip():
                                text_parts.append(data['text'][i])
                        
                        text = ' '.join(text_parts)
                        
                        if confidence > best_conf and text.strip():
                            best_conf = confidence
                            best_text = text
                            best_method = f"{lang}_{method_name}"
                            print(f"  Better text found: {lang} {method_name} (conf: {confidence:.1f})")
                            
                    except Exception as e:
                        print(f"  Tesseract combo failed: {lang} {method_name} - {e}")
                        continue
            
            if best_text.strip():
                print(f"✅ Tesseract success with {best_method}, confidence: {best_conf:.1f}%")
                return {
                    'success': True,
                    'extracted_text': best_text.strip(),
                    'confidence': best_conf,
                    'service': 'tesseract',
                    'method': best_method
                }
            else:
                # Final fallback - simple English OCR
                print("  Trying simple English fallback...")
                simple_text = pytesseract.image_to_string(gray, lang='eng')
                if simple_text.strip():
                    return {
                        'success': True,
                        'extracted_text': simple_text.strip(),
                        'service': 'tesseract',
                        'fallback': True
                    }
                else:
                    return {
                        'success': False,
                        'error': 'No text could be extracted',
                        'service': 'tesseract'
                    }
                
        except Exception as e:
            error_msg = f"Tesseract processing error: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'service': 'tesseract'
            }

    def extract_text(self, image_path: str, preferred_service: str = 'auto') -> Dict:
        """
        Extract text from image using best available OCR service
        """
        print(f"\n🎯 Starting OCR for: {Path(image_path).name}")
        
        # Validate file
        if not self._validate_image(image_path):
            error_msg = 'Invalid image file or format'
            print(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg
            }
        
        # Create cache key
        cache_key = self._get_file_hash(image_path)
        
        # Check cache
        if cache_key in self.ocr_cache:
            print("💾 Using cached result")
            result = self.ocr_cache[cache_key].copy()
            result['cached'] = True
            return result
        
        # Test services
        self.test_all_services()
        
        # Determine service order
        if preferred_service == 'auto':
            service_order = []
            # Prioritize services that are working
            if self.service_status.get('bhashini'):
                service_order.append('bhashini')
            if self.service_status.get('tesseract'):
                service_order.append('tesseract')
            if self.service_status.get('ocr_space'):
                service_order.append('ocr_space')
            
            # If no services detected as working, try all
            if not service_order:
                service_order = ['tesseract', 'bhashini', 'ocr_space']
                print("⚠️ No services confirmed working, trying all...")
        else:
            service_order = [preferred_service]
        
        print(f"🔄 Service order: {service_order}")
        
        # Try services in order
        results = {}
        for service in service_order:
            print(f"\n🔄 Trying {service}...")
            
            if service == 'bhashini':
                result = self.extract_text_with_bhashini(image_path)
            elif service == 'tesseract':
                result = self.extract_text_with_tesseract(image_path)
            elif service == 'ocr_space':
                result = self.extract_text_with_ocr_space(image_path)
            else:
                continue
            
            results[service] = result
            
            if result['success']:
                # Add common fields
                result.update({
                    'image_path': image_path,
                    'file_size': self._get_file_size(image_path),
                    'cached': False,
                    'service_used': service
                })
                
                # Cache successful result
                self.ocr_cache[cache_key] = result.copy()
                print(f"✅ Success with {service}!")
                return result
            else:
                print(f"❌ {service} failed: {result.get('error', 'Unknown error')}")
        
        # All services failed - return the most informative result
        print("❌ All OCR services failed")
        return {
            'success': False,
            'error': 'All OCR services failed',
            'services_tried': service_order,
            'detailed_results': results,
            'image_path': image_path
        }

    def test_all_services(self):
        """Test all available OCR services"""
        print("\n🔍 Testing OCR services...")
        self.service_status['bhashini'] = self.test_bhashini_connection()
        self.service_status['ocr_space'] = self.test_ocr_space_connection()
        self.service_status['tesseract'] = self.tesseract_available
        
        print("\n✅ Final Service Status:")
        for service, status in self.service_status.items():
            status_icon = '✅' if status else '❌'
            print(f"   {service}: {status_icon}")

    def _validate_image(self, image_path: str) -> bool:
        """Validate image file"""
        try:
            path = Path(image_path)
            if not path.exists():
                print(f"❌ File does not exist: {image_path}")
                return False
            if not path.is_file():
                print(f"❌ Not a file: {image_path}")
                return False
            if path.suffix.lower() not in self.supported_formats:
                print(f"❌ Unsupported format: {path.suffix}")
                return False
            if path.stat().st_size > 10 * 1024 * 1024:  # 10MB max
                print(f"❌ File too large: {path.stat().st_size} bytes")
                return False
            return True
        except Exception as e:
            print(f"❌ Validation error: {e}")
            return False

    def _get_file_hash(self, file_path: str) -> str:
        """MD5 file hash for caching"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return str(Path(file_path).absolute())

    def _get_file_size(self, file_path: str) -> str:
        """Get file size in readable format"""
        try:
            size = Path(file_path).stat().st_size
            for unit in ['B', 'KB', 'MB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} GB"
        except:
            return "Unknown"

    def get_service_status(self) -> Dict:
        """Get current service status"""
        return self.service_status

    def clear_cache(self):
        """Clear OCR cache"""
        self.ocr_cache.clear()

# ==================== USAGE EXAMPLES ====================

def demo_ocr_system():
    """Demo the multi-OCR system"""
    print("🚀 Multi-OCR System - Robust Text Extraction")
    print("=" * 60)
    
    ocr = MultiOCR()
    
    # Test images
    test_images = [
        r"C:\Users\juluk\Downloads\hindisign.jpg",
        # Add more test images here
    ]
    
    # Filter valid images
    valid_images = [img for img in test_images if ocr._validate_image(img)]
    
    if not valid_images:
        print("\n❌ No valid images found!")
        print("Please check:")
        print("1. File path is correct")
        print("2. File exists")
        print("3. File is in supported format:", ocr.supported_formats)
        print("4. File size < 10MB")
        return
    
    print(f"\n🖼️ Processing {len(valid_images)} image(s)")
    
    for i, image_path in enumerate(valid_images, 1):
        print(f"\n{'='*50}")
        print(f"{i}. 📄 Processing: {Path(image_path).name}")
        print(f"   📏 Size: {ocr._get_file_size(image_path)}")
        
        start_time = time.time()
        result = ocr.extract_text(image_path)
        processing_time = time.time() - start_time
        
        print(f"\n📊 RESULTS for {Path(image_path).name}:")
        print(f"   ⏱️ Time: {processing_time:.2f}s")
        
        if result['success']:
            print(f"   ✅ Success with {result.get('service_used', 'unknown')}")
            text = result['extracted_text']
            
            # Show text preview
            preview = text.replace('\n', ' ').strip()
            if len(preview) > 100:
                preview = preview[:100] + "..."
            
            print(f"   📝 Text: {preview}")
            print(f"   🔢 Characters: {len(text)}")
            print(f"   📄 Lines: {text.count(chr(10)) + 1}")
            
            if result.get('cached'):
                print("   💾 (from cache)")
            if result.get('confidence'):
                print(f"   🎯 Confidence: {result['confidence']:.1f}%")
            if result.get('method'):
                print(f"   🔧 Method: {result['method']}")
                
            # Save result to file
            output_file = Path(image_path).with_suffix('.txt')
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(text)
                print(f"   💾 Saved to: {output_file}")
            except Exception as e:
                print(f"   ⚠️ Could not save: {e}")
                
        else:
            print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
            if 'detailed_results' in result:
                print("   📋 Detailed failures:")
                for service, service_result in result['detailed_results'].items():
                    status = '✅' if service_result.get('success') else '❌'
                    error = service_result.get('error', 'Unknown')
                    print(f"      {service}: {status} {error}")

def install_tesseract_instructions():
    """Show instructions for installing Tesseract"""
    print("\n📋 Tesseract Installation Instructions:")
    print("=" * 50)
    print("1. Download Tesseract OCR:")
    print("   Windows: https://github.com/UB-Mannheim/tesseract/wiki")
    print("   Download and run the installer")
    print("2. Install language packs for Hindi:")
    print("   - Run Tesseract installer again")
    print("   - Select Hindi and other Indian languages")
    print("3. Verify installation:")
    print("   - Open command prompt")
    print("   - Run: tesseract --list-langs")
    print("4. Install Python package:")
    print("   pip install pytesseract")

if __name__ == "__main__":
    try:
        demo_ocr_system()
        
        # Show installation help if Tesseract not available
        ocr = MultiOCR()
        if not ocr.tesseract_available:
            install_tesseract_instructions()
            
    except Exception as e:
        print(f"💥 Critical error: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check internet connection")
        print("2. Verify image file exists")
        print("3. Try running as administrator")
        print("4. Check if antivirus is blocking requests")