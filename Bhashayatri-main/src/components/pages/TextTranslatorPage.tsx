import { useState } from "react";
import { motion } from "motion/react";
import { Languages, ArrowRight, Copy, Volume2, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { translateText } from "../../utils/api";
import { toast } from "sonner@2.0.3";

export function TextTranslatorPage() {
  const [fromLang, setFromLang] = useState("english");
  const [toLang, setToLang] = useState("hindi");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    "English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", 
    "Gujarati", "Kannada", "Malayalam", "Punjabi"
  ];

  // Speech synthesis language codes
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

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate");
      return;
    }

    setIsTranslating(true);

    try {
      // Use lowercase language names for backend
      const backendFromLang = fromLang.toLowerCase();
      const backendToLang = toLang.toLowerCase();
      
      const result = await translateText(inputText, backendFromLang, backendToLang);
      
      if (result.data?.success) {
        setTranslatedText(result.data.translated_text);
        toast.success("Translation complete!");
      } else {
        toast.error(result.data?.error || "Translation not available for this language pair");
        setTranslatedText("");
      }
      
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to connect to translation service");
      setTranslatedText("");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = fromLang;
    setFromLang(toLang);
    setToLang(tempLang);
    
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePlayAudio = (text: string, language: string) => {
    if (!text) {
      toast.info("No text to play");
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = getLanguageCode(language);
      utterance.lang = langCode;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(langCode.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.8;
      utterance.pitch = 1;

      utterance.onstart = () => {
        toast.success(`Speaking in ${language}...`);
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        toast.error("Speech playback failed");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in this browser");
    }
  };

  const handleClear = () => {
    setInputText("");
    setTranslatedText("");
  };

  const sampleTexts = [
    { text: "Hello! How can I help you today?", lang: "English" },
    { text: "Where is the nearest hospital?", lang: "English" },
    { text: "I need a vegetarian restaurant", lang: "English" },
    { text: "नमस्ते! मैं भारत घूमने आया हूं", lang: "Hindi" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGxhbmd1YWdlfGVufDB8fHx8MTczMTQyMzQ2MHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Languages"
          className="w-full h-full object-cover opacity-5 blur-sm"
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">📝 Text Translator</h1>
          <p className="text-gray-600">Type, paste, or select sample text to translate</p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-2">From</label>
              <Select value={fromLang} onValueChange={setFromLang}>
                <SelectTrigger className="w-full">
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
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapLanguages}
              className="mt-6 w-12 h-12 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f59e0b] flex items-center justify-center shadow-lg"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </motion.button>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-2">To</label>
              <Select value={toLang} onValueChange={setToLang}>
                <SelectTrigger className="w-full">
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
          </div>
        </motion.div>

        {/* Translation Interface */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-500" />
                Enter Text
              </h3>
              <span className="text-xs text-gray-500">{inputText.length} characters</span>
            </div>
            
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="min-h-[200px] resize-none mb-4 rounded-2xl"
              maxLength={5000}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePlayAudio(inputText, fromLang)}
                disabled={!inputText}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard(inputText)}
                disabled={!inputText}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!inputText && !translatedText}
              >
                Clear
              </Button>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 bg-gradient-to-br from-[#fff5f0] to-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                Translation
              </h3>
              {translatedText && (
                <span className="text-xs text-gray-500">{translatedText.length} characters</span>
              )}
            </div>
            
            <div className="min-h-[200px] p-4 bg-white/50 rounded-2xl mb-4 overflow-auto">
              {translatedText ? (
                <p className="text-lg leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-gray-400 text-center mt-16">
                  Translation will appear here...
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="gradient-india text-white"
                onClick={() => handlePlayAudio(translatedText, toLang)}
                disabled={!translatedText}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear in My Language
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard(translatedText)}
                disabled={!translatedText}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Translate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <Button
            size="lg"
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
            className="gradient-india text-white px-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            {isTranslating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Languages className="w-5 h-5" />
                </motion.div>
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5 mr-2" />
                Translate
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Sample Texts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="mb-4">💡 Try Sample Texts</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                onClick={() => setInputText(sample.text)}
                className="text-left p-4 rounded-2xl bg-white/50 hover:bg-white/80 border border-gray-200 hover:border-[#ff6b35] transition-all group"
              >
                <p className="text-sm text-gray-700 mb-1">{sample.text}</p>
                <span className="text-xs text-gray-500">({sample.lang})</span>
                <ArrowRight className="w-4 h-4 text-[#ff6b35] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid sm:grid-cols-3 gap-4 mt-6"
        >
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Languages className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm">10+ Indian Languages</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Volume2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm">Audio Playback</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
              <Copy className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm">Quick Copy & Share</p>
          </div>
        </motion.div>

        {/* API Integration Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Python Backend:</strong> POST /bhashini/translate (text, source_language, target_language)
          </p>
        </div>
      </div>
    </div>
  );
}