from fully_working_voice_bot import FullyWorkingVoiceBot

if __name__ == '__main__':
    bot = FullyWorkingVoiceBot()
    try:
        result = bot.process_conversation('examples/generated_es.mp3', output_dir='conversations')
        print('RESULT:', result)
    finally:
        bot.cleanup()
