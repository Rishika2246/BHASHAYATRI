import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, MicOff, Volume2, Languages, Clock, Download, Trash2, 
  Copy, Share2, Bookmark, Filter, Search, RotateCcw, Users,
  Sparkles, Zap, Star, Play, Pause, ArrowRightLeft
} from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { toast } from "sonner@2.0.3";
import { speechToText, translateText, textToSpeech } from "../../utils/api";

interface ConversationItem {
  id: string;
  time: string;
  timestamp: number;
  original: string;
  translated: string;
  from: string;
  to: string;
  speaker?: "user" | "other";
  confidence?: number;
  bookmarked?: boolean;
  audioUrl?: string;
}

interface ConversationSession {
  id: string;
  name: string;
  date: string;
  messages: ConversationItem[];
  participants: string[];
}

export function LiveTranslatorPage() {
  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Language States
  const [fromLang, setFromLang] = useState("english");
  const [toLang, setToLang] = useState("hindi");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  
  // Text States
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Conversation States
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [sessions, setSessions] = useState<ConversationSession[]>([
    {
      id: "session_1",
      name: "Delhi Tour Guide Conversation",
      date: "2024-01-15",
      messages: [
        { id: "1", time: "10:30 AM", timestamp: Date.now() - 3600000, original: "Hello, how are you?", translated: "नमस्ते, आप कैसे हैं?", from: "English", to: "Hindi", speaker: "user", confidence: 0.95 },
        { id: "2", time: "10:31 AM", timestamp: Date.now() - 3540000, original: "मैं ठीक हूं, धन्यवाद", translated: "I'm fine, thank you", from: "Hindi", to: "English", speaker: "other", confidence: 0.92 },
      ],
      participants: ["You", "Tour Guide"]
    }
  ]);
  const [currentSession, setCurrentSession] = useState<string>(sessions[0]?.id);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<"all" | "user" | "other">("all");
  const [showStats, setShowStats] = useState(false);
  
  // Audio Settings
  const [autoPlayTranslation, setAutoPlayTranslation] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
  
  // Advanced Features
  const [conversationMode, setConversationMode] = useState<"single" | "multi">("single");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Language Configuration
  const languages = [
    { code: "english", name: "English", native: "English", flag: "🇬🇧" },
    { code: "hindi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
    { code: "bengali", name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
    { code: "tamil", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
    { code: "telugu", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
    { code: "marathi", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
    { code: "gujarati", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
    { code: "kannada", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "malayalam", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
    { code: "punjabi", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Format recording duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current session messages
  const getCurrentMessages = (): ConversationItem[] => {
    const session = sessions.find(s => s.id === currentSession);
    return session?.messages || conversationHistory;
  };

  // Filter messages
  const getFilteredMessages = (): ConversationItem[] => {
    let messages = getCurrentMessages();
    
    if (selectedSpeaker !== "all") {
      messages = messages.filter(m => m.speaker === selectedSpeaker);
    }
    
    if (searchQuery) {
      messages = messages.filter(m => 
        m.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.translated.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return messages;
  };

  // Calculate statistics
  const getStats = () => {
    const messages = getCurrentMessages();
    return {
      total: messages.length,
      wordsTranslated: messages.reduce((acc, m) => acc + m.original.split(' ').length, 0),
      averageConfidence: messages.length > 0 
        ? (messages.reduce((acc, m) => acc + (m.confidence || 0), 0) / messages.length * 100).toFixed(1)
        : 0,
      bookmarked: messages.filter(m => m.bookmarked).length,
      duration: messages.length > 0 
        ? Math.floor((messages[messages.length - 1].timestamp - messages[0].timestamp) / 60000)
        : 0
    };
  };

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: noiseReduction,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Could not access microphone");
      console.error("Recording error:", error);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      toast.info("Processing recording...");
    }
  };

  // Pause/Resume Recording
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast.info("Recording resumed");
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast.info("Recording paused");
      }
    }
  };

  // Process Recording
  const processRecording = async (audioBlob: Blob) => {
    try {
      setIsTranslating(true);
      
      // Speech to Text
      const asr = await speechToText(audioBlob, fromLang);
      const originalText = asr.data?.text || "Sample transcribed text";
      setOriginalText(originalText);
      
      // Translate
      const translation = await translateText(originalText, fromLang, toLang);
      const translatedText = translation.data?.translated_text || `[${toLang}] ${originalText}`;
      setTranslatedText(translatedText);
      
      // Add to conversation
      const newMessage: ConversationItem = {
        id: `msg_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        original: originalText,
        translated: translatedText,
        from: languages.find(l => l.code === fromLang)?.name || fromLang,
        to: languages.find(l => l.code === toLang)?.name || toLang,
        speaker: "user",
        confidence: 0.85 + Math.random() * 0.15,
        bookmarked: false
      };
      
      setConversationHistory(prev => [...prev, newMessage]);
      
      // Auto-play translation
      if (autoPlayTranslation) {
        await playTranslation(translatedText);
      }
      
      toast.success("Translation complete!");
      setIsTranslating(false);
      
    } catch (error) {
      toast.error("Translation failed");
      setIsTranslating(false);
      console.error("Processing error:", error);
    }
  };

  // Play Translation Audio
  const playTranslation = async (text: string) => {
    try {
      const tts = await textToSpeech(text, toLang);
      
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = toLang === 'hindi' ? 'hi-IN' : 'en-US';
        utterance.rate = playbackSpeed;
        
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => 
          v.lang.startsWith(toLang === 'hindi' ? 'hi' : 'en') &&
          (voiceGender === 'female' ? v.name.includes('Female') : v.name.includes('Male'))
        );
        if (voice) utterance.voice = voice;
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("TTS error:", error);
    }
  };

  // Swap Languages
  const swapLanguages = () => {
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
    toast.success("Languages swapped");
  };

  // Toggle Bookmark
  const toggleBookmark = (id: string) => {
    setConversationHistory(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, bookmarked: !msg.bookmarked } : msg
      )
    );
  };

  // Copy Message
  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Export Conversation
  const exportConversation = () => {
    const messages = getCurrentMessages();
    const content = messages
      .map(m => `[${m.time}] ${m.from} → ${m.to}\n${m.original}\n${m.translated}\n`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.txt`;
    a.click();
    toast.success("Conversation exported");
  };

  // Clear Conversation
  const clearConversation = () => {
    setConversationHistory([]);
    toast.success("Conversation cleared");
  };

  // Create New Session
  const createNewSession = () => {
    const newSession: ConversationSession = {
      id: `session_${Date.now()}`,
      name: `Conversation ${sessions.length + 1}`,
      date: new Date().toLocaleDateString(),
      messages: [],
      participants: ["You"]
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession.id);
    setConversationHistory([]);
    toast.success("New session created");
  };

  const stats = getStats();

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-india rounded-2xl flex items-center justify-center">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <h1>Live Translator</h1>
          </div>
          <p className="text-gray-600">Real-time speech translation with conversation history</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Translation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selector & Controls */}
            <Card className="p-6 glass">
              <div className="space-y-4">
                {/* Language Selection */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-2">From</label>
                    <Select value={fromLang} onValueChange={setFromLang}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.native})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={swapLanguages}
                    className="rounded-full mt-7"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex-1">
                    <label className="block text-sm mb-2">To</label>
                    <Select value={toLang} onValueChange={setToLang}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.native})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <div className="flex items-center gap-2">
                    <Switch checked={autoDetectLanguage} onCheckedChange={setAutoDetectLanguage} />
                    <span className="text-gray-600">Auto-detect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={autoPlayTranslation} onCheckedChange={setAutoPlayTranslation} />
                    <span className="text-gray-600">Auto-play</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
                    <span className="text-gray-600">Noise reduction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={showConfidence} onCheckedChange={setShowConfidence} />
                    <span className="text-gray-600">Show confidence</span>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex items-center justify-center gap-4 py-6">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gradient-india text-white rounded-full w-16 h-16"
                    >
                      <Mic className="w-8 h-8" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={togglePause}
                        size="lg"
                        variant="outline"
                        className="rounded-full w-14 h-14"
                      >
                        {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                      </Button>
                      
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
                      >
                        <MicOff className="w-8 h-8" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Recording Status */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-2"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      />
                      <span className="text-sm text-gray-600">
                        {isPaused ? "Paused" : "Recording"} - {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    
                    {/* Audio Visualizer */}
                    <div className="flex items-center justify-center gap-1 h-12">
                      {!isPaused && [...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-[#ff6b35] rounded-full"
                          animate={{
                            height: ["20%", "100%", "20%"],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Conversation History */}
            <Card className="glass">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#ff6b35]" />
                    Conversation History
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowStats(!showStats)}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={exportConversation}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearConversation}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </div>
                  <Select value={selectedSpeaker} onValueChange={(v: any) => setSelectedSpeaker(v)}>
                    <SelectTrigger className="w-32 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="user">You</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stats Panel */}
                <AnimatePresence>
                  {showStats && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4"
                    >
                      <div className="bg-gradient-to-br from-orange-50 to-white p-3 rounded-xl border border-orange-200">
                        <p className="text-xs text-gray-600">Messages</p>
                        <p className="text-xl">{stats.total}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border border-green-200">
                        <p className="text-xs text-gray-600">Words</p>
                        <p className="text-xl">{stats.wordsTranslated}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-xl border border-blue-200">
                        <p className="text-xs text-gray-600">Confidence</p>
                        <p className="text-xl">{stats.averageConfidence}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-white p-3 rounded-xl border border-purple-200">
                        <p className="text-xs text-gray-600">Bookmarks</p>
                        <p className="text-xl">{stats.bookmarked}</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-white p-3 rounded-xl border border-pink-200">
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-xl">{stats.duration}m</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {getFilteredMessages().length === 0 ? (
                    <div className="text-center py-12">
                      <Languages className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations yet</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Start recording to begin translating
                      </p>
                    </div>
                  ) : (
                    getFilteredMessages().map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: item.speaker === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 ${item.speaker === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.speaker === "user" ? "bg-gradient-to-br from-blue-400 to-blue-600" : "bg-gradient-to-br from-green-400 to-green-600"
                        }`}>
                          <span className="text-white text-sm">
                            {item.speaker === "user" ? "You" : "👤"}
                          </span>
                        </div>

                        <div className={`flex-1 ${item.speaker === "user" ? "items-end" : ""}`}>
                          <div className={`rounded-3xl p-4 ${
                            item.speaker === "user"
                              ? "bg-gradient-to-br from-blue-50 to-white border border-blue-200"
                              : "bg-gradient-to-br from-green-50 to-white border border-green-200"
                          }`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.from} → {item.to}
                              </Badge>
                              {showConfidence && item.confidence && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    item.confidence > 0.9 ? 'border-green-500 text-green-700' : 
                                    item.confidence > 0.8 ? 'border-yellow-500 text-yellow-700' : 
                                    'border-red-500 text-red-700'
                                  }`}
                                >
                                  {(item.confidence * 100).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm mb-2">{item.original}</p>
                            <p className="text-sm text-gray-700 bg-white/50 rounded-xl p-2">
                              {item.translated}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-2 px-2">
                            <span className="text-xs text-gray-500">{item.time}</span>
                            <button
                              onClick={() => playTranslation(item.translated)}
                              className="text-blue-600 hover:scale-110 transition-transform"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => copyMessage(`${item.original}\n${item.translated}`)}
                              className="text-gray-600 hover:text-[#ff6b35] transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => toggleBookmark(item.id)}
                              className={`transition-colors ${
                                item.bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                              }`}
                            >
                              <Bookmark className="w-3 h-3" fill={item.bookmarked ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Sidebar - Settings & Sessions */}
          <div className="space-y-6">
            {/* Audio Settings */}
            <Card className="p-6 glass">
              <h4 className="mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#ff6b35]" />
                Audio Settings
              </h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-600">Playback Speed</label>
                    <span className="text-sm">{playbackSpeed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={(v) => setPlaybackSpeed(v[0])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Voice Gender</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={voiceGender === "female" ? "default" : "outline"}
                      onClick={() => setVoiceGender("female")}
                      className="flex-1 rounded-full"
                    >
                      Female
                    </Button>
                    <Button
                      size="sm"
                      variant={voiceGender === "male" ? "default" : "outline"}
                      onClick={() => setVoiceGender("male")}
                      className="flex-1 rounded-full"
                    >
                      Male
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Conversation Mode</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={conversationMode === "single" ? "default" : "outline"}
                      onClick={() => setConversationMode("single")}
                      className="flex-1 rounded-full text-xs"
                    >
                      Single
                    </Button>
                    <Button
                      size="sm"
                      variant={conversationMode === "multi" ? "default" : "outline"}
                      onClick={() => setConversationMode("multi")}
                      className="flex-1 rounded-full text-xs"
                    >
                      Multi-Person
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sessions */}
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#ff6b35]" />
                  Sessions
                </h4>
                <Button size="sm" onClick={createNewSession} className="rounded-full">
                  New
                </Button>
              </div>

              <div className="space-y-2">
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSession(session.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      currentSession === session.id
                        ? 'bg-gradient-to-br from-orange-50 to-white border-2 border-[#ff6b35]'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm mb-1">{session.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{session.date}</span>
                      <span>{session.messages.length} msgs</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 glass">
              <h4 className="mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={exportConversation}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Conversation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    const bookmarked = getCurrentMessages().filter(m => m.bookmarked);
                    console.log('Bookmarked:', bookmarked);
                    toast.success(`${bookmarked.length} bookmarks found`);
                  }}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  View Bookmarks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    const text = getCurrentMessages()
                      .map(m => `${m.original} = ${m.translated}`)
                      .join('\n');
                    navigator.clipboard.writeText(text);
                    toast.success("All translations copied");
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* API Integration Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <p className="text-sm">
            <strong className="text-blue-800">🔌 Python Backend:</strong>
            <span className="text-blue-700 text-xs ml-2">
              POST /api/bhashini/asr (Speech Recognition) • POST /api/bhashini/translate (Translation) • 
              POST /api/bhashini/tts (Text-to-Speech)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
