import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, MapPin } from "lucide-react";
import { getStateAvatar } from "../utils/location";

interface TalkingAvatarProps {
  state?: string;
  isSpeaking?: boolean;
  onSpeakToggle?: () => void;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  message?: string;
}

export function TalkingAvatar({
  state,
  isSpeaking = false,
  onSpeakToggle,
  size = 'medium',
  showControls = true,
  message,
}: TalkingAvatarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mouthState, setMouthState] = useState<'closed' | 'open' | 'half'>('closed');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Avatar customization based on state
  const stateEmoji = getStateAvatar(state);
  const stateColors = getStateColors(state);

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-24 h-24', emoji: 'text-4xl', face: 'w-20 h-20' },
    medium: { container: 'w-40 h-40', emoji: 'text-6xl', face: 'w-32 h-32' },
    large: { container: 'w-64 h-64', emoji: 'text-8xl', face: 'w-56 h-56' },
  }[size];

  // Lip sync animation
  useEffect(() => {
    if (isSpeaking) {
      setIsAnimating(true);
      
      // Simulate lip sync with random mouth movements
      const interval = setInterval(() => {
        const states: ('closed' | 'open' | 'half')[] = ['closed', 'open', 'half'];
        setMouthState(states[Math.floor(Math.random() * states.length)]);
      }, 150);

      return () => {
        clearInterval(interval);
        setIsAnimating(false);
        setMouthState('closed');
      };
    } else {
      setMouthState('closed');
    }
  }, [isSpeaking]);

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Location Badge */}
      {state && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 glass rounded-full"
        >
          <MapPin className="w-4 h-4 text-[#ff6b35]" />
          <span className="text-sm">{state}</span>
          <span className="text-xl">{stateEmoji}</span>
        </motion.div>
      )}

      {/* Avatar Container */}
      <div className="relative">
        {/* Glow effect when speaking */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute inset-0 rounded-full blur-2xl ${stateColors.glow}`}
              style={{ zIndex: -1 }}
            />
          )}
        </AnimatePresence>

        {/* Main Avatar Circle */}
        <motion.div
          className={`${sizeConfig.container} relative rounded-full ${stateColors.gradient} flex items-center justify-center shadow-2xl`}
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }
              : {}
          }
          transition={
            isSpeaking
              ? {
                  duration: 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
        >
          {/* Face Container */}
          <div className={`${sizeConfig.face} relative flex items-center justify-center`}>
            {/* Eyes */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={
                  isSpeaking
                    ? {
                        scaleY: [1, 0.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={
                  isSpeaking
                    ? {
                        scaleY: [1, 0.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            </div>

            {/* Mouth - Lip Sync */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
              <motion.div
                className="bg-white rounded-full overflow-hidden"
                animate={{
                  width: mouthState === 'open' ? 32 : mouthState === 'half' ? 20 : 12,
                  height: mouthState === 'open' ? 20 : mouthState === 'half' ? 12 : 8,
                }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Cultural Element */}
            <div className="absolute bottom-0 right-0 text-2xl opacity-80">
              {stateEmoji}
            </div>
          </div>

          {/* Sound Wave Animation */}
          {isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-full"
                  animate={{
                    height: ['8px', '20px', '8px'],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Controls */}
      {showControls && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSpeakToggle}
          className={`px-6 py-3 rounded-full ${stateColors.button} text-white flex items-center gap-2 shadow-lg`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-5 h-5" />
              <span>Stop Speaking</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Start Speaking</span>
            </>
          )}
        </motion.button>
      )}

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md glass rounded-2xl p-4 text-center"
        >
          <p className="text-sm">{message}</p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Get colors based on Indian state
 */
function getStateColors(state?: string): {
  gradient: string;
  glow: string;
  button: string;
} {
  const colorMap: Record<string, { gradient: string; glow: string; button: string }> = {
    'Kerala': {
      gradient: 'bg-gradient-to-br from-green-500 to-green-700',
      glow: 'bg-green-500/50',
      button: 'bg-green-600 hover:bg-green-700',
    },
    'Tamil Nadu': {
      gradient: 'bg-gradient-to-br from-red-500 to-orange-600',
      glow: 'bg-orange-500/50',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
    'Karnataka': {
      gradient: 'bg-gradient-to-br from-yellow-500 to-red-600',
      glow: 'bg-yellow-500/50',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    'Maharashtra': {
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      glow: 'bg-blue-500/50',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    'Rajasthan': {
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
      glow: 'bg-pink-500/50',
      button: 'bg-pink-600 hover:bg-pink-700',
    },
    'Gujarat': {
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      glow: 'bg-purple-500/50',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    'Delhi': {
      gradient: 'bg-gradient-to-br from-gray-600 to-gray-800',
      glow: 'bg-gray-500/50',
      button: 'bg-gray-600 hover:bg-gray-700',
    },
    'Goa': {
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      glow: 'bg-cyan-500/50',
      button: 'bg-cyan-600 hover:bg-cyan-700',
    },
  };

  return (
    colorMap[state || ''] || {
      gradient: 'gradient-india',
      glow: 'bg-[#ff6b35]/50',
      button: 'gradient-india',
    }
  );
}
