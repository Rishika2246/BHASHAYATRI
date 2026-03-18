# BhashaYatri Workflow Guide

## 🚀 Quick Start (3 Steps)

1. **Open the app** → Login page appears
2. **See pre-filled credentials**: `demo@bhashayatri.com` / `demo123`
3. **Click "Login"** → Dashboard loads!

---

## 📖 User Journey

### **1. First Time User (Signup)**

```
Open App
  ↓
Click "Create New Account"
  ↓
Fill Details (Name, Email, Phone, Password)
  ↓
Click "Capture Current Location" → Allow GPS
  ↓
Location Added (City, State, Country)
  ↓
Click "Create Account"
  ↓
Auto-Login → Redirect to Dashboard
```

**What Gets Captured**:
- Name, email, phone, password
- GPS coordinates (latitude, longitude)
- City, state, country (reverse geocoded)
- Account creation timestamp
- Default preferences (language: English, notifications: on)

---

### **2. Returning User (Login)**

```
Open App
  ↓
See Pre-filled Demo Credentials
  ↓
Click "Login"
  ↓
Backend validates OR fallback to localStorage
  ↓
User object loaded into AuthContext
  ↓
Redirect to Dashboard
  ↓
Welcome Banner appears
```

**Console Output**:
```
✅ Demo user created! Email: demo@bhashayatri.com
🔐 Login attempt: demo@bhashayatri.com
✅ Local login successful: demo@bhashayatri.com
🚀 Login complete, redirecting to dashboard...
✅ USER IS AUTHENTICATED - SHOWING DASHBOARD
```

---

### **3. Dashboard Navigation**

```
Dashboard (Home)
  ↓
Choose Module from Navigation
  ↓
Module Loads with Feature
  ↓
Interact with Feature
  ↓
XP Added (if applicable)
  ↓
Return to Dashboard OR Go to Next Module
```

**Navigation Structure**:
- **Sidebar** (Desktop): Persistent left sidebar
- **Bottom Nav** (Mobile): Fixed bottom navigation
- **Breadcrumbs**: Show current location
- **Back Button**: Return to previous page

---

## 🎯 Feature Workflows

### **Location Services**

```
Click "Location Services"
  ↓
Request GPS Permission
  ↓
If Allowed:
  - Get coordinates
  - Reverse geocode to address
  - Display on map
  - Show nearby places
  ↓
If Denied:
  - Show manual entry form
  - User enters city/state
  - Use cached location
  ↓
Filter Nearby Places (Restaurants, Hotels, etc.)
  ↓
Click Place → Show Details
```

---

### **Live Speech Translator**

```
Select Source Language (e.g., English)
  ↓
Select Target Language (e.g., Hindi)
  ↓
Click "Start Recording"
  ↓
Speak into microphone (5 seconds)
  ↓
Recording stops automatically
  ↓
Audio sent to Bhashini API
  ↓
Transcription displayed (Source text)
  ↓
Translation displayed (Target text)
  ↓
Auto-play TTS of translation
  ↓
Save to conversation history
  ↓
+10 XP added
```

**Fallback**: If API fails, uses Web Speech API for TTS

---

### **Text Translator**

```
Type or paste text
  ↓
Select source & target languages
  ↓
Click "Translate"
  ↓
API call to /api/translate/text
  ↓
Display translation
  ↓
Click "Listen" → TTS playback
  ↓
Click "Save" → Add to favorites
  ↓
+10 XP added
```

---

### **OCR Scanner**

```
Click "Scan Image" or "Upload File"
  ↓
Camera opens OR file picker
  ↓
Take photo / Select image
  ↓
Preview image
  ↓
Select OCR language
  ↓
Click "Extract Text"
  ↓
API call to /api/ocr/extract
  ↓
Extracted text displayed
  ↓
Select target language
  ↓
Click "Translate"
  ↓
Translation displayed
  ↓
Save to scan history
  ↓
+15 XP added
```

---

### **AI Chatbot**

```
Type message in chat input
  ↓
Click "Send" or press Enter
  ↓
Message sent to /api/chatbot
  ↓
AI response received
  ↓
Display in chat interface
  ↓
Click "Listen" → TTS of response
  ↓
Conversation saved in localStorage
```

**Features**:
- Context-aware responses
- Travel tips and recommendations
- Multilingual support
- Emergency phrase suggestions

---

### **Trip Planner**

```
Enter destination
  ↓
Select trip duration (days)
  ↓
Choose preferences (budget, interests)
  ↓
Click "Generate Itinerary"
  ↓
API call to /api/trip/generate
  ↓
AI creates day-by-day plan
  ↓
Display itinerary with:
  - Activities per day
  - Estimated costs
  - Timings
  - Travel tips
  ↓
Download as PDF
  ↓
+50 XP added
```

---

### **Voice Call Assistance**

```
Select scenario (Restaurant, Hotel, Emergency)
  ↓
Choose languages (Your language ↔ Local language)
  ↓
Click "Start Call"
  ↓
Simulated call interface appears
  ↓
Speak into microphone
  ↓
Real-time transcription
  ↓
Auto-translation
  ↓
TTS playback in target language
  ↓
Other person speaks
  ↓
Reverse translation back to you
  ↓
End call → Save transcript
```

**Integration**: Ready for Twilio API for real phone calls

---

### **Talking Avatar**

```
Click "Talk to Avatar"
  ↓
3D avatar appears
  ↓
Type message or use speech
  ↓
Avatar responds with:
  - Lip-sync animation
  - TTS voice output
  - Contextual gestures
  ↓
Multilingual conversation
  ↓
Emotion detection from text
```

---

### **Website Translator**

```
Enter website URL
  ↓
Select target language
  ↓
Click "Translate Website"
  ↓
Fetch website content
  ↓
Extract text elements
  ↓
Translate via API
  ↓
Display translated preview
  ↓
Option to open in new tab
```

---

### **Text-to-Speech Module**

```
Enter text (or paste)
  ↓
Select language
  ↓
Customize voice:
  - Gender (Male/Female)
  - Speed (0.5x - 2.0x)
  - Pitch (0.5 - 2.0)
  ↓
Click "Generate Speech"
  ↓
API call to /api/tts/synthesize
  ↓
Audio plays automatically
  ↓
Download as MP3 (optional)
  ↓
Save to library
```

---

### **Emergency SOS**

```
Emergency situation occurs
  ↓
Open app → Click "Emergency SOS"
  ↓
One-tap alert button
  ↓
Auto-captures GPS location
  ↓
Sends alert to emergency contacts
  ↓
Displays emergency phrases in local language
  ↓
Quick call to helpline numbers
  ↓
Share location via SMS/WhatsApp
```

---

### **Gamification**

```
Complete any action (translate, scan, trip)
  ↓
XP added automatically
  ↓
Progress bar updates
  ↓
Check if level up (every 1000 XP)
  ↓
If level up → Show celebration toast
  ↓
Check if badge earned
  ↓
Update leaderboard ranking
  ↓
View achievements in Gamification page
```

**Tracking**:
- Translations: 10 XP each
- OCR scans: 15 XP each
- Trips created: 50 XP each
- Daily login: 25 XP bonus
- Badges earned: 100 XP bonus

---

## 🔄 Backend Integration Workflow

### **When Backend is Available**

```
Frontend Action
  ↓
API Request to Python Backend
  ↓
Backend processes with Bhashini SDK
  ↓
Response returned
  ↓
Frontend displays result
  ↓
Update UI & localStorage
```

### **When Backend is Unavailable (Demo Mode)**

```
Frontend Action
  ↓
API Request fails (network error)
  ↓
Catch error in API client
  ↓
Return mock/sample data
  ↓
Display in UI with "(Demo)" indicator
  ↓
Full functionality maintained
```

---

## 🐛 Troubleshooting Workflow

### **Login Issues**

**Problem**: Login button doesn't work

**Solution Steps**:
1. Open Console (F12)
2. Look for: `✅ Local login successful`
3. If not found, clear storage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. Try again with demo credentials

---

### **Location Permission**

**Problem**: GPS not working

**Solution Steps**:
1. Browser blocks location by default
2. Click 🔒 icon in address bar
3. Change Location to "Allow"
4. Reload page
5. Or use manual location entry

---

### **Audio Not Playing**

**Problem**: TTS audio doesn't play

**Solution Steps**:
1. Check browser permissions for microphone/audio
2. Ensure volume is not muted
3. Try clicking page first (user gesture required)
4. Fallback to Web Speech API if Bhashini fails

---

### **API Errors**

**Problem**: Features not working

**Solution Steps**:
1. Check console for error messages
2. Verify backend is running (if applicable)
3. Demo mode activates automatically
4. Mock data ensures app still works
5. Check `/utils/api.ts` for fallback logic

---

## 📱 Mobile Usage

### **Install as PWA**

```
Open app in mobile browser
  ↓
Look for "Add to Home Screen" prompt
  ↓
Click "Install" or "Add"
  ↓
App icon appears on home screen
  ↓
Open like a native app
  ↓
Offline support enabled
```

### **Mobile-Specific Features**
- **Bottom Navigation**: Easy thumb access
- **Touch Gestures**: Swipe, pinch, zoom
- **Camera Integration**: Native camera for OCR
- **GPS**: More accurate than desktop
- **Push Notifications**: Trip reminders, alerts

---

## 🔐 Security Workflow

### **Password Security**
- Minimum 6 characters required
- Stored securely (backend hashes with bcrypt)
- Frontend never stores plain passwords
- JWT tokens for session management

### **Location Privacy**
- GPS permission explicitly requested
- User can deny and enter manually
- Location only used for recommendations
- Not shared with third parties
- Can be deleted from profile

### **Data Protection**
- All API calls use HTTPS (production)
- JWT tokens expire after 24 hours
- Sensitive data encrypted in transit
- localStorage cleared on logout

---

## 📊 Analytics & Monitoring (Future)

```
User Action
  ↓
Track Event (Google Analytics / Mixpanel)
  ↓
Send to Backend Analytics Service
  ↓
Generate Reports:
  - Most used features
  - User retention
  - Error rates
  - Performance metrics
```

---

## 🔄 Update & Sync Workflow

### **Offline → Online Sync**

```
User makes changes offline
  ↓
Data saved to localStorage with sync: false flag
  ↓
Internet connection restored
  ↓
Auto-sync triggered
  ↓
Upload all unsynced data to backend
  ↓
Mark as synced
  ↓
Show sync status in UI
```

---

**Login**: demo@bhashayatri.com / demo123

**Questions?** Check `/FEATURES.md` or `/ARCHITECTURE.md`
