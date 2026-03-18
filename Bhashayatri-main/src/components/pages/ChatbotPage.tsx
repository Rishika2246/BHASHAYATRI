import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Mic, Volume2, Bot, User, Phone, MapPin, Camera, 
  Image as ImageIcon, Copy, RotateCcw, Trash2, Download, 
  ThumbsUp, ThumbsDown, Star, Sparkles, Globe, Clock,
  TrendingUp, Info, X, Check, MessageSquare, Search,
  Languages, Navigation as NavigationIcon, Utensils, Hotel,
  Plane, ShoppingBag, AlertCircle, Heart, RefreshCw
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { chatWithBot, requestVoiceCall, translateText, textToSpeech, speechToText } from "../../utils/api";

// Message Types
type MessageType = 'text' | 'card' | 'suggestions' | 'location' | 'image';

interface QuickSuggestion {
  text: string;
  icon?: string;
  category?: string;
}

interface MessageAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  type?: MessageType;
  metadata?: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    actions?: MessageAction[];
    location?: { lat: number; lng: number; name: string };
    rating?: number;
    price?: string;
    suggestions?: string[];
  };
  liked?: boolean;
  disliked?: boolean;
  context?: string;
}

export function ChatbotPage() {
  // State Management
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: "bot", 
      text: "🙏 Namaste! I'm Yatri AI, your intelligent travel companion powered by advanced AI. I can help you with:\n\n✨ Travel recommendations\n🗺️ Navigation & directions\n🍽️ Local food & restaurants\n🏨 Hotel bookings\n🌍 Language translation\n📸 Cultural insights\n🆘 Emergency assistance\n\nHow can I assist you today?", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [speakMode, setSpeakMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(`conv_${Date.now()}`);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [autoTranslate, setAutoTranslate] = useState(false);
  
  // Dialog States
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCallRequested, setIsCallRequested] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // Context Management
  const [userContext, setUserContext] = useState({
    currentLocation: null as { lat: number; lng: number; name: string } | null,
    preferences: [] as string[],
    travelHistory: [] as string[],
  });

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Smart Suggestions based on context
  const [smartSuggestions, setSmartSuggestions] = useState<QuickSuggestion[]>([
    { text: "Find nearby attractions", icon: "🗺️", category: "explore" },
    { text: "Recommend local cuisine", icon: "🍽️", category: "food" },
    { text: "Emergency contacts", icon: "🆘", category: "help" },
    { text: "Translate a phrase", icon: "🌐", category: "language" },
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate context-aware suggestions
  const generateSmartSuggestions = (lastMessage: string): QuickSuggestion[] => {
    const suggestions: QuickSuggestion[] = [];
    
    if (lastMessage.toLowerCase().includes('food') || lastMessage.toLowerCase().includes('restaurant')) {
      suggestions.push(
        { text: "Show vegetarian options", icon: "🥗", category: "food" },
        { text: "Budget-friendly restaurants", icon: "💰", category: "food" },
        { text: "Fine dining recommendations", icon: "🍷", category: "food" }
      );
    } else if (lastMessage.toLowerCase().includes('hotel') || lastMessage.toLowerCase().includes('stay')) {
      suggestions.push(
        { text: "Hotels near me", icon: "🏨", category: "stay" },
        { text: "Budget accommodation", icon: "💵", category: "stay" },
        { text: "Luxury resorts", icon: "⭐", category: "stay" }
      );
    } else if (lastMessage.toLowerCase().includes('attraction') || lastMessage.toLowerCase().includes('visit')) {
      suggestions.push(
        { text: "Must-see landmarks", icon: "🏛️", category: "explore" },
        { text: "Hidden gems", icon: "💎", category: "explore" },
        { text: "Photography spots", icon: "📸", category: "explore" }
      );
    } else {
      suggestions.push(
        { text: "Plan my day", icon: "📅", category: "plan" },
        { text: "Weather forecast", icon: "🌤️", category: "info" },
        { text: "Local events", icon: "🎉", category: "events" },
        { text: "Transportation options", icon: "🚗", category: "transport" }
      );
    }
    
    return suggestions;
  };

  // Enhanced AI Response with rich content
  const generateEnhancedResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      // Get conversation context
      const conversationContext = messages
        .slice(-5)
        .map(m => `${m.sender}: ${m.text}`)
        .join('\n');
      
      // Call AI backend
      const response = await chatWithBot(userMessage, conversationId, selectedLanguage);
      
      // Analyze the response for rich content
      const botReply = response.data?.reply || "I'm here to help! Could you clarify your question?";
      
      // Determine message type based on content
      let messageType: MessageType = 'text';
      let metadata: Message['metadata'] = {};
      
      // Check for location-based queries
      if (userMessage.toLowerCase().match(/near|nearby|around|location|directions/)) {
        messageType = 'location';
        metadata = {
          location: { lat: 28.6139, lng: 77.2090, name: "India Gate, New Delhi" },
          suggestions: ["Get directions", "Call venue", "Save for later"]
        };
      }
      
      // Check for recommendation queries
      else if (userMessage.toLowerCase().match(/recommend|suggest|best|top|find/)) {
        messageType = 'card';
        metadata = {
          title: "Taj Mahal",
          subtitle: "UNESCO World Heritage Site • Agra",
          imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400",
          rating: 4.8,
          price: "₹50 - ₹1000",
          actions: [
            {
              label: "View Details",
              action: () => toast.success("Opening details..."),
              variant: 'default'
            },
            {
              label: "Get Directions",
              action: () => toast.info("Opening maps..."),
              variant: 'outline'
            }
          ]
        };
      }
      
      // Check for options/choices
      else if (userMessage.toLowerCase().match(/options|choices|what can|help with/)) {
        messageType = 'suggestions';
        metadata = {
          suggestions: [
            "Find restaurants",
            "Book hotels",
            "Plan itinerary",
            "Emergency help",
            "Cultural tips",
            "Language help"
          ]
        };
      }
      
      const newMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: messageType,
        metadata,
        context: conversationContext
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update smart suggestions based on response
      const newSuggestions = generateSmartSuggestions(botReply);
      setSmartSuggestions(newSuggestions);
      
      // Auto-speak if enabled
      if (speakMode) {
        speakText(botReply);
      }
      
      setIsTyping(false);
      
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: "bot",
        text: "I'm experiencing some technical difficulties. Would you like me to call you instead?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      }]);
    }
  };

  // Send Message
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    
    // Auto-translate if enabled
    if (autoTranslate && selectedLanguage !== 'english') {
      try {
        const translated = await translateText(textToSend, 'english', selectedLanguage);
        console.log('Translated:', translated.data?.translated_text);
      } catch (error) {
        console.error('Translation error:', error);
      }
    }
    
    // Generate AI response
    await generateEnhancedResponse(textToSend);
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Send to speech recognition API
        try {
          const result = await speechToText(audioBlob, selectedLanguage);
          if (result.data?.text) {
            setInputText(result.data.text);
            toast.success("Speech recognized!");
          }
        } catch (error) {
          toast.error("Could not recognize speech");
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording...");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  // Text to Speech
  const speakText = async (text: string) => {
    try {
      const result = await textToSpeech(text, selectedLanguage);
      
      // Fallback to Web Speech API
      if (!result.data?.audio_url && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  // Message Actions
  const likeMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, liked: !msg.liked, disliked: false }
        : msg
    ));
    toast.success("Feedback recorded!");
  };

  const dislikeMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, disliked: !msg.disliked, liked: false }
        : msg
    ));
    toast.info("We'll improve!");
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied!");
  };

  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      // Remove last bot message
      setMessages(prev => prev.slice(0, -1));
      
      // Generate new response
      await generateEnhancedResponse(lastUserMessage.text);
      toast.success("Regenerating response...");
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
    setConversationId(`conv_${Date.now()}`);
    toast.success("Chat cleared!");
  };

  const exportChat = () => {
    const chatText = messages
      .map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    toast.success("Chat exported!");
  };

  // Voice Call Request
  const handleRequestCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    
    try {
      const conversationContext = messages
        .slice(-5)
        .map(m => `${m.sender}: ${m.text}`)
        .join('\n');
      
      const response = await requestVoiceCall(phoneNumber, selectedLanguage, conversationContext);
      
      if (response.success) {
        setIsCallRequested(true);
        setTimeout(() => {
          setShowCallDialog(false);
          setIsCallRequested(false);
          setPhoneNumber("");
          toast.success("Call completed!");
        }, 3000);
      }
    } catch (error) {
      console.error('Call request error:', error);
      toast.error("Could not initiate call");
    }
  };

  // Filter messages by search
  const filteredMessages = searchQuery
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // Render different message types
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'card':
        return (
          <Card className="p-4 border-[#ff6b35]/20 bg-gradient-to-br from-white to-orange-50">
            {message.metadata?.imageUrl && (
              <img 
                src={message.metadata.imageUrl} 
                alt={message.metadata.title}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
            )}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg">{message.metadata?.title}</h4>
                  <p className="text-sm text-gray-600">{message.metadata?.subtitle}</p>
                </div>
                {message.metadata?.rating && (
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm">{message.metadata.rating}</span>
                  </div>
                )}
              </div>
              
              {message.metadata?.price && (
                <p className="text-sm text-green-600">{message.metadata.price}</p>
              )}
              
              <p className="text-sm">{message.text}</p>
              
              {message.metadata?.actions && (
                <div className="flex gap-2 pt-2">
                  {message.metadata.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={action.variant || 'default'}
                      onClick={action.action}
                      className="rounded-full"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      
      case 'location':
        return (
          <Card className="p-4 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h4>{message.metadata?.location?.name}</h4>
              </div>
              <p className="text-sm">{message.text}</p>
              <div className="h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-sm text-gray-500">📍 Map Preview</span>
              </div>
              {message.metadata?.suggestions && (
                <div className="flex gap-2">
                  {message.metadata.suggestions.map((sug, idx) => (
                    <Button key={idx} size="sm" variant="outline" className="rounded-full text-xs">
                      {sug}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      
      case 'suggestions':
        return (
          <div className="space-y-3">
            <p className="text-sm">{message.text}</p>
            <div className="grid grid-cols-2 gap-2">
              {message.metadata?.suggestions?.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(sug)}
                  className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#ff6b35] hover:bg-orange-50 transition-all text-sm text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        );
      
      default:
        return <p>{message.text}</p>;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 flex">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-india rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1>AI Travel Assistant</h1>
          </div>
          <p className="text-gray-600">Powered by Advanced AI • Context-Aware • Multilingual</p>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-4 h-4 ${speakMode ? "text-[#ff6b35]" : "text-gray-400"}`} />
              <Switch checked={speakMode} onCheckedChange={setSpeakMode} />
              <span className="text-sm text-gray-600">Voice</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Languages className={`w-4 h-4 ${autoTranslate ? "text-[#ff6b35]" : "text-gray-400"}`} />
              <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
              <span className="text-sm text-gray-600">Auto-Translate</span>
            </div>
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search</span>
            </button>
            
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Clear</span>
            </button>
            
            <button
              onClick={exportChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md mx-auto rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 glass rounded-3xl p-6 flex flex-col max-h-[600px]"
        >
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "bot" ? "gradient-india" : "bg-gradient-to-br from-gray-400 to-gray-600"
                  }`}>
                    {message.sender === "bot" ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[80%] ${message.sender === "user" ? "items-end" : ""}`}>
                    <div className={`rounded-3xl p-4 ${
                      message.sender === "bot" 
                        ? "bg-gradient-to-br from-[#fff5f0] to-white border border-[#ff6b35]/20" 
                        : "bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200"
                    }`}>
                      {renderMessageContent(message)}
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mt-2 px-2 flex-wrap">
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                      
                      {message.sender === "bot" && (
                        <>
                          {speakMode && (
                            <button 
                              onClick={() => speakText(message.text)}
                              className="text-blue-600 hover:scale-110 transition-transform"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => copyMessage(message.text)}
                            className="text-gray-600 hover:text-[#ff6b35] transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          
                          <button 
                            onClick={() => likeMessage(message.id)}
                            className={`transition-colors ${message.liked ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                          >
                            <ThumbsUp className="w-3 h-3" fill={message.liked ? 'currentColor' : 'none'} />
                          </button>
                          
                          <button 
                            onClick={() => dislikeMessage(message.id)}
                            className={`transition-colors ${message.disliked ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                          >
                            <ThumbsDown className="w-3 h-3" fill={message.disliked ? 'currentColor' : 'none'} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-full gradient-india flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-[#fff5f0] to-white rounded-3xl p-4 border border-[#ff6b35]/20">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-[#ff6b35] rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#ff6b35] rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#ff6b35] rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full flex-shrink-0"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-[#ff6b35]'}`} />
            </Button>
            
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything about travel..."
              className="rounded-full px-6"
            />
            
            {messages.length > 1 && messages[messages.length - 1].sender === "bot" && (
              <Button
                size="icon"
                variant="outline"
                onClick={regenerateResponse}
                className="rounded-full flex-shrink-0"
                title="Regenerate response"
              >
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </Button>
            )}
            
            <Button
              size="icon"
              onClick={() => sendMessage()}
              className="gradient-india text-white rounded-full flex-shrink-0"
              disabled={isTyping}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Smart Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">💡 Smart suggestions:</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCallDialog(true)}
              className="text-xs"
            >
              <Phone className="w-3 h-3 mr-1" />
              Request Call
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((suggestion, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => sendMessage(suggestion.text)}
                className="px-4 py-2 bg-white rounded-full text-sm border border-gray-200 hover:border-[#ff6b35] hover:text-[#ff6b35] hover:shadow-md transition-all flex items-center gap-2"
              >
                {suggestion.icon && <span>{suggestion.icon}</span>}
                <span>{suggestion.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Features & Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversation ID</p>
                <p className="text-xs font-mono text-purple-600">{conversationId}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Messages Exchanged</p>
                <p className="text-xl">{messages.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* API Integration Notes */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">
                <strong className="text-blue-800">🔌 Python Backend Integration:</strong>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                POST /api/chat/message (Context-aware AI) • POST /api/twilio/request-call (Voice) • 
                POST /api/bhashini/translate (Multi-language) • POST /api/bhashini/asr (Speech-to-Text) • 
                POST /api/bhashini/tts (Text-to-Speech)
              </p>
            </div>
          </div>
        </div>

        {/* Voice Call Request Dialog */}
        <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#ff6b35]" />
                Request AI Voice Call
              </DialogTitle>
              <DialogDescription>
                Our AI assistant will call you to continue the conversation in {selectedLanguage}
              </DialogDescription>
            </DialogHeader>
            
            {!isCallRequested ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Your Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Preferred Language</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300"
                  >
                    <option value="english">English</option>
                    <option value="hindi">हिंदी (Hindi)</option>
                    <option value="bengali">বাংলা (Bengali)</option>
                    <option value="tamil">தமிழ் (Tamil)</option>
                    <option value="telugu">తెలుగు (Telugu)</option>
                    <option value="marathi">मराठी (Marathi)</option>
                    <option value="gujarati">ગુજરાતી (Gujarati)</option>
                    <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="malayalam">മലയാളം (Malayalam)</option>
                  </select>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-800">
                    ℹ️ The AI will share the last 5 messages as context for better assistance
                  </p>
                </div>
                
                <Button 
                  onClick={handleRequestCall}
                  className="w-full gradient-india text-white rounded-2xl"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Request Call Now
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full mx-auto mb-4"
                />
                <div className="w-16 h-16 gradient-india rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="mb-2">Call Initiated!</h4>
                <p className="text-sm text-gray-600">
                  You'll receive a call from our AI assistant in a few moments.
                </p>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Assistant Info Panel - Desktop */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block w-80 m-8 space-y-4"
      >
        {/* Avatar Display */}
        <div className="glass rounded-3xl p-6">
          <div className="text-center">
            <div className="w-48 h-48 mx-auto rounded-full gradient-india flex items-center justify-center mb-4 relative overflow-hidden">
              <motion.div
                animate={{ 
                  scale: speakMode ? [1, 1.1, 1] : 1,
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl"
              >
                🤖
              </motion.div>
              
              {speakMode && (
                <motion.div
                  className="absolute bottom-4 flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      animate={{
                        height: ["10px", "30px", "10px"],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
            <h3>Yatri AI Pro</h3>
            <p className="text-sm text-gray-600 mt-2">Advanced AI Travel Companion</p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Context-Aware
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Multilingual
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Capabilities */}
        <Card className="p-4">
          <h4 className="mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            AI Capabilities
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Natural language understanding</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Multi-turn conversations</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Context retention</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Smart recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Voice interaction</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Real-time translation</span>
            </div>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <Card className="p-4">
          <h4 className="mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button 
              onClick={() => sendMessage("Show me nearby attractions")}
              className="w-full p-2 bg-orange-50 hover:bg-orange-100 rounded-xl text-sm text-left transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#ff6b35]" />
              Nearby Places
            </button>
            <button 
              onClick={() => sendMessage("Recommend restaurants")}
              className="w-full p-2 bg-green-50 hover:bg-green-100 rounded-xl text-sm text-left transition-colors flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-green-600" />
              Food Spots
            </button>
            <button 
              onClick={() => sendMessage("Help me book a hotel")}
              className="w-full p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm text-left transition-colors flex items-center gap-2"
            >
              <Hotel className="w-4 h-4 text-blue-600" />
              Hotels
            </button>
            <button 
              onClick={() => sendMessage("Emergency assistance")}
              className="w-full p-2 bg-red-50 hover:bg-red-100 rounded-xl text-sm text-left transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              Emergency
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
