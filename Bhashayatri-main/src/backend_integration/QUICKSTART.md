# 🚀 Quick Start - Connect Python Backend in 3 Steps

## Step 1: Install Python Dependencies

```bash
pip install flask flask-cors requests urllib3
```

## Step 2: Start the Backend Server

```bash
cd backend_integration
python bhashini_flask_server.py
```

You should see:
```
🚀 BhashaYatri Backend Server Starting...
📡 API Server: http://localhost:8000
✅ Ready to receive translation requests!
```

## Step 3: Update Frontend Configuration

Edit `/config.ts` and change:

```typescript
export const config = {
  apiBaseUrl: 'http://localhost:8000',  // ✅ Use this line
  // apiBaseUrl: '',  // ❌ Comment out this line
};
```

## ✅ Done! Test It Out

1. **Open BhashaYatri** in your browser
2. **Login** with demo credentials (pre-filled)
3. **Navigate to "Conversation Translator"** or "Text Translator"
4. **Type some text** and translate!

You should see in the Flask console:
```
📝 Translating: 'Hello' from english to hindi
✅ Translation successful: 'नमस्ते'
```

---

## 🎯 What's Integrated

✅ **30+ language pairs** with Bhashini API  
✅ **Real-time translation** with caching  
✅ **Automatic fallback** to demo mode if backend is down  
✅ **Smart mock translations** for common phrases  
✅ **CORS enabled** for cross-origin requests  
✅ **Health check endpoint** for monitoring  

---

## 🧪 Test the API Directly

### Test with cURL:
```bash
curl -X POST http://localhost:8000/bhashini/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning",
    "source_language": "english",
    "target_language": "hindi"
  }'
```

### Expected response:
```json
{
  "success": true,
  "translated_text": "सुप्रभात",
  "cached": false
}
```

---

## 🌐 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/bhashini/translate` | POST | Translate text |
| `/bhashini/languages` | GET | Get supported languages |
| `/bhashini/pairs` | GET | Get available translation pairs |
| `/bhashini/check-pair` | POST | Check if pair is supported |

---

## 🔧 Troubleshooting

### Backend not starting?
- Check Python version (3.7+)
- Verify all dependencies installed
- Check port 8000 is not in use

### Frontend not connecting?
- Verify backend is running at `http://localhost:8000`
- Check `/config.ts` has correct URL
- Look for CORS errors in browser console

### Translation failing?
- Check Flask console for error messages
- Verify language pair is supported (`/bhashini/pairs`)
- Test with cURL to isolate issue

---

## 📊 Supported Languages

**23 Indian Languages + English:**

- Assamese, Bengali, Bodo, Dogri
- English, Gujarati, Hindi, Kannada
- Kashmiri, Konkani, Maithili, Malayalam
- Manipuri, Marathi, Nepali, Odia
- Punjabi, Sanskrit, Santali, Sindhi
- Tamil, Telugu, Urdu

**30+ Translation Pairs Available!**

---

## 🎉 Next Steps

1. ✅ **Test all features** in the app
2. 📖 **Read full docs** in `README.md`
3. 🚀 **Deploy to production** (see deployment guide)
4. 🔐 **Add authentication** (JWT tokens)
5. 📊 **Monitor performance** (add logging)

---

**Need help?** Check `/backend_integration/README.md` for detailed docs!
