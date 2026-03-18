import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, MapPin, MessageCircle, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export function WelcomeBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show welcome banner only once per session
    const hasSeenWelcome = sessionStorage.getItem('welcome_banner_seen');
    
    if (!hasSeenWelcome && user) {
      setIsVisible(true);
      sessionStorage.setItem('welcome_banner_seen', 'true');
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 md:top-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-md"
        >
          <div className="glass rounded-2xl p-6 shadow-2xl border border-white/30 backdrop-blur-xl bg-gradient-to-br from-[#FF9933]/10 via-white/90 to-[#138808]/10">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9933] to-[#138808] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[#000080] mb-1">
                  Welcome, {user.name}! 🎉
                </h3>
                <p className="text-sm text-gray-600">
                  You're all set to explore India with AI-powered language assistance
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-[#FF9933]" />
                <span>Location: {user.location.city}, {user.location.country}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Navigation className="w-4 h-4 text-[#138808]" />
                <span>GPS tracking enabled for smart recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MessageCircle className="w-4 h-4 text-[#000080]" />
                <span>17+ modules ready to use</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>💡 Quick Tip:</strong> Use the floating avatar button to access the AI chatbot anytime!
              </p>
            </div>

            <Button
              onClick={handleDismiss}
              className="w-full mt-4 gradient-india text-white rounded-xl"
            >
              Let's Explore! 🚀
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
