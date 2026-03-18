#!/usr/bin/env python3
"""
FULLY WORKING MULTILINGUAL VOICE BOT
Audio Input → Intelligent Response → Same Language Audio Output
"""

import asyncio
import os
import sys
import argparse

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config_local import config
from fully_working_voice_bot import FullyWorkingVoiceBot
from realtime_voice_bot import RealtimeVoiceBot

def check_apis():
    """Check available APIs"""
    print("🔍 Checking API Availability...")
    
    apis = {
        'AssemblyAI (Speech-to-Text)': bool(config.ASSEMBLYAI_API_KEY),
        'OpenAI (Response)': bool(config.OPENAI_API_KEY),
        'Google Gemini (Response)': bool(config.GOOGLE_GEMINI_API_KEY),
        'ElevenLabs (Text-to-Speech)': bool(config.ELEVENLABS_API_KEY),
        'Sarvam AI (Indian Languages TTS)': bool(config.SARVAM_AI_API_KEY),
        'Arya AI (Language Detection)': bool(config.ARYA_AI_API_KEY)
    }
    
    available = sum(apis.values())
    total = len(apis)
    
    print(f"✅ Available: {available}/{total} APIs")
    for api, status in apis.items():
        status_icon = "✅" if status else "❌"
        print(f"   {status_icon} {api}")
    
    return available > 0

def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='🚀 Fully Working Multilingual Voice Bot',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Modes:
  realtime:        Real-time speech-to-speech conversation. (Default)
  interactive:     Record-then-respond style conversation.
  single:          Process a single audio file.
  test-languages:  Run a test suite for language detection.

Examples:
  python main.py --mode interactive -o conversations
  python main.py --mode single --input audio.wav -o output
  python main.py --mode test-languages
        """
    )
    
    parser.add_argument('--mode', choices=['realtime', 'interactive', 'single', 'test-languages'], 
                       default='realtime', help='Operation mode')
    parser.add_argument('--input', help='Input audio file (for single mode)')
    parser.add_argument('-o', '--output', help='Output directory', default='conversations')
    
    args = parser.parse_args()
    
    print("🚀 FULLY WORKING MULTILINGUAL VOICE BOT")
    print("=" * 60)
    
    # Check API availability
    if not check_apis():
        print("\n⚠️  Some APIs are missing. Basic functionality may be limited.")
        print("💡 Add missing API keys to your .env file")
    
    bot = None
    
    try:
        if args.mode == 'realtime':
            bot = RealtimeVoiceBot(args.output)
            asyncio.run(bot.run())
        elif args.mode == 'interactive':
            bot = FullyWorkingVoiceBot()
            bot.interactive_mode(args.output)
        elif args.mode == 'single':
            bot = FullyWorkingVoiceBot()
            if not args.input:
                print("❌ Please provide --input audio file")
                return
            result = bot.process_conversation(args.input, args.output)
            if result.get('success'):
                print("\n✅ Single conversation completed!")
            else:
                print(f"\n❌ Failed: {result.get('error')}")
        elif args.mode == 'test-languages':
            from test_language_detection import test_language_detection
            test_language_detection()
            return
        
    except KeyboardInterrupt:
        print("\n\n🛑 Session interrupted by user.")
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
    finally:
        if bot:
            bot.cleanup()
            if hasattr(bot, 'show_detailed_stats'):
                bot.show_detailed_stats()

if __name__ == "__main__":
    main()