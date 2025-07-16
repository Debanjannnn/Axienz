"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Github, Twitter, Linkedin } from "lucide-react"
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
// import Logos from "@/components/Logos"
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Logos } from "@/components/LogoCloud";
// import { AnimatedShinyTextDemo } from "./ShinyText"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export default function HeroSection() {
  const [count, setCount] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Animated counter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCount((prev) => {
          if (prev < 2400) {
            return prev + 50;
          }
          clearInterval(interval);
          return 2400;
        });
      }, 30);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen px-6 text-center relative",
        poppins.className,
      )}
      style={{ y: y1, opacity }}
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Waitlist Counter */}
      <motion.div
        className="flex items-center space-x-3 mb-8 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        {/* Avatar Images */}
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white"></div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 border-2 border-white"></div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-red-500 border-2 border-white"></div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white"></div>
        </div>
        <span className="text-white/90 text-sm font-medium">2.4K currently on the waitlist</span>
      </motion.div>
      {/* <AnimatedShinyTextDemo /> */}
      {/* Main Heading without typewriter effect */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-8xl italic font-thin text-white mb-2 sm:mb-4 max-w-6xl leading-tight whitespace-nowrap break-keep"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
      INHERIT WITHOUT CHAOS
      </motion.h1>

      {/* Subheading */}
      <motion.h2
        className="text-xl sm:text-2xl md:text-4xl lg:text-6xl text-white/90 italic mb-4 sm:mb-8 max-w-4xl font-extralight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
       Smart contracts handle everything.
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-base italic sm:text-lg md:text-2xl mb-6 sm:mb-12 max-w-2xl leading-relaxed font-light"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        LIVE ON BNB TESTNET.
        <br />
       
      </motion.p>

      {/* Email Signup Form */}
      {/* <motion.div
        className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 sm:mb-4 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.3 }}
      >
        <Input
          type="email"
          placeholder="Enter Your Email"
          className="bg-black/50 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 flex-1 h-12 rounded-full px-6 font-light min-w-0"
        />
        <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-medium px-8 py-3 h-12 rounded-full whitespace-nowrap transition-all duration-200 relative overflow-hidden group">
          Join The Waitlist
        </Button>
      </motion.div> */}

      {/* Learn More Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.5 }}
        className="mb-8"
      >
        <Button
          className="bg-gradient-to-r from-[#ff6b35] to-[#df500f] text-white font-semibold px-8 py-3 h-12 rounded-full whitespace-nowrap shadow-lg hover:from-[#df500f] hover:to-[#ff6b35] transition-all duration-200"
          onClick={() => {
            const bento = document.getElementById('bento');
            if (bento) {
              bento.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Learn More
        </Button>
      </motion.div>

      {/* Waitlist Counter */}
      

      {/* Social Media Icons */}
      {/*
      <motion.div
        className="flex items-center space-x-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.6 }}
      >
        <Logos />
      </motion.div>
      */}
    </motion.div>
  );
}
