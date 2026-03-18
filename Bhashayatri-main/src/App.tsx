import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// Auth
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/pages/LoginPage";
import { SignupPage } from "./components/pages/SignupPage";

// Components
import { Navigation } from "./components/Navigation";
import { AvatarAssistant } from "./components/AvatarAssistant";
import { BackendStatusBanner } from "./components/BackendStatusBanner";
import { WelcomeBanner } from "./components/WelcomeBanner";

// Pages
import { HomePage } from "./components/pages/HomePage";
import { LiveTranslatorPage } from "./components/pages/LiveTranslatorPage";
import { OCRPage } from "./components/pages/OCRPage";
import { ChatbotPage } from "./components/pages/ChatbotPage";
import { TripPlannerPage } from "./components/pages/TripPlannerPage";
import { HelplinePage } from "./components/pages/HelplinePage";
import { DocumentPage } from "./components/pages/DocumentPage";
import { CulturePage } from "./components/pages/CulturePage";
import { GamificationPage } from "./components/pages/GamificationPage";
import { EmergencyPage } from "./components/pages/EmergencyPage";
import { ProfilePage } from "./components/pages/ProfilePage";

// New Feature Pages
import { LocationPage } from "./components/pages/LocationPage";
import { OfflinePage } from "./components/pages/OfflinePage";
import { TTSPage } from "./components/pages/TTSPage";
import { VoiceCallPage } from "./components/pages/VoiceCallPage";
import { WebsiteTranslatorPage } from "./components/pages/WebsiteTranslatorPage";
import { AvatarPage } from "./components/pages/AvatarPage";
import { TextTranslatorPage } from "./components/pages/TextTranslatorPage";
import { ConversationTranslatorPage } from "./components/pages/ConversationTranslatorPage";
import { Toaster } from "./components/ui/sonner";

function MainApp() {
  const { user, isAuthenticated, isLoading, login, signup } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [activePage, setActivePage] = useState("home");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Debug logging
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ USER IS AUTHENTICATED - SHOWING DASHBOARD');
    } else {
      console.log('❌ USER NOT AUTHENTICATED - SHOWING LOGIN PAGE');
    }
    console.log('🔍 Auth State:', { 
      isAuthenticated, 
      hasUser: !!user, 
      isLoading,
      userEmail: user?.email || 'none'
    });
  }, [isAuthenticated, user, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF9933]/10 via-white to-[#138808]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BhashaYatri...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <SignupPage
          onSignup={signup}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    
    return (
      <LoginPage
        onLogin={login}
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  const handleAvatarClick = () => {
    setActivePage("chat");
  };

  // Render active page
  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "location":
        return <LocationPage />;
      case "translate":
        return <LiveTranslatorPage />;
      case "text-translator":
        return <TextTranslatorPage />;
      case "conversation":
        return <ConversationTranslatorPage />;
      case "ocr":
        return <OCRPage />;
      case "chat":
        return <ChatbotPage />;
      case "planner":
        return <TripPlannerPage />;
      case "web-translator":
        return <WebsiteTranslatorPage />;
      case "tts":
        return <TTSPage />;
      case "voice-call":
        return <VoiceCallPage />;
      case "offline":
        return <OfflinePage />;
      case "avatar":
        return <AvatarPage />;
      case "helpline":
        return <HelplinePage />;
      case "document":
        return <DocumentPage />;
      case "culture":
        return <CulturePage />;
      case "gamification":
        return <GamificationPage />;
      case "emergency":
        return <EmergencyPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafbff] via-[#fff5f0] to-[#f0f9ff] relative">
      {/* Backend Status Banner */}
      <BackendStatusBanner />

      {/* Cultural Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#ff6b35] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#138808] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#0066cc] rounded-full blur-3xl opacity-20"></div>
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="india-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="#ff6b35"/>
                <circle cx="25" cy="25" r="1" fill="#138808"/>
                <circle cx="75" cy="75" r="1" fill="#0066cc"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#india-pattern)"/>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <Navigation 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        isMobile={isMobile}
      />

      {/* Main Content */}
      <main className={`relative z-10 ${isMobile ? "" : "ml-64"} transition-all`}>
        {/* Top Bar - Desktop Only */}
        {!isMobile && (
          <div className="fixed top-0 right-0 left-64 z-40 glass border-b border-white/20 px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl">BhashaYatri</h2>
              <p className="text-sm text-gray-600">Multilingual Tourism Companion</p>
            </div>
          </div>
        )}

        {/* Page Content with Animation */}
        <div className={`${isMobile ? "pt-4" : "pt-24"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Avatar Assistant */}
      <AvatarAssistant onClick={handleAvatarClick} />

      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
