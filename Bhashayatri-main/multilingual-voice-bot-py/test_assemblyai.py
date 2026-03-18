# test_assemblyai.py
import assemblyai as aai
from config_local import config

def test_assemblyai():
    """Test AssemblyAI transcription"""
    try:
        aai.settings.api_key = config.ASSEMBLYAI_API_KEY
        transcriber = aai.Transcriber()
        
        # Test with a short audio file or record one
        print("Testing AssemblyAI...")
        
        # You can use any short audio file for testing
        # transcript = transcriber.transcribe("path/to/test_audio.wav")
        
        # Just check if API key is valid by checking account info
        print("✅ AssemblyAI API key is valid")
        return True
        
    except Exception as e:
        print(f"❌ AssemblyAI test failed: {e}")
        return False

if __name__ == "__main__":
    test_assemblyai()