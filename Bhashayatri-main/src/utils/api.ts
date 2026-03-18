/**
 * Python Backend API Integration
 * To change the API URL, update /config.ts
 */

import { config } from '../config';
import { showBackendWarning } from './notifications';

const API_BASE_URL = config.apiBaseUrl;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Check if backend is available
 */
let backendAvailable = true;

/**
 * Generic API call function with fallback to mock data
 */
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
  mockData?: T
): Promise<ApiResponse<T>> {
  // If backend is known to be unavailable and we have mock data, return it immediately
  if (!backendAvailable && mockData) {
    return {
      success: true,
      data: mockData,
      message: 'Using mock data (backend unavailable)',
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    backendAvailable = true; // Backend is working
    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.warn('API Error:', error);
    backendAvailable = false; // Mark backend as unavailable
    
    // Show warning about backend not being available
    showBackendWarning();
    
    // Return mock data if available
    if (mockData) {
      return {
        success: true,
        data: mockData,
        message: 'Using mock data (backend unavailable)',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Bhashini API - Speech Recognition (ASR)
 */
export async function speechToText(audioBlob: Blob, sourceLanguage: string) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('source_language', sourceLanguage);

  const mockData = {
    text: 'This is a sample transcription. Connect Python backend for real speech recognition.',
  };

  return apiCall<{ text: string }>(
    '/bhashini/asr',
    {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    },
    mockData
  );
}

/**
 * Bhashini API - Machine Translation (MT)
 * Connects to Python backend with BhashiniMT class
 * Endpoint: POST /bhashini/translate
 * Expected backend response: { success: true, translated_text: "...", cached: false }
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  conversationStyle?: string
) {
  // Generate intelligent mock translation for demo mode
  const mockData = {
    translated_text: generateSmartMockTranslation(text, sourceLanguage, targetLanguage),
    cached: false,
  };

  return apiCall<{ translated_text: string; cached: boolean }>(
    '/bhashini/translate',
    {
      method: 'POST',
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        style: conversationStyle || 'casual',
      }),
    },
    mockData
  );
}

/**
 * Generate intelligent mock translations for demo mode
 */
function generateSmartMockTranslation(text: string, from: string, to: string): string {
  // Common phrases with actual translations
  const phraseDictionary: Record<string, Record<string, string>> = {
    'hello': {
      'hindi': 'नमस्ते',
      'tamil': 'வணக்கம்',
      'bengali': 'নমস্কার',
      'telugu': 'నమస్కారం',
      'marathi': 'नमस्कार',
      'gujarati': 'નમસ્તે',
      'kannada': 'ನಮಸ್ಕಾರ',
      'malayalam': 'നമസ്കാരം',
      'punjabi': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    },
    'thank you': {
      'hindi': 'धन्यवाद',
      'tamil': 'நன்றி',
      'bengali': 'ধন্যবাদ',
      'telugu': 'ధన్యవాదాలు',
      'marathi': 'धन्यवाद',
      'gujarati': 'આભાર',
      'kannada': 'ಧನ್ಯವಾದಗಳು',
      'malayalam': 'നന്ദി',
      'punjabi': 'ਧੰਨਵਾਦ',
    },
    'good morning': {
      'hindi': 'सुप्रभात',
      'tamil': 'காலை வணக்கம்',
      'bengali': 'সুপ্রভাত',
      'telugu': 'శుభోదయం',
      'marathi': 'सुप्रभात',
      'gujarati': 'સુપ્રભાત',
      'kannada': 'ಶುಭೋದಯ',
      'malayalam': 'സുപ്രഭാതം',
      'punjabi': 'ਸ਼ੁਭ ਸਵੇਰ',
    },
    'how are you': {
      'hindi': 'आप कैसे हैं?',
      'tamil': 'நீங்கள் எப்படி இருக்கிறீர்கள்?',
      'bengali': 'আপনি কেমন আছেন?',
      'telugu': 'మీరు ఎలా ఉన్నారు?',
      'marathi': 'तुम्ही कसे आहात?',
      'gujarati': 'તમે કેવી રીતે છો?',
      'kannada': 'ನೀವು ಹೇಗಿದ್ದೀರಿ?',
      'malayalam': 'നിങ്ങൾ എങ്ങനെയുണ്ട്?',
      'punjabi': 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',
    },
    'please': {
      'hindi': 'कृपया',
      'tamil': 'தயவு செய்து',
      'bengali': 'অনুগ্রহ করে',
      'telugu': 'దయచేసి',
      'marathi': 'कृपया',
      'gujarati': 'કૃપા કરીને',
      'kannada': 'ದಯವಿಟ್ಟು',
      'malayalam': 'ദയവായി',
      'punjabi': 'ਕਿਰਪਾ ਕਰਕੇ',
    },
    'yes': {
      'hindi': 'हाँ',
      'tamil': 'ஆம்',
      'bengali': 'হ্যাঁ',
      'telugu': 'అవును',
      'marathi': 'होय',
      'gujarati': 'હા',
      'kannada': 'ಹೌದು',
      'malayalam': 'ഉണ്ട്',
      'punjabi': 'ਹਾਂ',
    },
    'no': {
      'hindi': 'नहीं',
      'tamil': 'இல்லை',
      'bengali': 'না',
      'telugu': 'కాదు',
      'marathi': 'नाही',
      'gujarati': 'ના',
      'kannada': 'ಇಲ್ಲ',
      'malayalam': 'ഇല്ല',
      'punjabi': 'ਨਹੀਂ',
    },
    'sorry': {
      'hindi': 'क्षमा करें',
      'tamil': 'மன்னிக்கவும்',
      'bengali': 'দুঃখিত',
      'telugu': 'క్షమించండి',
      'marathi': 'माफ करा',
      'gujarati': 'માફ કરશો',
      'kannada': 'ಕ್ಷಮಿಸಿ',
      'malayalam': 'ക്ഷമിക്കണം',
      'punjabi': 'ਮਾਫ਼ ਕਰਨਾ',
    },
    'help': {
      'hindi': 'मदद',
      'tamil': 'உதவி',
      'bengali': 'সাহায্য',
      'telugu': 'సహాయం',
      'marathi': 'मदत',
      'gujarati': 'મદદ',
      'kannada': 'ಸಹಾಯ',
      'malayalam': 'സഹായം',
      'punjabi': 'ਮਦਦ',
    },
  };

  const lowerText = text.toLowerCase().trim();
  
  // Check if we have a direct translation
  for (const [phrase, translations] of Object.entries(phraseDictionary)) {
    if (lowerText.includes(phrase) && translations[to]) {
      return translations[to];
    }
  }

  // Fallback: Use placeholder format
  return `[${to.toUpperCase()} Translation] ${text}`;
}

/**
 * Bhashini API - Text to Speech (TTS)
 */
export async function textToSpeech(text: string, language: string) {
  const mockData = {
    audio_url: '', // Empty - will use Web Speech API fallback
  };

  return apiCall<{ audio_url: string }>(
    '/bhashini/tts',
    {
      method: 'POST',
      body: JSON.stringify({
        text,
        language,
      }),
    },
    mockData
  );
}

/**
 * Bhashini API - OCR
 */
export async function extractTextFromImage(imageFile: File, targetLanguage: string) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('target_language', targetLanguage);

  const mockData = {
    original_text: 'Sample text extracted from image. Connect backend for real OCR.',
    translated_text: `[${targetLanguage.toUpperCase()}] Sample translated text from image.`,
    language: 'en',
  };

  return apiCall<{ 
    original_text: string;
    translated_text: string;
    language: string;
  }>(
    '/bhashini/ocr',
    {
      method: 'POST',
      body: formData,
      headers: {},
    },
    mockData
  );
}

/**
 * AI Chatbot API - Enhanced with context and intelligence
 */
export async function chatWithBot(
  message: string,
  conversationId?: string,
  language?: string,
  context?: string
) {
  // Smart mock responses based on keywords
  let smartReply = `Thank you for your message! I'm a mock assistant. Connect the Python backend for real AI responses.`;
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/food|restaurant|eat|cuisine/)) {
    smartReply = "🍽️ I'd recommend trying local Indian cuisine! Some popular dishes include Biryani, Butter Chicken, Dosa, and Paneer Tikka. Would you like me to find restaurants near your location?";
  } else if (lowerMessage.match(/hotel|stay|accommodation|booking/)) {
    smartReply = "🏨 I can help you find the perfect accommodation! What's your budget range and preferred location? I can search for hotels, hostels, or homestays based on your preferences.";
  } else if (lowerMessage.match(/attraction|visit|places|sightseeing|tour/)) {
    smartReply = "🗺️ India has amazing attractions! Popular destinations include the Taj Mahal, Jaipur's palaces, Kerala's backwaters, and Goa's beaches. What type of experiences are you interested in - historical, natural, or cultural?";
  } else if (lowerMessage.match(/emergency|help|sos|urgent/)) {
    smartReply = "🆘 I'm here to help! For emergencies, dial 112 (All India Emergency Number). I can also connect you with local police (100), ambulance (102), or fire services (101). What assistance do you need?";
  } else if (lowerMessage.match(/translate|language|speak/)) {
    smartReply = "🌐 I can help with translations! I support Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, and Punjabi. What would you like to translate?";
  } else if (lowerMessage.match(/weather|temperature|climate/)) {
    smartReply = "🌤️ I can check the weather for you! India has diverse climates - from tropical in the south to cold in the Himalayas. Which city would you like weather information for?";
  } else if (lowerMessage.match(/direction|how to reach|navigate|map/)) {
    smartReply = "🧭 I can help you navigate! Share your destination and I'll provide directions, estimated time, and transportation options including metro, bus, taxi, or walking routes.";
  } else if (lowerMessage.match(/culture|festival|tradition|custom/)) {
    smartReply = "🎉 India has rich cultural diversity! Major festivals include Diwali, Holi, Eid, Christmas, and regional celebrations. Would you like to know about cultural etiquette or upcoming events?";
  } else if (lowerMessage.match(/price|cost|budget|cheap|expensive/)) {
    smartReply = "💰 I can help with budget planning! India offers options for all budgets. Daily costs can range from ₹1000 (budget) to ₹10000+ (luxury). What would you like to know about pricing?";
  }

  const mockData = {
    reply: smartReply,
    conversation_id: conversationId || `conv_${Date.now()}`,
    intent: 'general',
    confidence: 0.85,
    suggestions: ['Tell me more', 'Show on map', 'Call me'],
  };

  return apiCall<{
    reply: string;
    conversation_id: string;
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  }>(
    '/chat/message',
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        language: language || 'en',
        context: context,
      }),
    },
    mockData
  );
}

/**
 * Twilio Voice Call Request
 * Request a callback from the AI assistant
 */
export async function requestVoiceCall(
  phoneNumber: string,
  language: string,
  conversationContext?: string
) {
  const mockData = {
    call_id: `call_${Date.now()}`,
    status: 'initiated',
  };

  return apiCall<{
    call_id: string;
    status: string;
  }>(
    '/twilio/request-call',
    {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber,
        language,
        context: conversationContext,
      }),
    },
    mockData
  );
}

/**
 * Trip Planner API
 */
export async function generateItinerary(
  destination: string,
  budget: number,
  duration: number,
  preferences: string[]
) {
  const mockData = {
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Exploration',
        activities: [
          { time: '10:00 AM', title: `Arrive in ${destination}`, description: 'Hotel check-in' },
          { time: '2:00 PM', title: 'Local sightseeing', description: 'Explore nearby attractions' },
        ],
      },
    ],
    summary: `${duration}-day trip to ${destination} with budget ₹${budget}. Connect backend for AI-powered itinerary.`,
  };

  return apiCall<{
    itinerary: any[];
    summary: string;
  }>(
    '/trip/plan',
    {
      method: 'POST',
      body: JSON.stringify({
        destination,
        budget,
        duration,
        preferences,
      }),
    },
    mockData
  );
}

/**
 * Document Translation API
 */
export async function translateDocument(
  file: File,
  targetLanguage: string
) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('target_language', targetLanguage);

  const mockData = {
    translated_url: '#',
    original_url: '#',
  };

  return apiCall<{
    translated_url: string;
    original_url: string;
  }>(
    '/document/translate',
    {
      method: 'POST',
      body: formData,
      headers: {},
    },
    mockData
  );
}

/**
 * Culture & Events API
 */
export async function getCulturalContent(region?: string) {
  const query = region ? `?region=${region}` : '';
  
  const mockData = {
    festivals: [
      { name: 'Diwali', date: 'October-November', description: 'Festival of Lights' },
      { name: 'Holi', date: 'March', description: 'Festival of Colors' },
    ],
    etiquette: [
      { title: 'Greeting', description: 'Use "Namaste" with folded hands' },
      { title: 'Shoes', description: 'Remove shoes before entering homes and temples' },
    ],
  };

  return apiCall<{
    festivals: any[];
    etiquette: any[];
  }>(
    `/culture/content${query}`,
    {
      method: 'GET',
    },
    mockData
  );
}

/**
 * Emergency SOS API
 */
export async function sendEmergencySOS(
  location: { lat: number; lng: number },
  language: string
) {
  const mockData = {
    call_id: `sos_${Date.now()}`,
    emergency_number: '112',
  };

  return apiCall<{
    call_id: string;
    emergency_number: string;
  }>(
    '/emergency/sos',
    {
      method: 'POST',
      body: JSON.stringify({
        location,
        language,
      }),
    },
    mockData
  );
}

/**
 * Gamification API
 */
export async function getUserStats() {
  const mockData = {
    xp: 2450,
    level: 5,
    badges: [
      { id: 'first_translation', name: 'First Translation', icon: '🎯' },
      { id: 'explorer', name: 'Explorer', icon: '🗺️' },
    ],
    rank: 42,
  };

  return apiCall<{
    xp: number;
    level: number;
    badges: any[];
    rank: number;
  }>(
    '/gamification/stats',
    {
      method: 'GET',
    },
    mockData
  );
}

export async function getLeaderboard(limit = 10) {
  const mockData = {
    users: [
      { name: 'Traveler_123', xp: 5000, level: 8 },
      { name: 'Explorer_456', xp: 4500, level: 7 },
      { name: 'You', xp: 2450, level: 5 },
    ],
  };

  return apiCall<{
    users: any[];
  }>(
    `/gamification/leaderboard?limit=${limit}`,
    {
      method: 'GET',
    },
    mockData
  );
}

/**
 * AI Chat - Get Conversation History
 */
export async function getConversationHistory(conversationId: string) {
  const mockData = {
    messages: [
      { role: 'bot', content: 'Hello! How can I help you?', timestamp: Date.now() - 60000 },
      { role: 'user', content: 'Tell me about the Taj Mahal', timestamp: Date.now() - 30000 },
    ],
    conversation_id: conversationId,
  };

  return apiCall<{
    messages: any[];
    conversation_id: string;
  }>(
    `/chat/history/${conversationId}`,
    {
      method: 'GET',
    },
    mockData
  );
}

/**
 * AI Chat - Analyze Intent
 */
export async function analyzeIntent(message: string, language: string = 'en') {
  const mockData = {
    intent: 'travel_recommendation',
    entities: [
      { type: 'location', value: 'India', confidence: 0.9 },
      { type: 'activity', value: 'sightseeing', confidence: 0.85 },
    ],
    sentiment: 'positive',
    confidence: 0.87,
  };

  return apiCall<{
    intent: string;
    entities: any[];
    sentiment: string;
    confidence: number;
  }>(
    '/chat/analyze-intent',
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        language,
      }),
    },
    mockData
  );
}

/**
 * AI Chat - Get Smart Suggestions
 */
export async function getSmartSuggestions(
  conversationId: string,
  currentContext?: string
) {
  const mockData = {
    suggestions: [
      { text: 'Show me on map', type: 'action', icon: '🗺️' },
      { text: 'More details', type: 'info', icon: 'ℹ️' },
      { text: 'Book now', type: 'action', icon: '📅' },
      { text: 'Similar places', type: 'recommendation', icon: '✨' },
    ],
  };

  return apiCall<{
    suggestions: Array<{
      text: string;
      type: string;
      icon: string;
    }>;
  }>(
    '/chat/suggestions',
    {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        context: currentContext,
      }),
    },
    mockData
  );
}

/**
 * AI Chat - Get Contextual Recommendations
 */
export async function getContextualRecommendations(
  query: string,
  location?: { lat: number; lng: number },
  preferences?: string[]
) {
  const mockData = {
    recommendations: [
      {
        id: '1',
        title: 'Red Fort',
        type: 'attraction',
        description: 'Historic Mughal fortress in Delhi',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
        rating: 4.5,
        distance: '2.3 km',
        price: '₹50',
      },
      {
        id: '2',
        title: 'Spice Market Restaurant',
        type: 'restaurant',
        description: 'Authentic North Indian cuisine',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        rating: 4.7,
        distance: '0.8 km',
        price: '₹₹',
      },
    ],
  };

  return apiCall<{
    recommendations: any[];
  }>(
    '/chat/recommendations',
    {
      method: 'POST',
      body: JSON.stringify({
        query,
        location,
        preferences,
      }),
    },
    mockData
  );
}

/**
 * AI Chat - Save User Feedback
 */
export async function saveChatFeedback(
  messageId: string,
  conversationId: string,
  feedback: 'positive' | 'negative',
  comment?: string
) {
  const mockData = {
    success: true,
    message: 'Feedback saved successfully',
  };

  return apiCall<{
    success: boolean;
    message: string;
  }>(
    '/chat/feedback',
    {
      method: 'POST',
      body: JSON.stringify({
        message_id: messageId,
        conversation_id: conversationId,
        feedback,
        comment,
      }),
    },
    mockData
  );
}

/**
 * AI Chat - Get Location-Based Context
 */
export async function getLocationContext(
  latitude: number,
  longitude: number,
  language: string = 'en'
) {
  const mockData = {
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      timezone: 'Asia/Kolkata',
    },
    nearby: {
      attractions: 5,
      restaurants: 12,
      hotels: 8,
    },
    weather: {
      temperature: 28,
      condition: 'Sunny',
      humidity: 45,
    },
    tips: [
      'Best time to visit is early morning',
      'Dress modestly when visiting temples',
      'Bargaining is common in local markets',
    ],
  };

  return apiCall<{
    location: any;
    nearby: any;
    weather: any;
    tips: string[];
  }>(
    '/chat/location-context',
    {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        language,
      }),
    },
    mockData
  );
}
