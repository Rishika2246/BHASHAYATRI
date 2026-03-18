import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fully_working_voice_bot import FullyWorkingVoiceBot

bot = FullyWorkingVoiceBot()
res = bot.process_conversation(audio_file_path='examples/generated_es.mp3', output_dir='conversations')
print('Result:', res)
bot.cleanup()
