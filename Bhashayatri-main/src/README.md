# 🗺️ BhashaYatri

> **Your Multilingual Tourism Companion**

A comprehensive multilingual tourism application integrating Bhashini's language APIs for translation, speech recognition, text-to-speech, and OCR capabilities. Experience India without language barriers!

[![Status](https://img.shields.io/badge/status-production%20ready-green)]()
[![Languages](https://img.shields.io/badge/languages-10+-blue)]()
[![Modules](https://img.shields.io/badge/modules-17-orange)]()
[![PWA](https://img.shields.io/badge/PWA-ready-purple)]()

---

## 🎯 Quick Start

### **Login Credentials**
**Email**: `demo@bhashayatri.com`  
**Password**: `demo123`

*Pre-filled on the login page - just click "Login"!*

### **Try It Now**
1. Open the app
2. Click "Login" (credentials already filled)
3. Explore 17 modules with full functionality!

---

## ✨ Key Features

🌍 **Location Services** - Real-time GPS tracking & nearby recommendations  
🗣️ **Live Speech Translator** - 10+ Indian languages with audio  
📝 **Text Translator** - Instant translation with TTS playback  
📸 **OCR Scanner** - Extract text from images & translate  
🤖 **AI Chatbot** - Travel assistant with multilingual support  
✈️ **Trip Planner** - AI-generated itineraries with budget  
📞 **Voice Call Assistance** - Real-time phone call translation  
👤 **Talking Avatar** - Interactive 3D avatar with lip-sync  
🌐 **Website Translator** - Translate entire web pages  
🎤 **Text-to-Speech** - Natural voice synthesis with customization  
🆘 **Emergency SOS** - Quick help in any language  
📱 **Tourist Helpline** - State-wise helpline directory  
🎮 **Gamification** - XP, levels, badges, leaderboard  
🎭 **Cultural Insights** - State-specific traditions & customs  
📄 **Document Translator** - Upload & translate PDFs, Word files  
📴 **Offline Mode** - Works without internet  
👤 **Profile & Settings** - Account management & preferences  

---

## 🏗️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Tailwind CSS v4.0
- Motion (Framer Motion)
- ShadCN UI components
- Lucide React icons

**APIs & Integrations**
- Bhashini API (translation, TTS, STT, OCR)
- Geolocation API (GPS tracking)
- MediaRecorder API (audio)
- Web Speech API (fallback TTS)
- Twilio (voice calls - ready)

**Backend** (Python - Integration Ready)
- RESTful API architecture
- JWT authentication
- Bhashini SDK
- PostgreSQL database

---

## 📂 Project Structure

```
/
├── App.tsx                    # Main application
├── config.ts                  # Configuration
├── contexts/
│   └── AuthContext.tsx        # Authentication state
├── components/
│   ├── Navigation.tsx         # Sidebar navigation
│   ├── pages/                 # 17 feature modules
│   └── ui/                    # ShadCN components
├── utils/
│   ├── api.ts                 # API client
│   ├── location.ts            # GPS utilities
│   ├── notifications.ts       # Toasts
│   └── offline.ts             # Offline storage
└── styles/
    └── globals.css            # Global styles
```

---

## 🚀 Installation

### **Prerequisites**
- Node.js 16+
- Modern browser (Chrome, Firefox, Safari)
- Microphone permission for speech features
- GPS permission for location features

### **Setup**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:5173
```

### **Backend Integration** (Optional)

To connect Python backend, edit `/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  BHASHINI_KEY: 'your-api-key'
};
```

The app works perfectly in **demo mode** without backend!

---

## 📖 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature list with details
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & tech specs
- **[WORKFLOW.md](./WORKFLOW.md)** - User workflows & integration guide

---

## 🌐 Supported Languages

1. **English**
2. **Hindi** (हिन्दी)
3. **Tamil** (தமிழ்)
4. **Bengali** (বাংলা)
5. **Telugu** (తెలుగు)
6. **Marathi** (मराठी)
7. **Gujarati** (ગુજરાતી)
8. **Kannada** (ಕನ್ನಡ)
9. **Malayalam** (മലയാളം)
10. **Punjabi** (ਪੰਜਾਬੀ)

---

## 🎨 Design System

### **Color Palette** (Indian Flag Inspired)
- **Saffron** `#FF9933` - Primary actions
- **White** `#FFFFFF` - Background
- **Green** `#138808` - Success states
- **Navy** `#000080` - Text/headings

### **UI Features**
- ✅ Glassmorphism effects
- ✅ Gradient overlays
- ✅ Motion animations
- ✅ Fully responsive (mobile-first)
- ✅ Dark mode ready
- ✅ PWA installable

---

## 🔐 Authentication

### **Signup Flow**
1. Click "Create New Account"
2. Fill details (name, email, phone, password)
3. Capture GPS location
4. Auto-login after signup

### **Login Flow**
1. Use demo credentials (pre-filled)
2. Or create custom account
3. Session persists across refreshes
4. JWT token-based authentication

### **Security**
- Bcrypt password hashing (backend)
- JWT tokens with expiration
- HTTPS in production
- Location privacy controls

---

## 📱 PWA Features

- ✅ **Offline Mode** - Works without internet
- ✅ **Install Prompt** - Add to home screen
- ✅ **Push Notifications** - Alerts & reminders
- ✅ **Background Sync** - Auto-upload when online
- ✅ **Responsive** - Adapts to all screen sizes

---

## 🎮 Gamification

### **XP System**
- Translation: **10 XP**
- OCR Scan: **15 XP**
- Trip Created: **50 XP**
- Daily Login: **25 XP**
- Level Up: Every **1000 XP**

### **Badges**
- **Common** (0-99 actions)
- **Rare** (100-499)
- **Epic** (500-999)
- **Legendary** (1000+)

### **Leaderboard**
- Global rankings
- Weekly/monthly top users
- Achievement showcase

---

## 🔌 API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/translate/text
POST   /api/translate/speech
POST   /api/tts/synthesize
POST   /api/ocr/extract
POST   /api/trip/generate
POST   /api/location/nearby
GET    /api/gamification/leaderboard
POST   /api/gamification/xp
GET    /api/user/profile
PUT    /api/user/profile
```

**Fallback**: Mock data when backend unavailable

---

## 🐛 Troubleshooting

### **Login Issues**
```javascript
// Clear storage and reload
localStorage.clear();
location.reload();
```

### **Location Not Working**
1. Click 🔒 in address bar
2. Allow location permission
3. Or use manual entry

### **Audio Not Playing**
1. Check browser audio permissions
2. Unmute system volume
3. Click page first (user gesture required)

### **Console Debugging**
Press **F12** to open developer console and check logs

---

## 📊 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Bhashini** - Language APIs
- **ShadCN** - UI components
- **Unsplash** - Stock images
- **Lucide** - Icon library

---

## 📞 Support

**Email**: demo@bhashayatri.com  
**GitHub**: [Report Issues](https://github.com/your-repo/issues)

---

## 🗺️ Roadmap

- [ ] Real-time collaboration for trips
- [ ] Social features (share trips, reviews)
- [ ] Augmented Reality translation
- [ ] Wearable device integration
- [ ] Premium subscription tier
- [ ] Multi-platform apps (iOS, Android)

---

**Made with ❤️ in India | Powered by Bhashini AI**

**Login**: demo@bhashayatri.com / demo123
