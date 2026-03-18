import { motion } from "motion/react";
import { Award, TrendingUp } from "lucide-react";

interface XPWidgetProps {
  xp: number;
  level: number;
  maxXP: number;
}

export function XPWidget({ xp, level, maxXP }: XPWidgetProps) {
  const progress = (xp / maxXP) * 100;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 glass rounded-2xl p-3 shadow-xl min-w-[200px]"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full gradient-india flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-[#ff6b35] shadow-lg">
            <span className="text-xs">{level}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-600">Level {level}</span>
            <TrendingUp className="w-3 h-3 text-[#138808]" />
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-india"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">{xp} / {maxXP} XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
