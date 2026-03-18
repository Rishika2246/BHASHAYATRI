import { motion } from "motion/react";
import {  MapPin, Mic, Camera, MessageSquare, Globe, Phone, Volume2, WifiOff, Plane, Type } from "lucide-react";
import { Card } from "../ui/card";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  // Storyline scenarios - journey-based approach
  const journeyScenarios = [
    {
      chapter: "Chapter 1: Arrival",
      title: "You've Just Landed in India",
      scenarios: [
        {
          id: "location",
          icon: MapPin,
          title: "Where Am I?",
          story: "Find your location and discover what's nearby",
          action: "Explore Around Me",
          gradient: "from-orange-500 to-red-600",
        },
        {
          id: "translate",
          icon: Mic,
          title: "Can't Speak the Language?",
          story: "Talk in your language, hear it in theirs",
          action: "Start Translating",
          gradient: "from-purple-500 to-pink-600",
        },
        {
          id: "text-translator",
          icon: Type,
          title: "Need to Write Something?",
          story: "Type or paste text to translate instantly",
          action: "Translate Text",
          gradient: "from-blue-500 to-indigo-600",
        },
      ],
    },
    {
      chapter: "Chapter 2: Exploration",
      title: "Discovering the Unknown",
      scenarios: [
        {
          id: "ocr",
          icon: Camera,
          title: "What Does That Sign Say?",
          story: "Point your camera at any text and understand it",
          action: "Scan & Translate",
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          id: "planner",
          icon: Plane,
          title: "Where Should I Go?",
          story: "Plan your perfect journey with AI assistance",
          action: "Plan My Trip",
          gradient: "from-green-500 to-emerald-600",
        },
        {
          id: "web-translator",
          icon: Globe,
          title: "Need to Read a Website?",
          story: "Convert any website to your language",
          action: "Translate Website",
          gradient: "from-indigo-500 to-blue-600",
        },
      ],
    },
    {
      chapter: "Chapter 3: Communication",
      title: "Connecting with Locals",
      scenarios: [
        {
          id: "avatar",
          icon: MessageSquare,
          title: "Meet Your AI Guide",
          story: "Interactive avatar that speaks in 10+ Indian languages",
          action: "Meet Avatar",
          gradient: "from-violet-500 to-purple-600",
        },
        {
          id: "chat",
          icon: MessageSquare,
          title: "Need Travel Advice?",
          story: "Chat with AI in your language, get instant help",
          action: "Chat Now",
          gradient: "from-pink-500 to-rose-600",
        },
        {
          id: "tts",
          icon: Volume2,
          title: "Want to Hear It Spoken?",
          story: "Convert text to natural speech in any language",
          action: "Speak It Out",
          gradient: "from-yellow-500 to-orange-600",
        },
        {
          id: "voice-call",
          icon: Phone,
          title: "Prefer a Phone Call?",
          story: "Get instant voice assistance from AI",
          action: "Request Call",
          gradient: "from-teal-500 to-green-600",
        },
      ],
    },
    {
      chapter: "Chapter 4: Survival",
      title: "When You Need Help",
      scenarios: [
        {
          id: "offline",
          icon: WifiOff,
          title: "No Internet Connection?",
          story: "Access saved translations and queries offline",
          action: "Go Offline",
          gradient: "from-gray-600 to-gray-800",
        },
        {
          id: "emergency",
          icon: Phone,
          title: "Emergency Situation?",
          story: "Quick access to emergency services in local language",
          action: "Get Help Now",
          gradient: "from-red-600 to-rose-700",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Cultural Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWolMjBtYWhhbCUyMGluZGlhfGVufDF8fHx8MTc2MDE2MzUyNHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="India Heritage"
          className="w-full h-full object-cover opacity-10 blur-sm"
        />
      </div>
      
      {/* Hero Section */}
      <motion.div
        className="relative z-10 overflow-hidden rounded-3xl mx-4 mt-4 md:mx-8 md:mt-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="gradient-india p-8 md:p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1572945015532-741f8c49a7b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGV8ZW58MXx8fHwxNzYwMjEwODk5fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Temple"
              className="w-full h-full object-cover opacity-20 blur-md"
            />
          </div>
          <div className="absolute top-0 right-0 text-9xl opacity-20">🌍</div>
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              🗺️
            </motion.div>
            <h1 className="mb-4 text-4xl md:text-5xl">BhashaYatri</h1>
            <p className="text-xl mb-2 opacity-90">Your Multilingual Journey Begins</p>
            <p className="text-sm opacity-75 max-w-2xl">
              Experience India without language barriers. From arrival to exploration, 
              we're with you every step of the way.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Journey Chapters */}
      <div className="relative z-10 px-4 md:px-8 py-8 max-w-7xl mx-auto">
        {journeyScenarios.map((chapter, chapterIndex) => (
          <motion.div
            key={chapter.chapter}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: chapterIndex * 0.2 }}
            className="mb-12"
          >
            {/* Chapter Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full gradient-india flex items-center justify-center text-white">
                  {chapterIndex + 1}
                </div>
                <span className="text-sm text-gray-600">{chapter.chapter}</span>
              </div>
              <h2 className="text-2xl md:text-3xl">{chapter.title}</h2>
            </div>

            {/* Scenario Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapter.scenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: chapterIndex * 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="cursor-pointer"
                  onClick={() => onNavigate(scenario.id)}
                >
                  <Card className="glass border-white/30 hover:border-[#ff6b35]/50 transition-all overflow-hidden h-full">
                    {/* Gradient Header */}
                    <div className={`h-2 bg-gradient-to-r ${scenario.gradient}`} />
                    
                    <div className="p-6">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scenario.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <scenario.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="mb-2">{scenario.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {scenario.story}
                      </p>

                      {/* Action Button */}
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gradient-to-r ${scenario.gradient} text-white`}>
                        {scenario.action}
                        <span>→</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass rounded-3xl p-8 text-center mt-12"
        >
          <div className="text-5xl mb-4">🎭</div>
          <h2 className="mb-2">More Features Await</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Explore cultural festivals, earn achievements through gamification, 
            manage documents, and discover local etiquette guides.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate("culture")}
              className="px-6 py-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              🎪 Cultural Guide
            </button>
            <button
              onClick={() => onNavigate("document")}
              className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              📄 Document Translator
            </button>
            <button
              onClick={() => onNavigate("gamification")}
              className="px-6 py-3 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
            >
              🏆 Achievements
            </button>
            <button
              onClick={() => onNavigate("profile")}
              className="px-6 py-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              👤 My Profile
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
