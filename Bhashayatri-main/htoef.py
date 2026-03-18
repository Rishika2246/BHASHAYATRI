import requests
import json
import urllib3

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ===========================================================
# 🔑 CONFIGURATION (From your API specifications)
# ===========================================================
API_ENDPOINT = "https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316384a"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTc3MGViOTNlM2JlYzkwMWZkYzFhIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.aISLxeHUaEWX7ZNv2Tlt2r2glUtjXJF6xh6RA8QY5i8"

def translate_hindi_to_english(text):
    """
    Translate Hindi text to English using the MT API
    """
    print("🌍 Translating Hindi to English...")
    print(f"📝 Input Text: {text}")
    
    # Check word count constraint (max 50 words)
    word_count = len(text.split())
    if word_count > 50:
        print(f"⚠️  Warning: Text exceeds 50 words limit ({word_count} words)")
        return None
    
    # Prepare payload as per API specification
    payload = {
        "input_text": text
    }
    
    # Prepare headers with access token
    headers = {
        "access-token": ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    try:
        # Make POST request to the API endpoint
        print(f"🔗 Sending request to: {API_ENDPOINT}")
        response = requests.post(
            API_ENDPOINT,
            json=payload,
            headers=headers,
            verify=False,
            timeout=30
        )
        
        print(f"📡 Response Status Code: {response.status_code}")
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            print("✅ API Response Received")
            
            # Extract translated text from response
            if (result.get("status") == "success" and 
                result.get("data") and 
                result["data"].get("output_text")):
                
                translated_text = result["data"]["output_text"]
                print(f"🔄 Translated Text: {translated_text}")
                return translated_text
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
        print("❌ Request timed out (30 seconds)")
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

def get_user_input():
    """
    Get Hindi text input from user console
    """
    print("\n" + "="*60)
    print("🇮🇳 HINDI TO ENGLISH TRANSLATOR 🇬🇧")
    print("="*60)
    print("📝 Enter Hindi text to translate (max 50 words)")
    print("💡 Type 'quit' or 'exit' to stop the program")
    print("🔤 Type 'multiple' to enter multiple lines at once")
    print("-"*60)
    
    while True:
        user_input = input("\n🎯 Enter Hindi text: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("👋 Thank you for using the translator! Goodbye!")
            return None
        elif user_input.lower() == 'multiple':
            return get_multiple_line_input()
        elif user_input:
            return user_input
        else:
            print("⚠️  Please enter some text or type 'quit' to exit.")

def get_multiple_line_input():
    """
    Get multiple lines of input from user
    """
    print("\n📝 Enter multiple lines of Hindi text (press Enter twice when done):")
    lines = []
    while True:
        try:
            line = input()
            if line == "":
                break
            lines.append(line)
        except EOFError:
            break
    
    combined_text = " ".join(lines)
    if combined_text.strip():
        return combined_text
    else:
        print("⚠️  No text entered. Please try again.")
        return get_user_input()

def continuous_translation_mode():
    """
    Run the translator in continuous mode until user quits
    """
    print("🚀 Starting Hindi to English Translation (Interactive Mode)")
    
    while True:
        hindi_text = get_user_input()
        
        if hindi_text is None:
            break
            
        print(f"\n🔍 Processing: {hindi_text}")
        
        translation_result = translate_hindi_to_english(hindi_text)
        
        if translation_result:
            print(f"\n🎉 TRANSLATION RESULT:")
            print(f"🇮🇳 Hindi: {hindi_text}")
            print(f"🇬🇧 English: {translation_result}")
            print("-" * 60)
        else:
            print(f"\n💥 Translation failed for: {hindi_text}")
            print("-" * 60)
        
        # Ask if user wants to continue
        if hindi_text:  # Only ask if we actually processed something
            continue_trans = input("\n🔄 Translate another text? (y/n): ").strip().lower()
            if continue_trans not in ['y', 'yes', '']:
                print("👋 Thank you for using the translator! Goodbye!")
                break

def single_translation_mode():
    """
    Run the translator for a single input
    """
    print("🚀 Starting Hindi to English Translation (Single Mode)")
    
    hindi_text = get_user_input()
    
    if hindi_text is None:
        return
        
    print(f"\n🔍 Processing: {hindi_text}")
    
    translation_result = translate_hindi_to_english(hindi_text)
    
    if translation_result:
        print(f"\n🎉 FINAL RESULT:")
        print(f"🇮🇳 Hindi: {hindi_text}")
        print(f"🇬🇧 English: {translation_result}")
    else:
        print(f"\n💥 Translation failed for: {hindi_text}")

# ===========================================================
# 🚀 MAIN EXECUTION
# ===========================================================
if __name__ == "__main__":
    print("🌍 Hindi to English Translator")
    print("Choose mode:")
    print("1. Continuous mode (keep translating until you quit)")
    print("2. Single translation mode (translate one text)")
    
    try:
        choice = input("Enter choice (1 or 2, default is 1): ").strip()
        
        if choice == "2":
            single_translation_mode()
        else:
            continuous_translation_mode()
            
    except KeyboardInterrupt:
        print("\n\n👋 Program interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")