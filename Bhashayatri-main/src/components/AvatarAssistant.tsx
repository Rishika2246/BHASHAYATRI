import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

interface AvatarAssistantProps {
  onClick?: () => void;
}

export function AvatarAssistant({ onClick }: AvatarAssistantProps) {
  return (
    <motion.div
      className="fixed bottom-24 right-6 z-50 cursor-pointer"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Avatar Circle with gradient */}
        <div className="w-16 h-16 rounded-full gradient-india flex items-center justify-center shadow-2xl">
          <span className="text-3xl">🤖</span>
        </div>
        
        {/* Pulse Animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#ff6b35] opacity-40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Message Badge */}
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <MessageCircle className="w-3 h-3 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}
