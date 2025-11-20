"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { toast, Toaster } from "sonner";

const FullDinoMascot = () => {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-2xl"
    >
      {/* Tail */}
      <path
        d="M150 220 C 150 220, 240 240, 270 200"
        stroke="#2E7D32"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Legs */}
      <g transform="translate(0, 20)">
        <path
          d="M120 220 L 110 260 L 135 260 L 140 220"
          fill="#1B5E20"
          stroke="#1B5E20"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path
          d="M170 220 L 180 260 L 155 260 L 150 220"
          fill="#1B5E20"
          stroke="#1B5E20"
          strokeWidth="10"
          strokeLinejoin="round"
        />
      </g>

      {/* Body - Stout */}
      <ellipse cx="145" cy="170" rx="55" ry="70" fill="#2E7D32" />
      <ellipse cx="145" cy="170" rx="35" ry="50" fill="#4CAF50" opacity="0.3" />

      {/* Tiny Arms - Animated */}
      <motion.g
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "110px", originY: "150px" }}
      >
        <path
          d="M110 150 Q 90 170 100 180"
          stroke="#1B5E20"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </motion.g>
      <motion.g
        animate={{ rotate: [0, -10, 0, 10, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        style={{ originX: "180px", originY: "150px" }}
      >
        <path
          d="M180 150 Q 200 170 190 180"
          stroke="#1B5E20"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Head Group - Reusing logic but centered */}
      <motion.g
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "145px", originY: "110px" }}
        transform="translate(35, 20)"
      >
        {/* Head Shape */}
        <path
          d="M60 50C60 30 80 10 110 10C150 10 170 40 170 70C170 100 140 110 110 110C80 110 60 90 60 50Z"
          fill="#4CAF50"
        />
        {/* Jaw/Snout */}
        <path
          d="M60 70H130C140 70 145 80 145 90C145 105 130 110 110 110H80C70 110 60 90 60 70Z"
          fill="#81C784"
        />

        {/* Eye - Blinking Animation */}
        <g transform="translate(90, 40)">
          <circle cx="0" cy="0" r="12" fill="white" />
          <motion.circle
            cx="0"
            cy="0"
            r="5"
            fill="black"
            animate={{ scaleY: [1, 0.1, 1, 1, 0.1, 1] }}
            transition={{
              duration: 4,
              times: [0, 0.05, 0.1, 0.5, 0.55, 0.6],
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        </g>

        {/* Nostril */}
        <circle cx="75" cy="60" r="4" fill="#1B5E20" opacity="0.6" />

        {/* Spikes */}
        <path d="M110 10L120 -5L130 10H110Z" fill="#1B5E20" />
        <path d="M135 15L145 0L155 15H135Z" fill="#1B5E20" />
        <path d="M85 15L95 0L105 15H85Z" fill="#1B5E20" />
      </motion.g>
    </svg>
  );
};

export default function DemoPage() {
  const callApi = async () => {
    try {
      const res = await fetch("/api/hello");
      const text = await res.text();
      toast(text, {
        icon: <Zap className="w-4 h-4 text-emerald-500" />,
        style: {
          background: "#0a1f15",
          border: "1px solid rgba(16,185,129,0.2)",
          color: "white",
        },
      });
    } catch {
      toast.error("Failed to call API");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050f0a] text-white items-center justify-center relative overflow-hidden">
      <Toaster />
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="z-10 flex flex-col items-center gap-12 p-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-emerald-500/30 blur-[60px] rounded-full scale-150" />

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <FullDinoMascot />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-4 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-white">Docuzaurs Demo</h1>

          <div className="flex gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-full font-semibold shadow-lg hover:bg-zinc-700 transition-all border border-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </motion.button>
            </Link>

            <motion.button
              onClick={callApi}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all"
            >
              <Zap className="w-5 h-5" />
              Call API
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
