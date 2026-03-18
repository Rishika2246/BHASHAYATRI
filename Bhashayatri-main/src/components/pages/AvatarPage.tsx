import { useState } from "react";
import { motion } from "motion/react";
import { Mic, Volume2, MapPin, Languages, Settings, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { TalkingAvatar } from "../TalkingAvatar";
import { getCachedLocation } from "../../utils/location";
import { toast } from "sonner@2.0.3";

export function AvatarPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("hindi");
  const [speed, setSpeed] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [selectedState, setSelectedState] = useState("Delhi");
  const [mood, setMood] = useState<"happy" | "excited" | "calm">("happy");
  
  const location = getCachedLocation();

  const states = [
    "Delhi", "Kerala", "Tamil Nadu", "Karnataka", "Maharashtra", 
    "Rajasthan", "Gujarat", "Goa", "West Bengal", "Punjab"
  ];

  const languages = [
    "English", "Hindi", "Tamil", "Bengali", "Telugu", 
    "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"
  ];

  const greetings: Record<string, string> = {
    english: "Welcome to India! I'm your virtual guide. How can I help you today?",
    hindi: "भारत में आपका स्वागत है! मैं आपका वर्चुअल गाइड हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
    tamil: "இந்தியாவுக்கு வரவேற்கிறோம்! நான் உங்கள் மெய்நிகர் வழிகாட்டி. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    bengali: "ভারতে স্বাগতম! আমি আপনার ভার্চুয়াল গাইড। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    telugu: "భారతదేశానికి స్వాగతం! నేను మీ వర్చువల్ గైడ్. నేను మీకు ఈ రోజు ఎలా సహాయం చేయగలను?",
  };

  const handleSpeak = () => {
    const greeting = greetings[language.toLowerCase()] || greetings.english;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(greeting);
      
      const langCodes: Record<string, string> = {
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
      
      utterance.lang = langCodes[language.toLowerCase()] || 'en-IN';
      utterance.rate = speed[0];
      utterance.pitch = pitch[0];
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(utterance.lang.split('-')[0])
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        toast.success(`Avatar speaking in ${language}...`);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Speech failed. Try again.");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported");
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const quickPhrases = [
    { lang: "hindi", text: "नमस्ते! आप कैसे हैं?", english: "Hello! How are you?" },
    { lang: "tamil", text: "வணக்கம்! எப்படி இருக்கீங்க?", english: "Hello! How are you?" },
    { lang: "bengali", text: "নমস্কার! আপনি কেমন আছেন?", english: "Hello! How are you?" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGNvbG9yZnVsfGVufDF8fHx8MTc2MDIxMDkwMHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="India"
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
          <h1 className="mb-2">🤖 AI Avatar Assistant</h1>
          <p className="text-gray-600">Your personalized multilingual travel companion</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Avatar Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-8 flex flex-col items-center justify-center"
          >
            <TalkingAvatar
              state={selectedState}
              isSpeaking={isSpeaking}
              onSpeakToggle={isSpeaking ? handleStop : handleSpeak}
              size="large"
              message={isSpeaking ? greetings[language.toLowerCase()] : undefined}
            />

            {/* Mood Indicators */}
            <div className="mt-6 flex gap-3">
              {[
                { mood: "happy", emoji: "😊", color: "from-yellow-400 to-orange-500" },
                { mood: "excited", emoji: "🤩", color: "from-pink-400 to-purple-500" },
                { mood: "calm", emoji: "😌", color: "from-blue-400 to-cyan-500" },
              ].map((m) => (
                <motion.button
                  key={m.mood}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(m.mood as any)}
                  className={`w-16 h-16 rounded-full ${
                    mood === m.mood 
                      ? `bg-gradient-to-br ${m.color}` 
                      : "bg-gray-200"
                  } flex items-center justify-center text-2xl`}
                >
                  {m.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#ff6b35]" />
              Avatar Settings
            </h3>

            {/* State Selection */}
            <div className="mb-4">
              <label className="block text-sm mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff6b35]" />
                Location/State
              </label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#138808]" />
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.toLowerCase()} value={lang.toLowerCase()}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speed Control */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm">Speech Speed</label>
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
                <label className="text-sm">Voice Pitch</label>
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

            {/* Quick Phrases */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Quick Phrases</label>
              <div className="space-y-2">
                {quickPhrases.map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLanguage(phrase.lang);
                      setTimeout(() => handleSpeak(), 300);
                    }}
                    className="w-full text-left px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 hover:border-[#ff6b35] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>{phrase.text}</span>
                      <Volume2 className="w-4 h-4 text-[#ff6b35]" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{phrase.english}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Button */}
            <Button
              onClick={isSpeaking ? handleStop : handleSpeak}
              className={`w-full rounded-full ${
                isSpeaking 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "gradient-india"
              } text-white`}
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Greet Me
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid md:grid-cols-4 gap-4"
        >
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <Languages className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="mb-2">10+ Languages</h4>
            <p className="text-sm text-gray-600">Speaks all major Indian languages</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <h4 className="mb-2">Emotional</h4>
            <p className="text-sm text-gray-600">Adapts to different moods</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-cyan-600" />
            </div>
            <h4 className="mb-2">Location-Aware</h4>
            <p className="text-sm text-gray-600">Customized for each Indian state</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="mb-2">Natural Voice</h4>
            <p className="text-sm text-gray-600">Realistic lip-sync animation</p>
          </div>
        </motion.div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🤖 <strong>Interactive Avatar:</strong> Fully customizable AI assistant with lip-sync technology powered by Web Speech API
          </p>
        </div>
      </div>
    </div>
  );
}
