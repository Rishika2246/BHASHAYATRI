import { motion } from "motion/react";
import { Volume2, MapPin, Calendar, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function CulturePage() {
  const etiquette = [
    {
      title: "Greetings",
      dos: ["Use 'Namaste' with folded hands", "Remove shoes before entering homes"],
      donts: ["Don't point feet at people", "Avoid public displays of affection"],
      icon: "🙏"
    },
    {
      title: "Dining",
      dos: ["Eat with right hand", "Accept food offerings graciously"],
      donts: ["Don't waste food", "Avoid eating beef in Hindu areas"],
      icon: "🍽️"
    },
    {
      title: "Religious Sites",
      dos: ["Dress modestly", "Ask before taking photos"],
      donts: ["Don't wear leather in temples", "Avoid loud conversations"],
      icon: "🛕"
    },
  ];

  const festivals = [
    {
      name: "Diwali",
      date: "Nov 1, 2025",
      location: "Pan-India",
      description: "Festival of Lights celebrating the victory of light over darkness",
      emoji: "🪔",
      active: false
    },
    {
      name: "Onam",
      date: "Today",
      location: "Kerala",
      description: "Harvest festival with flower carpets and traditional feast",
      emoji: "🌸",
      active: true
    },
    {
      name: "Durga Puja",
      date: "Oct 20-24, 2025",
      location: "West Bengal",
      description: "Grand celebration honoring Goddess Durga",
      emoji: "🎭",
      active: false
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXJhbGElMjBiYWNrd2F0ZXJzfGVufDF8fHx8MTc2MDIxMDkwMHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Kerala"
          className="w-full h-full object-cover opacity-5 blur-sm"
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">🎉 Culture & Etiquette</h1>
          <p className="text-gray-600">Learn local customs and festivals</p>
        </motion.div>

        {/* Active Festival Alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-india rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-9xl opacity-10">🎉</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h3>It's Onam in Kerala today!</h3>
                <p className="text-white/90 text-sm">Experience the harvest festival</p>
              </div>
            </div>
            <Button className="bg-white text-[#ff6b35] hover:bg-gray-100">
              <Volume2 className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Cultural Etiquette Cards */}
        <div className="mb-8">
          <h3 className="mb-4">📖 Cultural Do's & Don'ts</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {etiquette.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass rounded-3xl p-6 border-0 h-full">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{item.icon}</div>
                    <h4>{item.title}</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600">✓</span>
                        </div>
                        <span className="text-sm">Do's</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-8">
                        {item.dos.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600">✕</span>
                        </div>
                        <span className="text-sm">Don'ts</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-8">
                        {item.donts.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Festivals */}
        <div>
          <h3 className="mb-4">🎊 Festivals & Events</h3>
          <div className="space-y-4">
            {festivals.map((festival, index) => (
              <motion.div
                key={festival.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className={`glass rounded-3xl p-6 border-0 ${
                  festival.active ? "border-2 border-[#ff6b35]" : ""
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 gradient-india rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {festival.emoji}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{festival.name}</h4>
                        {festival.active && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                            Happening Now
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {festival.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {festival.location}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{festival.description}</p>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="gradient-india text-white">
                          <Volume2 className="w-4 h-4 mr-2" />
                          Listen to Story
                        </Button>
                        <Button size="sm" variant="outline">
                          <Info className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Python Backend:</strong> GET /api/culture/content?region=kerala
          </p>
        </div>
      </div>
    </div>
  );
}
