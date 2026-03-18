# Backend Integration Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install flask flask-cors requests urllib3
```

### 2. Run the Server

```bash
cd backend_integration
python bhashini_flask_server.py
```

Server will start at: **http://localhost:8000**

### 3. Update Frontend Config

Edit `/config.ts`:

```typescript
export const config = {
  apiBaseUrl: 'http://localhost:8000',  // ✅ Connect to Python backend
  // apiBaseUrl: '',  // ❌ Demo mode (no backend)
};
```

### 4. Test the Connection

Open BhashaYatri app → Navigate to **Text Translator** → Try translating text!

---

## 📡 API Endpoints

### **Health Check**
```bash
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "BhashaYatri Backend",
  "version": "1.0.0"
}
```

---

### **Translate Text**
```bash
POST http://localhost:8000/bhashini/translate
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "source_language": "english",
  "target_language": "hindi",
  "style": "casual"
}
```

**Response:**
```json
{
  "success": true,
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "cached": false
}
```

---

### **Get Supported Languages**
```bash
GET http://localhost:8000/bhashini/languages
```

**Response:**
```json
{
  "success": true,
  "languages": ["english", "hindi", "tamil", "bengali", ...]
}
```

---

### **Get Available Translation Pairs**
```bash
GET http://localhost:8000/bhashini/pairs
```

**Response:**
```json
{
  "success": true,
  "pairs": [
    {"source": "english", "target": "hindi", "pair": "english → hindi"},
    {"source": "hindi", "target": "english", "pair": "hindi → english"},
    ...
  ],
  "total": 30
}
```

---

### **Check if Translation Pair is Available**
```bash
POST http://localhost:8000/bhashini/check-pair
Content-Type: application/json

{
  "source_language": "english",
  "target_language": "tamil"
}
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "pair": "english → tamil"
}
```

---

## 🔧 Configuration

### **Change API Port**

Edit `bhashini_flask_server.py`:

```python
app.run(host='0.0.0.0', port=5000, debug=True)  # Change port here
```

Then update frontend `/config.ts`:

```typescript
export const config = {
  apiBaseUrl: 'http://localhost:5000',
};
```

---

### **Add More Language Models**

Edit the `mt_models` dictionary in `BhashiniMT` class:

```python
self.mt_models = {
    'en-hi': {
        'endpoint': 'YOUR_BHASHINI_ENDPOINT_URL',
        'token': 'YOUR_ACCESS_TOKEN'
    },
    # Add more pairs...
}
```

---

## 🧪 Testing

### **Using cURL**

```bash
# Test translation
curl -X POST http://localhost:8000/bhashini/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning",
    "source_language": "english",
    "target_language": "hindi"
  }'
```

### **Using Python**

```python
import requests

response = requests.post(
    'http://localhost:8000/bhashini/translate',
    json={
        'text': 'Thank you very much',
        'source_language': 'english',
        'target_language': 'tamil'
    }
)

print(response.json())
```

---

## 🌐 Supported Language Pairs

### **English ↔ Regional Languages**
- English ↔ Hindi
- English ↔ Tamil
- English ↔ Telugu
- English ↔ Bengali
- English ↔ Marathi
- English ↔ Kannada
- English ↔ Gujarati

### **Hindi ↔ Regional Languages**
- Hindi ↔ Tamil
- Hindi ↔ Telugu
- Hindi ↔ Marathi
- Hindi ↔ Gujarati
- Hindi ↔ Kannada
- Hindi ↔ Malayalam
- Hindi ↔ Punjabi
- Hindi ↔ Odia
- Hindi ↔ Urdu

### **Regional ↔ Regional**
- Tamil ↔ Telugu
- Tamil ↔ Bengali
- Marathi ↔ Gujarati

**Total: 30+ language pairs**

---

## 🐛 Troubleshooting

### **Issue: Connection Refused**

**Cause**: Backend server not running

**Solution**:
```bash
python bhashini_flask_server.py
```

---

### **Issue: CORS Error**

**Cause**: Frontend and backend on different domains

**Solution**: CORS is already enabled in Flask with `flask-cors`

---

### **Issue: Translation Failed**

**Possible causes**:
1. Invalid language pair → Check available pairs at `/bhashini/pairs`
2. Bhashini API down → Check endpoint status
3. Network timeout → Increase timeout in code

**Debug**:
- Check Flask console for error logs
- Test endpoint with cURL
- Verify API tokens are valid

---

### **Issue: Slow Translation**

**Solutions**:
1. **Enable caching** (already implemented)
2. **Use faster models** if available
3. **Deploy closer to Bhashini servers**

---

## 🚀 Production Deployment

### **Using Gunicorn**

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 bhashini_flask_server:app
```

### **Using Docker**

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY bhashini_flask_server.py .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "bhashini_flask_server:app"]
```

```bash
docker build -t bhashayatri-backend .
docker run -p 8000:8000 bhashayatri-backend
```

### **Environment Variables**

```bash
export FLASK_ENV=production
export PORT=8000
python bhashini_flask_server.py
```

---

## 📊 Performance Tips

1. **Caching**: Translations are cached automatically
2. **Connection pooling**: Already using `requests.Session()`
3. **Async processing**: Consider `aiohttp` for async requests
4. **Load balancing**: Use multiple worker processes

---

## 🔐 Security

1. **Never commit API tokens** to Git
2. **Use environment variables** for sensitive data
3. **Rate limiting**: Add Flask-Limiter for production
4. **HTTPS**: Use SSL certificates in production

---

## 📝 Logs

Server logs show:
- Translation requests
- Success/failure status
- Response times
- Cached hits

Example:
```
📝 Translating: 'Hello' from english to hindi
✅ Translation successful: 'नमस्ते'
```

---

## 🤝 Contributing

To add more features:

1. Add new routes in Flask app
2. Update frontend API client (`/utils/api.ts`)
3. Test with frontend
4. Document in this README

---

## 📞 Support

- **Frontend Issues**: Check `/WORKFLOW.md`
- **Backend Issues**: Check Flask console logs
- **API Issues**: Check Bhashini documentation

---

**Ready to translate! 🎉**
