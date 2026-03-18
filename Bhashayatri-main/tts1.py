import requests
import json
import urllib3
import base64
import os
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ===========================================================
# 🔑 CONFIGURATION (Replace with your actual ASR API details)
# ===========================================================
ASR_API_ENDPOINT = "https://canvas.iiit.ac.in/sandboxbeprod/asr_endpoint"  # Replace with actual ASR endpoint
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8"

# Supported audio formats
SUPPORTED_FORMATS = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.webm']

def select_audio_file():
    """
    Open file dialog to select audio file from system
    """
    # Create a hidden root window
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    
    # Set up file dialog
    file_types = [
        ("Audio files", "*.wav *.mp3 *.m4a *.flac *.ogg *.aac *.webm"),
        ("WAV files", "*.wav"),
        ("MP3 files", "*.mp3"),
        ("M4A files", "*.m4a"),
        ("FLAC files", "*.flac"),
        ("All files", "*.*")
    ]
    
    print("📁 Opening file dialog...")
    file_path = filedialog.askopenfilename(
        title="Select Audio File",
        filetypes=file_types,
        initialdir=os.path.expanduser("~")  # Start from user home directory
    )
    
    # Destroy the root window
    root.destroy()
    
    return file_path

def transcribe_audio(audio_file_path):
    """
    Transcribe audio file to text using ASR API
    """
    print("🎤 Transcribing Audio...")
    print(f"📁 Audio File: {audio_file_path}")
    
    # Check if file exists
    if not os.path.exists(audio_file_path):
        print(f"❌ File not found: {audio_file_path}")
        return None
    
    # Check file size constraint (example: max 10MB)
    file_size = os.path.getsize(audio_file_path) / (1024 * 1024)  # Size in MB
    if file_size > 10:
        print(f"⚠️  Warning: File size exceeds 10MB limit ({file_size:.2f} MB)")
        return None
    
    # Check file format
    file_extension = Path(audio_file_path).suffix.lower()
    if file_extension not in SUPPORTED_FORMATS:
        print(f"❌ Unsupported file format: {file_extension}")
        print(f"✅ Supported formats: {', '.join(SUPPORTED_FORMATS)}")
        return None
    
    try:
        # Read and encode audio file
        print("📖 Reading audio file...")
        with open(audio_file_path, 'rb') as audio_file:
            audio_data = audio_file.read()
        
        # Encode to base64 for API transmission
        print("🔧 Encoding audio data...")
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Prepare payload as per ASR API specification
        payload = {
            "audio_data": audio_base64,
            "file_name": Path(audio_file_path).name,
            "language": "hi"  # Assuming Hindi audio, adjust as needed
        }
        
        # Prepare headers with access token
        headers = {
            "access-token": ACCESS_TOKEN,
            "Content-Type": "application/json"
        }
        
        # Make POST request to the ASR API endpoint
        print(f"🔗 Sending request to: {ASR_API_ENDPOINT}")
        response = requests.post(
            ASR_API_ENDPOINT,
            json=payload,
            headers=headers,
            verify=False,
            timeout=60  # Longer timeout for audio processing
        )
        
        print(f"📡 Response Status Code: {response.status_code}")
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            print("✅ API Response Received")
            
            # Extract transcribed text from response
            if (result.get("status") == "success" and 
                result.get("data") and 
                result["data"].get("transcribed_text")):
                
                transcribed_text = result["data"]["transcribed_text"]
                print(f"📝 Transcribed Text: {transcribed_text}")
                return transcribed_text
            else:
                print("❌ Error in API response structure")
                print(f"Error details: {result.get('error')}")
                print(f"Message: {result.get('message')}")
                return None
                
        else:
            print(f"❌ API Error: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Response text: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out (60 seconds)")
        return None
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - cannot reach the server")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def get_audio_file_interactive():
    """
    Get audio file path through interactive selection
    """
    print("\n" + "="*60)
    print("🎤 AUDIO SPEECH RECOGNITION (ASR) 🇮🇳")
    print("="*60)
    print("📁 Supported formats: WAV, MP3, M4A, FLAC, OGG, AAC, WEBM")
    print("💡 Maximum file size: 10MB")
    print("🔤 Type 'quit' or 'exit' to stop the program")
    print("-"*60)
    
    while True:
        print("\nChoose input method:")
        print("1. 📁 Select file from system (File Dialog)")
        print("2. ⌨️  Enter file path manually")
        print("3. ❌ Quit program")
        
        choice = input("\n🎯 Enter your choice (1/2/3): ").strip()
        
        if choice == "1":
            file_path = select_audio_file()
            if file_path:
                return file_path
            else:
                print("❌ No file selected. Please try again.")
        elif choice == "2":
            file_path = input("\n🎯 Enter full file path: ").strip()
            if file_path.lower() in ['quit', 'exit', 'q']:
                return None
            elif file_path and os.path.exists(file_path):
                return file_path
            else:
                print("❌ File not found. Please check the path and try again.")
        elif choice == "3":
            return None
        else:
            print("⚠️  Invalid choice. Please enter 1, 2, or 3.")

def list_recent_audio_files(directory="."):
    """
    List recent audio files in the current directory
    """
    print(f"\n📂 Recent audio files in current directory:")
    audio_files = []
    
    try:
        for file in os.listdir(directory):
            if Path(file).suffix.lower() in SUPPORTED_FORMATS:
                file_size = os.path.getsize(file) / (1024 * 1024)
                audio_files.append(file)
                print(f"   🎵 {file} ({file_size:.2f} MB)")
        
        if not audio_files:
            print("   No audio files found in current directory")
        
        return audio_files
    except Exception as e:
        print(f"   Error listing files: {e}")
        return []

def continuous_asr_mode():
    """
    Run the ASR in continuous mode until user quits
    """
    print("🚀 Starting Audio Speech Recognition (Interactive Mode)")
    
    while True:
        print("\n" + "-"*60)
        audio_file_path = get_audio_file_interactive()
        
        if audio_file_path is None:
            print("👋 Thank you for using the ASR service! Goodbye!")
            break
            
        print(f"\n🔍 Processing: {audio_file_path}")
        
        transcription_result = transcribe_audio(audio_file_path)
        
        if transcription_result:
            print(f"\n🎉 TRANSCRIPTION RESULT:")
            print(f"📁 File: {audio_file_path}")
            print(f"📝 Text: {transcription_result}")
            print("-" * 60)
            
            # Option to save transcription to file
            save_choice = input("\n💾 Save transcription to file? (y/n): ").strip().lower()
            if save_choice in ['y', 'yes']:
                save_transcription(audio_file_path, transcription_result)
        else:
            print(f"\n💥 Transcription failed for: {audio_file_path}")
            print("-" * 60)
        
        # Ask if user wants to continue
        continue_trans = input("\n🔄 Process another audio file? (y/n): ").strip().lower()
        if continue_trans not in ['y', 'yes', '']:
            print("👋 Thank you for using the ASR service! Goodbye!")
            break

def single_asr_mode():
    """
    Run the ASR for a single audio file
    """
    print("🚀 Starting Audio Speech Recognition (Single Mode)")
    
    audio_file_path = get_audio_file_interactive()
    
    if audio_file_path is None:
        return
        
    print(f"\n🔍 Processing: {audio_file_path}")
    
    transcription_result = transcribe_audio(audio_file_path)
    
    if transcription_result:
        print(f"\n🎉 FINAL RESULT:")
        print(f"📁 File: {audio_file_path}")
        print(f"📝 Text: {transcription_result}")
        
        # Always offer to save in single mode
        save_choice = input("\n💾 Save transcription to file? (y/n): ").strip().lower()
        if save_choice in ['y', 'yes']:
            save_transcription(audio_file_path, transcription_result)
    else:
        print(f"\n💥 Transcription failed for: {audio_file_path}")

def save_transcription(audio_file_path, transcription):
    """
    Save transcription to a text file
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

def show_file_dialog_only():
    """
    Simple mode: Just open file dialog and process one file
    """
    print("🎤 ASR - Select Audio File")
    print("=" * 50)
    
    file_path = select_audio_file()
    
    if not file_path:
        print("❌ No file selected. Exiting...")
        return
    
    print(f"📁 Selected file: {file_path}")
    print("🔄 Processing...")
    
    transcription = transcribe_audio(file_path)
    
    if transcription:
        print(f"\n🎉 TRANSCRIPTION SUCCESSFUL!")
        print(f"📝 Text: {transcription}")
        
        # Auto-save the transcription
        saved_file = save_transcription(file_path, transcription)
        if saved_file:
            print(f"💾 Transcription automatically saved to: {saved_file}")
    else:
        print("❌ Transcription failed.")

# ===========================================================
# 🚀 MAIN EXECUTION
# ===========================================================
if __name__ == "__main__":
    print("🎤 Audio Speech Recognition (ASR) System")
    print("Choose mode:")
    print("1. 📁 Simple mode (Select file and process)")
    print("2. 🔄 Continuous mode (Process multiple files)")
    print("3. ⚡ Single file mode (Manual file path)")
    
    try:
        choice = input("\n🎯 Enter choice (1/2/3, default is 1): ").strip()
        
        if choice == "2":
            continuous_asr_mode()
        elif choice == "3":
            single_asr_mode()
        else:
            show_file_dialog_only()
            
    except KeyboardInterrupt:
        print("\n\n👋 Program interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")