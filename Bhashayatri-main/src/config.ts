/**
 * Application Configuration
 * 
 * Update these values for your environment:
 * - Development: Use localhost
 * - Production: Use your deployed Python backend URL
 */

export const config = {
  // Python Backend API URL
  // Note: Flask backend routes are exposed at root (e.g. /bhashini/translate)
  // so the base URL should NOT include an extra `/api` prefix in development.
  apiBaseUrl: 'http://localhost:8000',
  
  // Feature Flags
  enableVoiceCalls: true,
  enableGamification: true,
  
  // Supported Languages
  supportedLanguages: [
    { code: 'english', name: 'English', native: 'English' },
    { code: 'hindi', name: 'Hindi', native: 'हिंदी' },
    { code: 'bengali', name: 'Bengali', native: 'বাংলা' },
    { code: 'tamil', name: 'Tamil', native: 'தமிழ்' },
    { code: 'telugu', name: 'Telugu', native: 'తెలుగు' },
    { code: 'marathi', name: 'Marathi', native: 'मराठी' },
    { code: 'gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'malayalam', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ],
} as const;

export default config;
