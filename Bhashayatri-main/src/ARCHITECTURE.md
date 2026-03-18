# BhashaYatri Architecture

## 📐 System Architecture

### **Tech Stack**

#### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4.0** for styling
- **Motion (Framer Motion)** for animations
- **Lucide React** for icons
- **Recharts** for data visualization
- **ShadCN UI** components library

#### State Management
- **React Context API** for global state
- **localStorage** for persistence
- **Custom hooks** for logic reuse

#### APIs & Services
- **Bhashini API** (translation, TTS, STT, OCR)
- **Geolocation API** for GPS
- **MediaRecorder API** for audio
- **Web Speech API** for TTS fallback
- **Twilio** for voice calls (integration ready)

#### Backend (Python - Integration Ready)
- **RESTful API** architecture
- **JWT authentication**
- **Bhashini SDK** integration
- **PostgreSQL** database (planned)

---

## 🏗️ Project Structure

```
/
├── App.tsx                 # Main app component
├── config.ts               # Configuration & constants
├── contexts/
│   └── AuthContext.tsx     # Authentication state
├── components/
│   ├── Navigation.tsx      # Sidebar navigation
│   ├── AvatarAssistant.tsx # Floating AI assistant
│   ├── WelcomeBanner.tsx   # Welcome message
│   ├── pages/              # 17 feature modules
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LocationPage.tsx
│   │   ├── LiveTranslatorPage.tsx
│   │   ├── TextTranslatorPage.tsx
│   │   ├── OCRPage.tsx
│   │   ├── ChatbotPage.tsx
│   │   ├── TripPlannerPage.tsx
│   │   ├── VoiceCallPage.tsx
│   │   ├── AvatarPage.tsx
│   │   ├── WebsiteTranslatorPage.tsx
│   │   ├── TTSPage.tsx
│   │   ├── CulturePage.tsx
│   │   ├── DocumentPage.tsx
│   │   ├── EmergencyPage.tsx
│   │   ├── HelplinePage.tsx
│   │   ├── GamificationPage.tsx
│   │   ├── OfflinePage.tsx
│   │   └── ProfilePage.tsx
│   └── ui/                 # ShadCN components
├── utils/
│   ├── api.ts              # API integration
│   ├── location.ts         # GPS utilities
│   ├── notifications.ts    # Toast notifications
│   └── offline.ts          # Offline storage
└── styles/
    └── globals.css         # Global styles & tokens
```

---

## 🔐 Authentication System

### **AuthContext Provider**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  joinedDate: string;
  preferences: {
    language: string;
    notifications: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
}
```

### **Authentication Flow**

1. **Signup**:
   - Capture user details (name, email, phone, password)
   - Request GPS location permission
   - Store location data with account
   - Auto-login after signup
   - Backend: `POST /api/auth/signup`

2. **Login**:
   - Validate credentials
   - Retrieve user data
   - Store JWT token
   - Set user in context
   - Backend: `POST /api/auth/login`

3. **Logout**:
   - Clear user state
   - Remove JWT token
   - Redirect to login

4. **Persistence**:
   - Store user in localStorage
   - Auto-restore on app load
   - Token-based sessions

### **Protected Routes**
- All feature pages require authentication
- Redirect to login if not authenticated
- Auto-redirect to dashboard after login

---

## 🗺️ Location Services

### **GPS Integration**

```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  city?: string;
  state?: string;
  country?: string;
}

async function getCurrentLocation(): Promise<LocationData> {
  // Request permission
  const permission = await navigator.permissions.query({ name: 'geolocation' });
  
  // Get coordinates
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
  
  // Reverse geocoding (backend API)
  const address = await fetch('/api/location/reverse', {
    method: 'POST',
    body: JSON.stringify({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    })
  });
  
  return { ...position.coords, ...address };
}
```

### **Fallback System**
- Manual location entry if GPS denied
- Cached location from signup
- Default to major cities
- Error handling with user guidance

---

## 🔊 Audio System

### **Text-to-Speech**

```typescript
interface TTSOptions {
  text: string;
  language: string;
  voice?: 'male' | 'female';
  speed?: number;     // 0.5 - 2.0
  pitch?: number;     // 0.5 - 2.0
}

async function synthesizeSpeech(options: TTSOptions) {
  // Primary: Bhashini API
  const response = await fetch('/api/tts/synthesize', {
    method: 'POST',
    body: JSON.stringify(options)
  });
  
  if (response.ok) {
    const audioBlob = await response.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  } else {
    // Fallback: Web Speech API
    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = options.language;
    utterance.rate = options.speed || 1.0;
    utterance.pitch = options.pitch || 1.0;
    speechSynthesis.speak(utterance);
  }
}
```

### **Speech-to-Text**

```typescript
async function recordAudio(): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      resolve(blob);
    };
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
  });
}

async function transcribeAudio(audioBlob: Blob, language: string) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('language', language);
  
  const response = await fetch('/api/translate/speech', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

---

## 🌐 API Integration

### **Configuration**

```typescript
// config.ts
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:8000',
  BHASHINI_KEY: process.env.BHASHINI_API_KEY,
  TWILIO_SID: process.env.TWILIO_ACCOUNT_SID,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  // ... more languages
];
```

### **API Client**

```typescript
// utils/api.ts
class APIClient {
  private baseURL: string;
  private token: string | null;
  
  async request(endpoint: string, options: RequestInit) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        timeout: API_CONFIG.TIMEOUT
      });
      
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      // Fallback to mock data
      return this.getMockData(endpoint);
    }
  }
  
  // Translation
  async translate(text: string, from: string, to: string) {
    return this.request('/api/translate/text', {
      method: 'POST',
      body: JSON.stringify({ text, from, to })
    });
  }
  
  // OCR
  async extractText(image: File, language: string) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('language', language);
    
    return this.request('/api/ocr/extract', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type for FormData
    });
  }
  
  // More methods...
}

export const api = new APIClient();
```

---

## 💾 Data Storage

### **localStorage Schema**

```typescript
// Authentication
'bhashayatri_user': User
'bhashayatri_token': string
'bhashayatri_users': User[] // Demo users

// Gamification
'bhashayatri_xp': number
'bhashayatri_level': number
'bhashayatri_badges': Badge[]

// Saved Content
'bhashayatri_translations': Translation[]
'bhashayatri_trips': Trip[]
'bhashayatri_offline_phrases': Phrase[]
'bhashayatri_scan_history': OCRResult[]

// Settings
'bhashayatri_preferences': UserPreferences
'bhashayatri_language': string
```

### **Offline Support**

```typescript
// utils/offline.ts
export function saveOfflineData(key: string, data: any) {
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({ ...data, timestamp: Date.now(), synced: false });
  localStorage.setItem(key, JSON.stringify(existing));
}

export async function syncOfflineData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('bhashayatri_offline_'));
  
  for (const key of keys) {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const unsynced = data.filter((item: any) => !item.synced);
    
    for (const item of unsynced) {
      try {
        await api.request('/api/sync', {
          method: 'POST',
          body: JSON.stringify(item)
        });
        item.synced = true;
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
    
    localStorage.setItem(key, JSON.stringify(data));
  }
}
```

---

## 🎮 Gamification Logic

### **XP Calculation**

```typescript
const XP_REWARDS = {
  TRANSLATION: 10,
  OCR_SCAN: 15,
  TRIP_CREATED: 50,
  DAILY_LOGIN: 25,
  BADGE_EARNED: 100,
  QUEST_COMPLETED: 75
};

function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1; // Level up every 1000 XP
}

function addXP(amount: number) {
  const currentXP = parseInt(localStorage.getItem('bhashayatri_xp') || '0');
  const newXP = currentXP + amount;
  const newLevel = calculateLevel(newXP);
  
  localStorage.setItem('bhashayatri_xp', newXP.toString());
  localStorage.setItem('bhashayatri_level', newLevel.toString());
  
  if (newLevel > calculateLevel(currentXP)) {
    toast.success(`Level Up! You're now Level ${newLevel}! 🎉`);
  }
}
```

---

## 🔄 State Management Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Request (with fallback)
    ↓
Update Local State
    ↓
Update Context (if global)
    ↓
Persist to localStorage
    ↓
Re-render UI
    ↓
Show Notification
    ↓
Add XP (if applicable)
```

---

## 🚀 Backend Integration Points

### **Required Python Endpoints**

```python
# Authentication
POST /api/auth/signup       # Create user account
POST /api/auth/login        # Login with credentials
POST /api/auth/refresh      # Refresh JWT token

# Translation
POST /api/translate/text    # Text translation
POST /api/translate/speech  # Audio transcription & translation

# TTS
POST /api/tts/synthesize    # Generate speech from text

# OCR
POST /api/ocr/extract       # Extract text from image

# Location
POST /api/location/reverse  # Reverse geocoding
GET  /api/location/nearby   # Nearby places

# Trip Planning
POST /api/trip/generate     # AI trip generation

# Gamification
POST /api/gamification/xp   # Update XP
GET  /api/gamification/leaderboard  # Get rankings

# User
GET  /api/user/profile      # Get user data
PUT  /api/user/profile      # Update user data
```

---

## 📱 Responsive Design

### **Breakpoints**
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### **Adaptive Layout**
- Mobile: Single column, bottom navigation
- Desktop: Sidebar navigation, multi-column
- Touch-friendly buttons on mobile
- Optimized font sizes and spacing

---

**Login**: demo@bhashayatri.com / demo123
