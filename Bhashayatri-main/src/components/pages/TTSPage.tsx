import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Volume2, Square, Play, Download, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { TalkingAvatar } from "../TalkingAvatar";
import { textToSpeech } from "../../utils/api";
import { getCachedLocation } from "../../utils/location";
import { toast } from "sonner@2.0.3";

export function TTSPage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [speed, setSpeed] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = getCachedLocation();

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to speak");
      return;
    }

    setIsSpeaking(true);

    try {
      // Call Python backend TTS API
      const response = await textToSpeech(text, language);
      
      if (response.success && response.data?.audio_url) {
        setAudioUrl(response.data.audio_url);
        playAudio(response.data.audio_url);
      } else {
        // Fallback to Web Speech API
        speakWithWebAPI();
      }
    } catch (error) {
      console.error('TTS error:', error);
      speakWithWebAPI();
    }
  };

  const speakWithWebAPI = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = getLanguageCode(language);
      utterance.lang = langCode;
      utterance.rate = speed[0];
      utterance.pitch = pitch[0];
      
      // Find the best voice for the language
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(langCode.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        toast.success(`Speaking in ${language}...`);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        toast.error("Speech synthesis failed. Try again.");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in this browser");
      setIsSpeaking(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audio.playbackRate = speed[0];
    
    audio.onplay = () => {
      setIsSpeaking(true);
      toast.success("Playing audio...");
    };

    audio.onended = () => {
      setIsSpeaking(false);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      toast.error("Audio playback failed");
      // Fallback to Web Speech API
      speakWithWebAPI();
    };

    audio.play().catch(err => {
      console.error('Audio play error:', err);
      speakWithWebAPI();
    });
    
    audioRef.current = audio;
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `speech-${Date.now()}.mp3`;
      a.click();
      toast.success("Audio download started");
    } else {
      toast.info("Connect to backend to download audio files");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Text copied to clipboard");
  };

  const getLanguageCode = (lang: string): string => {
    const codes: Record<string, string> = {
      'english': 'en-IN',
      'hindi': 'hi-IN',
      'bengali': 'bn-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN',
      'kannada': 'kn-IN',
      'malayalam': 'ml-IN',
      'punjabi': 'pa-IN',
    };
    return codes[lang] || 'en-IN';
  };

  const exampleTexts = [
    { lang: 'hindi', text: 'नमस्ते! मुझे आपकी सहायता करने में खुशी हो रही है।' },
    { lang: 'english', text: 'Welcome to India! Let me help you explore this beautiful country.' },
    { lang: 'tamil', text: 'வணக்கம்! நான் உங்களுக்கு உதவ மகிழ்ச்சியாக இருக்கிறேன்.' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1572945015532-741f8c49a7b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGV8ZW58MXx8fHwxNzYwMjEwODk5fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Temple"
          className="w-full h-full object-cover opacity-5 blur-sm"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">🔊 Text-to-Speech Translator</h1>
          <p className="text-gray-600">Convert any text to natural speech in multiple languages</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="mb-4">Enter Text</h3>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to convert to speech..."
              className="min-h-[200px] rounded-2xl mb-4"
            />

            {/* Quick Examples */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick Examples:</p>
              <div className="space-y-2">
                {exampleTexts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setText(example.text);
                      setLanguage(example.lang);
                    }}
                    className="w-full text-left px-4 py-2 bg-white rounded-xl text-sm border border-gray-200 hover:border-[#ff6b35] transition-colors"
                  >
                    {example.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                  <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                  <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                  <SelectItem value="gujarati">Gujarati (ગુજરાતી)</SelectItem>
                  <SelectItem value="kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                  <SelectItem value="malayalam">Malayalam (മലയാളം)</SelectItem>
                  <SelectItem value="punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Speed Control */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm">Speed</label>
                <span className="text-sm text-gray-600">{speed[0]}x</span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2}
                step={0.1}
                className="mb-2"
              />
            </div>

            {/* Pitch Control */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm">Pitch</label>
                <span className="text-sm text-gray-600">{pitch[0]}x</span>
              </div>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!isSpeaking ? (
                <Button
                  onClick={handleSpeak}
                  disabled={!text.trim()}
                  className="flex-1 gradient-india text-white rounded-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Speak
                </Button>
              ) : (
                <Button
                  onClick={handleStop}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              
              <Button
                onClick={handleCopy}
                variant="outline"
                className="rounded-full"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>

              {audioUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="rounded-full"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Avatar Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6 flex items-center justify-center"
          >
            <TalkingAvatar
              state={location?.state}
              isSpeaking={isSpeaking}
              onSpeakToggle={isSpeaking ? handleStop : handleSpeak}
              size="large"
              message={isSpeaking ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : undefined}
            />
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#ff6b35]/10 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-[#ff6b35]" />
            </div>
            <h4 className="mb-2">Natural Voice</h4>
            <p className="text-sm text-gray-600">
              AI-powered natural sounding speech in 10+ Indian languages
            </p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#138808]/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-[#138808]" />
            </div>
            <h4 className="mb-2">Download Audio</h4>
            <p className="text-sm text-gray-600">
              Save generated speech as MP3 files for offline use
            </p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#0066cc]/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-[#0066cc]" />
            </div>
            <h4 className="mb-2">Custom Controls</h4>
            <p className="text-sm text-gray-600">
              Adjust speed and pitch to match your preferences
            </p>
          </div>
        </motion.div>

        {/* API Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Python Backend:</strong> POST /api/bhashini/tts (with Bhashini TTS API)
          </p>
        </div>
      </div>
    </div>
  );
}
