import pygame
import time
import os
from typing import Optional

class AudioPlayer:
    """Handles audio playback using pygame"""
    
    def __init__(self):
        pygame.mixer.init()
    
    def play_audio(self, audio_file_path: str) -> bool:
        """
        Play an audio file
        """
        try:
            if not os.path.exists(audio_file_path):
                print(f"❌ Audio file not found: {audio_file_path}")
                return False
            
            print(f"🔊 Playing audio: {audio_file_path}")
            pygame.mixer.music.load(audio_file_path)
            pygame.mixer.music.play()
            
            # Wait for playback to finish
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
            
            return True
            
        except Exception as e:
            print(f"❌ Audio playback error: {e}")
            return False
    
    def stop_audio(self):
        """Stop current audio playback"""
        pygame.mixer.music.stop()
    
    def cleanup(self):
        """Clean up pygame resources"""
        pygame.mixer.quit()