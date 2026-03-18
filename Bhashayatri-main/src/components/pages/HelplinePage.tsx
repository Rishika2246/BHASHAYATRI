import { useState } from "react";
import { motion } from "motion/react";
import { Phone, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function HelplinePage() {
  const [isCalling, setIsCalling] = useState(false);
  const [language, setLanguage] = useState("hindi");

  const transcript = [
    { speaker: "AI", text: "Hello, this is BhashaYatri helpline. How can I assist you?", time: "10:30:00" },
    { speaker: "You", text: "I need help finding a hotel near the airport", time: "10:30:15" },
    { speaker: "AI", text: "I can help you with that. Let me search for available hotels...", time: "10:30:25" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">📞 Voice Helpline</h1>
          <p className="text-gray-600">24/7 AI-powered assistance in your language</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <label className="block mb-3">Select Language:</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Hindi", "English", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati"].map((lang) => (
                <SelectItem key={lang.toLowerCase()} value={lang.toLowerCase()}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCalling(!isCalling)}
            className={`w-48 h-48 rounded-full ${
              isCalling ? "bg-red-500" : "gradient-green"
            } shadow-2xl flex flex-col items-center justify-center mx-auto relative`}
          >
            {isCalling ? (
              <>
                <PhoneOff className="w-16 h-16 text-white mb-3" />
                <span className="text-xl text-white">End Call</span>
              </>
            ) : (
              <>
                <Phone className="w-16 h-16 text-white mb-3" />
                <span className="text-xl text-white">Call Now</span>
              </>
            )}
            
            {isCalling && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
          
          <div className="mt-6">
            {!isCalling ? (
              <p className="text-gray-600">Tap to connect with AI helpline</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-green-600">Connected • Speaking via Bhashini AI</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-green-500 rounded-full"
                      animate={{ height: ["10px", "30px", "10px"] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {isCalling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="mb-4">Live Transcript</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transcript.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: item.speaker === "AI" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-2xl ${
                    item.speaker === "AI" 
                      ? "bg-gradient-to-br from-[#fff5f0] to-white border border-[#ff6b35]/20" 
                      : "bg-gray-100 ml-8"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{item.speaker}</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Backend Integration:</strong> /call/start → /bhashini/asr → /bhashini/mt → /bhashini/tts → /twilio/voice
          </p>
        </div>
      </div>
    </div>
  );
}
