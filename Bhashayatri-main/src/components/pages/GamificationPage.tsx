import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Trophy, Star, TrendingUp, Users, Sparkles, Zap, Target, Crown, Gift } from "lucide-react";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

export function GamificationPage() {
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  
  const userStats = {
    level: 5,
    xp: 2350,
    maxXP: 3000,
    rank: 142,
    badges: 12,
    streak: 7,
  };

  const badges = [
    { id: 1, name: "First Translation", icon: "🎤", earned: true, date: "Oct 1, 2025", rarity: "common" },
    { id: 2, name: "Cultural Explorer", icon: "🏛️", earned: true, date: "Oct 5, 2025", rarity: "rare" },
    { id: 3, name: "Polyglot Master", icon: "🌐", earned: true, date: "Oct 8, 2025", rarity: "epic" },
    { id: 4, name: "Travel Buddy", icon: "✈️", earned: false, requirement: "Plan 10 trips", rarity: "rare" },
    { id: 5, name: "Festival Expert", icon: "🎉", earned: false, requirement: "Learn 5 festivals", rarity: "epic" },
    { id: 6, name: "OCR Master", icon: "📸", earned: true, date: "Oct 3, 2025", rarity: "rare" },
    { id: 7, name: "Voice Champion", icon: "🎙️", earned: false, requirement: "100 translations", rarity: "legendary" },
    { id: 8, name: "Speed Learner", icon: "⚡", earned: true, date: "Oct 7, 2025", rarity: "common" },
  ];

  const leaderboard = [
    { rank: 1, name: "Priya Sharma", xp: 8520, level: 12, avatar: "PS", trend: "+250" },
    { rank: 2, name: "Rajesh Kumar", xp: 7890, level: 11, avatar: "RK", trend: "+180" },
    { rank: 3, name: "Ananya Patel", xp: 6750, level: 10, avatar: "AP", trend: "+320" },
    { rank: 4, name: "You", xp: 2350, level: 5, avatar: "ME", highlight: true, trend: "+150" },
    { rank: 5, name: "Vikram Singh", xp: 2100, level: 5, avatar: "VS", trend: "+90" },
  ];

  const quests = [
    { id: 1, title: "Speak Like a Local", description: "Complete 10 translations", progress: 7, total: 10, xp: 100, color: "from-purple-400 to-pink-500" },
    { id: 2, title: "Avatar Travel Badges", description: "Chat 50 times with avatar", progress: 23, total: 50, xp: 200, color: "from-blue-400 to-cyan-500" },
    { id: 3, title: "Festival Quest", description: "Learn about 5 festivals", progress: 2, total: 5, xp: 150, color: "from-orange-400 to-red-500" },
  ];

  const dailyRewards = [
    { day: 1, reward: "50 XP", claimed: true },
    { day: 2, reward: "75 XP", claimed: true },
    { day: 3, reward: "100 XP", claimed: true },
    { day: 4, reward: "125 XP", claimed: true },
    { day: 5, reward: "150 XP", claimed: true },
    { day: 6, reward: "175 XP", claimed: true },
    { day: 7, reward: "🎁 Badge", claimed: false },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "from-gray-400 to-gray-600";
      case "rare": return "from-blue-400 to-blue-600";
      case "epic": return "from-purple-400 to-purple-600";
      case "legendary": return "from-yellow-400 to-orange-500";
      default: return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block text-6xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="mb-2">Achievements & Rewards</h1>
          <p className="text-gray-600">Track your journey to language mastery</p>
        </motion.div>

        {/* User Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          }}
        >
          <div className="absolute top-0 right-0 text-9xl opacity-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3">
                  <h2>Cultural Explorer</h2>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                </div>
                <p className="text-gray-600">Level {userStats.level}</p>
                <div className="flex items-center gap-2 mt-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4 text-orange-500" />
                  </motion.div>
                  <span className="text-sm">🔥 {userStats.streak} day streak</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to Level {userStats.level + 1}</span>
                <span>{userStats.xp} / {userStats.maxXP} XP</span>
              </div>
              <Progress value={(userStats.xp / userStats.maxXP) * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300"
              >
                <div className="text-3xl mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  #{userStats.rank}
                </div>
                <div className="text-sm text-gray-600">Global Rank</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300"
              >
                <div className="text-3xl mb-1 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {userStats.badges}
                </div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300"
              >
                <div className="text-3xl mb-1 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {userStats.xp}
                </div>
                <div className="text-sm text-gray-600">Total XP</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3>Achievement Badges</h3>
            </div>
            <div className="glass rounded-3xl p-6">
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setSelectedBadge(badge.id)}
                    className={`p-4 rounded-2xl text-center cursor-pointer ${
                      badge.earned 
                        ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-lg` 
                        : "bg-gray-100 opacity-60"
                    }`}
                  >
                    <motion.div 
                      className="text-4xl mb-2"
                      animate={badge.earned ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      {badge.earned ? badge.icon : "🔒"}
                    </motion.div>
                    <div className="text-sm mb-1">{badge.name}</div>
                    {badge.earned ? (
                      <div className="text-xs opacity-80">{badge.date}</div>
                    ) : (
                      <div className="text-xs text-gray-500">{badge.requirement}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-cyan-500" />
              <h3>Leaderboard</h3>
            </div>
            <div className="glass rounded-3xl p-6">
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`flex items-center gap-4 p-3 rounded-2xl ${
                      user.highlight 
                        ? "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400 shadow-lg" 
                        : "bg-white"
                    }`}
                  >
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                        user.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                        user.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                        "bg-gradient-to-br from-gray-200 to-gray-400"
                      } text-white`}
                      animate={user.rank <= 3 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {user.rank}
                    </motion.div>
                    
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div>{user.name}</div>
                      <div className="text-sm text-gray-600">Level {user.level}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{user.xp} XP</span>
                      </div>
                      <div className="text-xs text-green-600">{user.trend}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-pink-500" />
            <h3>Daily Rewards - Day {userStats.streak}</h3>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex gap-3 overflow-x-auto">
              {dailyRewards.map((reward, index) => (
                <motion.div
                  key={reward.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`flex-shrink-0 w-24 p-4 rounded-2xl text-center ${
                    reward.claimed
                      ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
                      : reward.day === userStats.streak
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white animate-pulse"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="text-xs mb-2">Day {reward.day}</div>
                  <motion.div
                    className="text-2xl mb-1"
                    animate={reward.day === userStats.streak ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {reward.claimed ? "✅" : reward.day === 7 ? "🎁" : "💎"}
                  </motion.div>
                  <div className="text-xs">{reward.reward}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Active Quests */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-orange-500" />
            <h3>Active Quests</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {quests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass rounded-3xl p-6 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${quest.color} rounded-full blur-2xl opacity-30`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h4>{quest.title}</h4>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className={`px-3 py-1 bg-gradient-to-r ${quest.color} rounded-full text-sm text-white`}
                    >
                      +{quest.xp} XP
                    </motion.div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{quest.description}</p>
                  <div className="mb-2">
                    <Progress value={(quest.progress / quest.total) * 100} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    {quest.progress} / {quest.total}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 max-w-md text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, ease: "linear" }}
                className="text-8xl mb-4"
              >
                {badges.find(b => b.id === selectedBadge)?.icon}
              </motion.div>
              <h2 className="mb-2">{badges.find(b => b.id === selectedBadge)?.name}</h2>
              <p className="text-gray-600 mb-4">
                {badges.find(b => b.id === selectedBadge)?.earned 
                  ? `Earned on ${badges.find(b => b.id === selectedBadge)?.date}`
                  : badges.find(b => b.id === selectedBadge)?.requirement}
              </p>
              <Button
                onClick={() => setSelectedBadge(null)}
                className="gradient-india text-white"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
