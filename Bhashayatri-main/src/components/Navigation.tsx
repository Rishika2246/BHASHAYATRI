import { Home, Mic, MessageSquare, User, Camera, Plane, Phone, FileText, PartyPopper, AlertTriangle, MapPin, WifiOff, Volume2, Globe, PhoneCall, Award, Type, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

interface NavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isMobile: boolean;
}

export function Navigation({ activePage, onNavigate, isMobile }: NavigationProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "translate", label: "Translate", icon: Mic },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "ocr", label: "Scan", icon: Camera },
    { id: "profile", label: "Profile", icon: User },
  ];

  const sidebarItems = [
    { 
      category: "Journey Start",
      items: [
        { id: "home", label: "Home", icon: Home },
        { id: "location", label: "Location & Nearby", icon: MapPin },
        { id: "translate", label: "Live Speech Translator", icon: Mic },
        { id: "text-translator", label: "Text Translator", icon: Type },
      ]
    },
    {
      category: "Exploration",
      items: [
        { id: "ocr", label: "Image Text Scanner", icon: Camera },
        { id: "planner", label: "Trip Planner", icon: Plane },
        { id: "web-translator", label: "Website Translator", icon: Globe },
      ]
    },
    {
      category: "Communication",
      items: [
        { id: "conversation", label: "Conversation Translator", icon: MessageCircle },
        { id: "avatar", label: "AI Avatar Assistant", icon: User },
        { id: "chat", label: "AI Chat Assistant", icon: MessageSquare },
        { id: "tts", label: "Text-to-Speech", icon: Volume2 },
        { id: "voice-call", label: "Voice Call Assistant", icon: PhoneCall },
      ]
    },
    {
      category: "Utilities",
      items: [
        { id: "offline", label: "Offline Assistant", icon: WifiOff },
        { id: "document", label: "Document Translator", icon: FileText },
        { id: "culture", label: "Culture & Festivals", icon: PartyPopper },
      ]
    },
    {
      category: "Account",
      items: [
        { id: "gamification", label: "Achievements", icon: Award },
        { id: "emergency", label: "Emergency SOS", icon: AlertTriangle },
        { id: "profile", label: "My Profile", icon: User },
      ]
    },
  ];

  if (isMobile) {
    return (
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-gradient-to-r from-[#ff6b35] to-[#f59e0b] text-white shadow-lg scale-105" 
                    : "text-gray-600 hover:text-[#ff6b35]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.aside 
      className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/20 z-40 overflow-y-auto"
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl gradient-india flex items-center justify-center">
            <span className="text-xl">🧳</span>
          </div>
          <div>
            <h2 className="text-xl">BhashaYatri</h2>
            <p className="text-xs text-gray-500">Your AI Travel Guide</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.category}>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 px-4">
                {section.category}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all text-sm ${
                        isActive 
                          ? "bg-gradient-to-r from-[#ff6b35] to-[#f59e0b] text-white shadow-lg" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
