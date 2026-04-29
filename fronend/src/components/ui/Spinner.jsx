import { motion } from "framer-motion";

export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Main Loader */}
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        />

        {/* Glow Ring */}
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-purple-500/20 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
        />

        {/* Text */}
        <motion.p
          className="text-white font-semibold tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
          }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}