import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, MessageCircle, Send, Mic, StopCircle, Languages, Copy, Download, Trash2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

interface ConversationMessage {
  id: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
  audioUrl?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

const CONVERSATION_STYLES = [
  { id: 'casual', name: 'Casual', icon: '😊', description: 'Friendly, everyday conversation' },
  { id: 'formal', name: 'Formal', icon: '🎩', description: 'Professional, respectful tone' },
  { id: 'tourist', name: 'Tourist', icon: '🗺️', description: 'Travel-specific phrases' },
  { id: 'emergency', name: 'Emergency', icon: '🆘', description: 'Urgent, clear communication' },
];

const VOICE_SETTINGS = {
  casual: { rate: 1.0, pitch: 1.1 },
  formal: { rate: 0.9, pitch: 1.0 },
  tourist: { rate: 0.95, pitch: 1.05 },
  emergency: { rate: 1.1, pitch: 1.15 },
};

export const ConversationTranslatorPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('hi');
  const [conversationStyle, setConversationStyle] = useState('casual');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Natural conversation templates for different styles
  const conversationTemplates = {
    casual: {
      greeting: ['Hi!', 'Hello!', 'Hey there!'],
      thankyou: ['Thanks!', 'Thank you so much!', 'Appreciate it!'],
      yes: ['Yes', 'Yeah', 'Sure', 'Of course'],
      no: ['No', 'Nope', 'Not really', 'I don\'t think so'],
    },
    formal: {
      greeting: ['Good morning', 'Good afternoon', 'Good evening'],
      thankyou: ['Thank you very much', 'I appreciate your help', 'Many thanks'],
      yes: ['Yes, certainly', 'Absolutely', 'That would be excellent'],
      no: ['No, thank you', 'I\'m afraid not', 'Unfortunately not'],
    },
    tourist: {
      greeting: ['Hello, I\'m a tourist', 'Excuse me', 'Can you help me?'],
      thankyou: ['Thank you for your help', 'That\'s very helpful', 'I appreciate it'],
      yes: ['Yes, please', 'That would be great', 'Perfect'],
      no: ['No, thank you', 'I\'m just looking', 'Maybe later'],
    },
    emergency: {
      greeting: ['Help!', 'Emergency!', 'I need help'],
      thankyou: ['Thank you', 'Thanks for helping'],
      yes: ['Yes', 'Correct', 'That\'s right'],
      no: ['No', 'Wrong', 'Not that'],
    },
  };

  // Make translation more conversational
  const makeConversational = (text: string, style: string): string => {
    let conversationalText = text;

    // Add natural filler words based on style
    if (style === 'casual') {
      conversationalText = conversationalText
        .replace(/\bI want\b/gi, 'I\'d like')
        .replace(/\bDo you have\b/gi, 'Got')
        .replace(/\bCan you\b/gi, 'Could you');
    } else if (style === 'formal') {
      conversationalText = conversationalText
        .replace(/\bHi\b/gi, 'Good day')
        .replace(/\bThanks\b/gi, 'Thank you')
        .replace(/\bYeah\b/gi, 'Yes');
    } else if (style === 'tourist') {
      // Add polite tourist phrases
      if (!conversationalText.match(/\b(please|excuse me|sorry)\b/i)) {
        conversationalText = 'Excuse me, ' + conversationalText.toLowerCase();
      }
    } else if (style === 'emergency') {
      // Make it more urgent
      conversationalText = conversationalText + '!';
    }

    return conversationalText;
  };

  const translateMessage = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsTranslating(true);

    try {
      // Make text conversational before translation
      const conversationalInput = makeConversational(inputText, conversationStyle);

      // Call translation API
      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: conversationalInput,
          from: fromLang,
          to: toLang,
          style: conversationStyle,
        }),
      });

      let translated = '';
      
      if (response.ok) {
        const data = await response.json();
        translated = data.translated;
      } else {
        // Fallback: Mock translation with conversational style
        const templates = conversationTemplates[conversationStyle as keyof typeof conversationTemplates];
        
        // Simple mock translation (in real app, Bhashini API would handle this)
        if (conversationalInput.toLowerCase().includes('hello') || conversationalInput.toLowerCase().includes('hi')) {
          translated = templates.greeting[Math.floor(Math.random() * templates.greeting.length)];
        } else if (conversationalInput.toLowerCase().includes('thank')) {
          translated = templates.thankyou[Math.floor(Math.random() * templates.thankyou.length)];
        } else if (conversationalInput.toLowerCase().includes('yes')) {
          translated = templates.yes[Math.floor(Math.random() * templates.yes.length)];
        } else if (conversationalInput.toLowerCase().includes('no')) {
          translated = templates.no[Math.floor(Math.random() * templates.no.length)];
        } else {
          // Generic translation (would be real translation from API)
          translated = `[${toLang.toUpperCase()}] ${conversationalInput}`;
        }
      }

      const newMessage: ConversationMessage = {
        id: Date.now().toString(),
        original: conversationalInput,
        translated,
        fromLang,
        toLang,
        timestamp: Date.now(),
      };

      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Auto-play TTS
      await playTranslation(newMessage.id, translated);
      
      toast.success('Translation complete!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const playTranslation = async (messageId: string, text: string) => {
    setIsPlaying(messageId);

    try {
      // Try TTS API first
      const voiceSettings = VOICE_SETTINGS[conversationStyle as keyof typeof VOICE_SETTINGS];
      
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: toLang,
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      } else {
        // Fallback: Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = LANGUAGES.find(l => l.code === toLang);
        utterance.lang = lang ? `${lang.code}-IN` : 'en-IN';
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        
        utterance.onend = () => setIsPlaying(null);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Speech playback failed');
    } finally {
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe audio
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('language', fromLang);

        try {
          const response = await fetch('/api/translate/speech', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setInputText(data.transcription);
          } else {
            setInputText('[Speech recognized - Mock mode]');
          }
        } catch (error) {
          setInputText('[Speech recognized - Demo]');
        }
        
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
      toast.success('Recording started (5 sec max)');
    } catch (error) {
      toast.error('Microphone access denied');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadConversation = () => {
    const text = messages.map(m => 
      `[${new Date(m.timestamp).toLocaleString()}]\n` +
      `${m.fromLang.toUpperCase()}: ${m.original}\n` +
      `${m.toLang.toUpperCase()}: ${m.translated}\n\n`
    ).join('');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Conversation downloaded!');
  };

  const clearConversation = () => {
    setMessages([]);
    toast.success('Conversation cleared');
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    toast.success('Languages swapped!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF9933]/10 via-white to-[#138808]/10 p-4 md:p-8">
      <audio ref={audioRef} className="hidden" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9933] to-[#138808] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[#000080]">Conversation Translator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Natural, conversation-style translations optimized for speech output. 
            Choose your style and get translations that sound human!
          </p>
        </motion.div>

        {/* Style Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/70 border-white/20">
            <h3 className="text-gray-700 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF9933]" />
              Conversation Style
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CONVERSATION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setConversationStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    conversationStyle === style.id
                      ? 'border-[#FF9933] bg-[#FF9933]/10'
                      : 'border-gray-200 hover:border-[#FF9933]/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <div className="text-sm text-gray-900">{style.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/70 border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">From Language</label>
                <Select value={fromLang} onValueChange={setFromLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={swapLanguages}
                  variant="outline"
                  size="icon"
                  className="rounded-full border-[#FF9933] text-[#FF9933] hover:bg-[#FF9933]/10"
                >
                  <Languages className="w-5 h-5" />
                </Button>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">To Language</label>
                <Select value={toLang} onValueChange={setToLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/70 border-white/20">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px] mb-4 bg-white/50"
            />
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={translateMessage}
                disabled={isTranslating || !inputText.trim()}
                className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white"
              >
                {isTranslating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Translate & Speak
                  </>
                )}
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant="outline"
                className={`${
                  isRecording
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-[#FF9933] text-[#FF9933]'
                }`}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="w-4 h-4 mr-2 animate-pulse" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Record
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Conversation History */}
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700">Conversation History</h3>
              <div className="flex gap-2">
                <Button
                  onClick={downloadConversation}
                  variant="outline"
                  size="sm"
                  className="border-[#138808] text-[#138808]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={clearConversation}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 backdrop-blur-xl bg-white/70 border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className="border-[#FF9933] text-[#FF9933]">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyToClipboard(message.translated)}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => playTranslation(message.id, message.translated)}
                            variant="ghost"
                            size="sm"
                            disabled={isPlaying === message.id}
                          >
                            <Volume2 className={`w-4 h-4 ${isPlaying === message.id ? 'animate-pulse text-[#FF9933]' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {LANGUAGES.find(l => l.code === message.fromLang)?.native} (Original)
                          </div>
                          <p className="text-gray-700">{message.original}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="text-xs text-gray-500 mb-1">
                            {LANGUAGES.find(l => l.code === message.toLang)?.native} (Translation)
                          </div>
                          <p className="text-[#000080]">{message.translated}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Start a conversation! Type a message or use voice input.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
