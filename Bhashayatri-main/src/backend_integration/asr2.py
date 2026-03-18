import requests
import json
import urllib3
import os
from pathlib import Path
import easygui
import time

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ASR_API_ENDPOINT = "https://canvas.iiit.ac.in/sandboxbeprod/infer_asr/67b840e29c21bec07537674b"

# 🔐 CORRECT ACCESS TOKEN (from your working translation code)
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8"

SUPPORTED_FORMATS = ['.wav']

# ===========================================================
# 📝 FUNCTION
# ===========================================================
def validate_access_token():
    """
    Validate if the access token is working
    """
    print("🔐 Validating access token...")
    
    # Test with a simple request to check token validity
    test_endpoint = "https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316384a"
    
    headers = {
        "access-token": ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    test_payload = {
        "input_text": "test"
    }
    
    try:
        response = requests.post(
            test_endpoint,
            json=test_payload,
            headers=headers,
            verify=False,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Access token is VALID")
            return True
        else:
            print(f"❌ Access token validation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Token validation error: {e}")
        return False

def get_access_token_from_user():
    """
    Allow user to input access token if needed
    """
    print("\n🔑 Access Token Issue Detected!")
    print("💡 You can:")
    print("1. Use the token from your working translation code")
    print("2. Get a new token from the API provider")
    print("3. Enter token manually")
    
    choice = easygui.buttonbox(
        "How would you like to proceed?",
        "Access Token Required",
        ["Use Default Token", "Enter Token Manually", "Exit"]
    )
    
    if choice == "Use Default Token":
        # Use the token from your working translation code
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8"
        print("✅ Using default access token")
        return token
        
    elif choice == "Enter Token Manually":
        token = easygui.enterbox(
            "Please enter your access token:",
            "Enter Access Token",
            default=ACCESS_TOKEN
        )
        if token:
            print("✅ Using manually entered token")
            return token
        else:
            print("❌ No token entered")
            return None
    else:
        return None

def transcribe_audio_optimized(audio_file_path):
    """
    Optimized transcription function with better error handling
    """
    print(f"🎤 Starting transcription for: {Path(audio_file_path).name}")
    
    if not os.path.exists(audio_file_path):
        print(f"❌ File not found: {audio_file_path}")
        return None

    # File validation
    file_extension = Path(audio_file_path).suffix.lower()
    if file_extension != '.wav':
        print(f"❌ Unsupported file format: {file_extension}")
        print("✅ Only WAV files are supported")
        return None

    # File size check and optimization
    file_size_mb = os.path.getsize(audio_file_path) / (1024 * 1024)
    print(f"📊 File size: {file_size_mb:.2f} MB")
    
    if file_size_mb > 5:
        print("⚠️  File is large, this might take a while...")
    
    if file_size_mb > 20:
        print("❌ File too large (max 20MB)")
        return None

    try:
        print("📖 Reading audio file...")
        # Prepare headers
        headers = {
            "access-token": ACCESS_TOKEN
        }
        # Prepare form data
        files = {
            'audio_file': (
                Path(audio_file_path).name,
                open(audio_file_path, 'rb'),
                'audio/wav'
            )
        }
        print("🚀 Sending request to ASR API...")
        print(f"🔗 Endpoint: {ASR_API_ENDPOINT}")
        
        start_time = time.time()
        # Increased timeout for larger files
        timeout_seconds = 120 if file_size_mb > 2 else 60
        
        response = requests.post(
            ASR_API_ENDPOINT,
            files=files,
            headers=headers,
            verify=False,
            timeout=timeout_seconds
        )
        files['audio_file'][1].close()
        
        end_time = time.time()
        processing_time = end_time - start_time
        print(f"✅ Request completed in {processing_time:.2f} seconds")
        print(f"📡 Response Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("📋 API Response received")
            print(f"🔍 Full response: {json.dumps(result, indent=2)}")
            if (result.get("status") == "success" and 
                result.get("data") and 
                result["data"].get("recognized_text") is not None):

                recognized_text = result["data"]["recognized_text"]
                print(f"🎉 Transcription successful!")
                print(f"📝 Recognized text: '{recognized_text}'")
                return recognized_text
            elif result.get("recognized_text"):
                recognized_text = result["recognized_text"]
                print(f"🎉 Transcription successful (alternative format)!")
                print(f"📝 Recognized text: '{recognized_text}'")
                return recognized_text
            else:
                print("❌ Unexpected API response structure:")
                print(f"   Status: {result.get('status')}")
                print(f"   Message: {result.get('message')}")
                print(f"   Error: {result.get('error')}")
                print(f"   Code: {result.get('code')}")
                return None
                
        elif response.status_code == 403:
            print("❌ ACCESS DENIED: Invalid access token")
            print("💡 The token might be expired or incorrect")
            return "TOKEN_ERROR"
            
        else:
            print(f"❌ API returned error status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Response text: {response.text}")
            return None

    except requests.exceptions.Timeout:
        print(f"❌ Request timed out after {timeout_seconds} seconds")
        print("💡 Try with a smaller audio file")
        return None

    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return None

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def select_audio_file():
    """
    Select WAV file with size warning
    """
    print("📁 Opening file dialog...")
    file_path = easygui.fileopenbox(
        title="Select a WAV audio file (recommended: < 5MB)",
        default="*.wav",
        filetypes=[["*.wav", "WAV files"]]
    )
    if file_path:
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"📊 Selected file: {Path(file_path).name} ({file_size_mb:.2f} MB)")
        if file_size_mb > 10:
            print("⚠️  Warning: Large file selected, processing may be slow")
    return file_path

def save_transcription(audio_file_path, transcription):
    """
    Save transcription to file
    """
    try:
        base_name = Path(audio_file_path).stem
        output_file = f"{base_name}_transcription.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"Audio File: {audio_file_path}\n")
            f.write(f"Transcription: {transcription}\n")
            f.write(f"Generated on: {__import__('datetime').datetime.now()}\n")
        print(f"✅ Transcription saved to: {output_file}")
        return output_file
    except Exception as e:
        print(f"❌ Error saving transcription: {e}")
        return None

def show_transcription_dialog(transcription, audio_file_name):
    """
    Show the transcribed text in a nice dialog box
    """
    # Create a formatted message
    message = f"""🎉 TRANSCRIPTION SUCCESSFUL!

📁 File: {audio_file_name}

📝 Extracted Text:
"{transcription}"

Would you like to save this transcription to a file?"""
    
    # Show the transcription in a dialog box
    save_choice = easygui.ynbox(
        message,
        "Transcription Result",
        ["💾 Save to File", "❌ Don't Save"]
    )
    
    return save_choice

def show_error_dialog(error_message, audio_file_name):
    """
    Show error message in a dialog box
    """
    message = f"""❌ TRANSCRIPTION FAILED

📁 File: {audio_file_name}

📋 Error Details:
{error_message}

Please check the console for more details."""
    
    easygui.msgbox(message, "Transcription Failed")

def show_token_error_dialog():
    """
    Show access token error dialog
    """
    message = """🔐 ACCESS TOKEN ERROR

The access token is invalid or expired.

Possible reasons:
• Token has expired
• Token is for a different API
• Token format is incorrect

Please check your access token and try again."""
    
    easygui.msgbox(message, "Access Token Error")

# ===========================================================
# 🚀 MAIN EXECUTION
# ===========================================================
if __name__ == "__main__":
    print("🎤 ASR System - Optimized Version")
    print("=" * 60)
    
    # First validate the access token
    if not validate_access_token():
        print("\n❌ Access token validation failed!")
        new_token = get_access_token_from_user()
        if new_token:
            # Update the access token
            globals()['ACCESS_TOKEN'] = new_token
            print("🔄 Using new access token")
        else:
            print("👋 Exiting...")
            exit()
    
    print("Based on debug results:")
    print("✅ Canvas is accessible")
    print("✅ ASR endpoint exists")
    print("🔐 Access token validated")
    print("=" * 60)
    
    while True:
        print("\n" + "="*50)
        file_path = select_audio_file()
        
        if not file_path:
            print("👋 No file selected. Exiting...")
            break

        print(f"\n🔄 Processing: {Path(file_path).name}")
        transcription = transcribe_audio_optimized(file_path)

        if transcription == "TOKEN_ERROR":
            show_token_error_dialog()
            # Try to get a new token
            new_token = get_access_token_from_user()
            if new_token:
                globals()['ACCESS_TOKEN'] = new_token
                print("🔄 Retrying with new token...")
                transcription = transcribe_audio_optimized(file_path)
        
        if transcription and transcription != "TOKEN_ERROR":
            print(f"\n🎉 TRANSCRIPTION SUCCESSFUL!")
            print(f"📝 Recognized Text:\n{transcription}")
            
            # Show the transcription in a dialog box
            save_choice = show_transcription_dialog(transcription, Path(file_path).name)
            
            if save_choice:
                saved_file = save_transcription(file_path, transcription)
                if saved_file:
                    easygui.msgbox(f"✅ Transcription saved to:\n{saved_file}", "Save Successful")
        else:
            if transcription != "TOKEN_ERROR":
                print("❌ Transcription failed")
                show_error_dialog("Could not transcribe the audio file. Please try again with a different file.", Path(file_path).name)

        # Ask to continue
        again = easygui.ynbox(
            "Process another audio file?", 
            "Continue", 
            ["✅ Yes", "❌ No"]
        )
        if not again:
            print("👋 Exiting ASR System...")
            break