import { useState } from "react";
import { motion } from "motion/react";
import { Phone, PhoneCall, PhoneOff, Clock, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { TalkingAvatar } from "../TalkingAvatar";
import { requestVoiceCall } from "../../utils/api";
import { getCachedLocation } from "../../utils/location";

export function VoiceCallPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [topic, setTopic] = useState("");
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'requesting' | 'calling' | 'ended'>('idle');
  
  const location = getCachedLocation();

  const handleRequestCall = async () => {
    if (!phoneNumber.trim()) return;

    setCallStatus('requesting');
    
    try {
      const response = await requestVoiceCall(phoneNumber, language, topic);
      
      if (response.success) {
        setCallStatus('calling');
        setIsCallRequested(true);
        
        // Simulate call ending after 30 seconds
        setTimeout(() => {
          setCallStatus('ended');
        }, 30000);
      }
    } catch (error) {
      console.error('Call request error:', error);
      setCallStatus('idle');
    }
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    setIsCallRequested(false);
    setPhoneNumber("");
    setTopic("");
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1649510550074-16195a0c6473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdW1iYWklMjBjaXR5c2NhcGV8ZW58MXx8fHwxNzYwMTg2NjA5fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="India"
          className="w-full h-full object-cover opacity-5 blur-sm"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">📞 Voice Call Assistant</h1>
          <p className="text-gray-600">Get instant voice assistance from our AI assistant</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Call Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6"
          >
            {callStatus === 'idle' || callStatus === 'ended' ? (
              <>
                <h3 className="mb-6">Request a Call</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Your Phone Number</label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Preferred Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                        <SelectItem value="telugu">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">What do you need help with?</label>
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="E.g., Finding nearby restaurants, hotel booking, emergency assistance..."
                      className="min-h-[100px] rounded-2xl"
                    />
                  </div>

                  <Button
                    onClick={handleRequestCall}
                    disabled={!phoneNumber.trim()}
                    className="w-full gradient-india text-white rounded-full"
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Request Call Now
                  </Button>
                </div>

                {callStatus === 'ended' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                    <p className="text-sm text-green-800">
                      ✅ Call completed. How did we do?
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full gradient-india flex items-center justify-center"
                >
                  <Phone className="w-12 h-12 text-white" />
                </motion.div>

                <h3 className="mb-2">
                  {callStatus === 'requesting' ? 'Initiating Call...' : 'Call in Progress'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {callStatus === 'requesting'
                    ? 'Please wait while we connect you'
                    : `Speaking in ${language}`}
                </p>

                {callStatus === 'calling' && (
                  <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    className="rounded-full"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6 flex flex-col items-center justify-center"
          >
            <TalkingAvatar
              state={location?.state}
              isSpeaking={callStatus === 'calling'}
              size="large"
              showControls={false}
              message={
                callStatus === 'calling'
                  ? 'Hello! How can I assist you today?'
                  : callStatus === 'requesting'
                  ? 'Connecting...'
                  : undefined
              }
            />

            {callStatus === 'idle' && (
              <div className="mt-6 text-center">
                <h4 className="mb-2">Available 24/7</h4>
                <p className="text-sm text-gray-600">
                  Our AI assistant speaks 10+ Indian languages
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <div className="glass rounded-2xl p-4 text-center">
            <Phone className="w-8 h-8 mx-auto mb-3 text-[#ff6b35]" />
            <h4 className="mb-2">Instant Callback</h4>
            <p className="text-sm text-gray-600">Get a call within seconds</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <User className="w-8 h-8 mx-auto mb-3 text-[#138808]" />
            <h4 className="mb-2">AI Assistant</h4>
            <p className="text-sm text-gray-600">Smart voice AI in your language</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-3 text-[#0066cc]" />
            <h4 className="mb-2">24/7 Available</h4>
            <p className="text-sm text-gray-600">Always here to help</p>
          </div>
        </motion.div>

        {/* API Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Python Backend:</strong> POST /api/twilio/request-call (Twilio Voice API)
          </p>
        </div>
      </div>
    </div>
  );
}
