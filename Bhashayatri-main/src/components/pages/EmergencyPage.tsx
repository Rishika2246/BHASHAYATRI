import { motion } from "motion/react";
import { Phone, AlertTriangle, Hospital, Shield, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";

export function EmergencyPage() {
  const [language, setLanguage] = useState("english");
  const [isCalling, setIsCalling] = useState(false);

  const emergencyContacts = [
    { name: "Police", number: "100", icon: Shield, color: "bg-blue-500" },
    { name: "Ambulance", number: "102", icon: Hospital, color: "bg-red-500" },
    { name: "Fire", number: "101", icon: AlertTriangle, color: "bg-orange-500" },
  ];

  const handleSOS = () => {
    setIsCalling(true);
    // Mock: /bhashini/asr → /bhashini/mt → /twilio/voice
    setTimeout(() => setIsCalling(false), 5000);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="mb-2">🚨 Emergency SOS</h1>
          <p className="text-gray-600">Get immediate help in your language</p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <label className="block mb-3">Select Your Language:</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi"].map((lang) => (
                <SelectItem key={lang.toLowerCase()} value={lang.toLowerCase()}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSOS}
            disabled={isCalling}
            className={`w-64 h-64 rounded-full ${
              isCalling ? "bg-green-500" : "bg-gradient-to-br from-red-500 to-red-600"
            } shadow-2xl flex flex-col items-center justify-center mx-auto relative`}
          >
            {isCalling ? (
              <>
                <Phone className="w-20 h-20 text-white mb-4" />
                <span className="text-2xl text-white">Connecting...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-20 h-20 text-white mb-4" />
                <span className="text-3xl text-white">EMERGENCY</span>
                <span className="text-lg text-white/90 mt-2">Press for Help</span>
              </>
            )}
            
            {!isCalling && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* Call Status */}
        {isCalling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 mb-6"
          >
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-red-500 rounded-full"
                    animate={{
                      height: ["10px", "40px", "10px"],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
              <h3 className="mb-2">Speaking via Bhashini AI</h3>
              <p className="text-gray-600 mb-4">Your emergency is being relayed in {language}</p>
              <div className="bg-white rounded-2xl p-4 text-left">
                <p className="text-sm text-gray-700">"I need emergency assistance. Please help me."</p>
                <p className="text-sm text-[#ff6b35] mt-2">"मुझे आपातकालीन सहायता चाहिए। कृपया मेरी सहायता करें।"</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Dial Emergency Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <h3 className="mb-4">Quick Dial</h3>
          <div className="grid grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.button
                  key={contact.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${contact.color} rounded-2xl p-4 text-white text-center`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm mb-1">{contact.name}</div>
                  <div className="text-xl">{contact.number}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Location Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="mb-4">Share Your Location</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Current Location</p>
              <p>Connaught Place, New Delhi</p>
            </div>
            <Button className="gradient-blue text-white">
              Share
            </Button>
          </div>
        </motion.div>

        {/* API Integration Notes */}
        <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-sm text-red-800">
            🔌 <strong>Backend Integration:</strong> /bhashini/asr → /bhashini/mt → /twilio/voice
          </p>
        </div>
      </div>
    </div>
  );
}
