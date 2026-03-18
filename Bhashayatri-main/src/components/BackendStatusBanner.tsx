import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, X, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

export function BackendStatusBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('backend_banner_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      setIsDismissed(true);
    }

    // Check backend connection
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setIsBackendConnected(true);
        // Auto-dismiss banner if backend is connected
        setTimeout(() => setIsVisible(false), 3000);
      }
    } catch (error) {
      setIsBackendConnected(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('backend_banner_dismissed', 'true');
    setIsDismissed(true);
  };

  const handleLearnMore = () => {
    // Open Python backend setup documentation
    window.open('https://github.com/yourusername/bhashayatri-backend', '_blank');
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${
            isBackendConnected 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          } text-white`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {isBackendConnected ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 animate-pulse" />
              ) : (
                <Info className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                {isBackendConnected ? (
                  <p className="text-sm">
                    <strong>✅ Backend Connected!</strong> All Bhashini API features are active.{" "}
                    <span className="hidden md:inline">
                      Enjoy full translation, speech recognition, and AI-powered assistance.
                    </span>
                  </p>
                ) : (
                  <p className="text-sm">
                    <strong>🔌 Backend Setup:</strong> Connect your Python backend for full Bhashini integration.{" "}
                    <span className="hidden md:inline">
                      Currently using fallback features. Click "Setup Guide" to enable AI translation APIs.
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isBackendConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLearnMore}
                  className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Setup Guide
                </Button>
              )}
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
