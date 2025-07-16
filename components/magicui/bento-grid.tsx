"use client"

import { Clock, FileText, Leaf, Code, ChevronRight, Lock, Users, Database } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import Link from "next/link"
// import { AuroraText } from "@/components/magicui/aurora-text" // Uncomment if available

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export default function BentoGrid() {
  // Animation variants
  const cardVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * index,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const iconVariants: Variants = {
    initial: {
      scale: 0.8,
      opacity: 0.5,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }

  const arrowVariants: Variants = {
    initial: { x: -5 },
    hover: {
      x: 5,
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        duration: 0.8,
      },
    },
  }

  return (
    <div className={cn("relative text-white py-10 px-4 md:px-6 z-10 font-thin min-h-screen", poppins.className)}>
      {/* SVG Gradients for icons */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2e3192" />
          <stop offset="100%" stopColor="#1b1e4b" />
        </linearGradient>
        <linearGradient id="chevron-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#2e3192" />
        </linearGradient>
      </svg>

      {/* Heading */}
      <motion.h1
        className={cn("text-3xl md:text-4xl lg:text-5xl font-thin text-center mb-8", poppins.className)}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* <AuroraText colors={["#df500f", "#ff6b35", "#fff"]}> */}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2e3192] via-white to-[#1b1e4b]">Why Choose Our Digital Will dApp?</span>
        {/* </AuroraText> */}
        <br />
        <span className="text-xl md:text-2xl font-light text-white/70 ">
          Fast, affordable, and secure digital wills—Built on BNB Chain.
        </span>
      </motion.h1>

      {/* Main feature banner */}
      <Link href="/create-will">
        <motion.div
          className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/20 relative mb-4 group shadow-lg cursor-pointer"
          initial="initial"
          animate="animate"
          whileHover="hover"
          //@ts-ignore
          variants={cardVariants}
          custom={0}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white to-[#2e3192] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
          <div className="relative z-10 p-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-300/80 mb-2 font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#2e3192] transition-colors duration-300">
                CREATE YOUR WILL
              </p>
              <h2 className="text-4xl font-thin mb-2 group-hover:text-white">
                Set up your digital legacy
                <br />
                in minutes.
              </h2>
            </div>
            <motion.div variants={arrowVariants}>
              <ChevronRight
                className="w-8 h-8 text-white group-hover:text-gray-400 transition-colors duration-300"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
        </motion.div>
      </Link>

      {/* Grid layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* First row: 3 columns */}
        <Link href="/" className="col-span-12 md:col-span-4">
          <motion.div
            className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col h-full relative group overflow-hidden shadow-lg cursor-pointer"
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            custom={1}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-[#2e3192] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-xs uppercase text-gray-300/80 mb-6 font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#2e3192] transition-colors duration-300">
                INSTANT EXECUTION
              </p>
              <div className="flex-grow flex items-center justify-center mb-8">
                <motion.div variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
                  <Clock className="w-24 h-24 text-gray-400" />
                </motion.div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <h3 className="text-2xl font-thin text-gray-300">
                  No waiting,
                  <br />
                  no congestion
                </h3>
                <motion.div variants={arrowVariants}>
                  <ChevronRight
                    className="w-6 h-6 text-white group-hover:text-gray-400 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Link>
        <Link href="/" className="col-span-12 md:col-span-4">
          <motion.div
            className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col h-full relative group overflow-hidden shadow-lg cursor-pointer"
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            custom={2}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-[#2e3192] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-xs uppercase text-gray-300/80 mb-6 font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#2e3192] transition-colors duration-300">
                ULTRA-LOW FEES
              </p>
              <div className="flex-grow flex items-center justify-center mb-8">
                <motion.div variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
                  <FileText className="w-24 h-24 text-gray-400" />
                </motion.div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <h3 className="text-2xl font-thin text-gray-300">
                  Affordable for everyone,
                  <br />
                  always
                </h3>
                <motion.div variants={arrowVariants}>
                  <ChevronRight
                    className="w-6 h-6 text-white group-hover:text-gray-400 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Link>
        <Link href="/" className="col-span-12 md:col-span-4">
          <motion.div
            className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col h-full relative group overflow-hidden shadow-lg cursor-pointer"
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            custom={3}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-[#2e3192] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-xs uppercase text-gray-300/80 mb-6 font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#2e3192] transition-colors duration-300">
                ECO-FRIENDLY LEGACY
              </p>
              <div className="flex-grow flex items-center justify-center mb-8">
                <motion.div variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
                  <Leaf className="w-24 h-24 text-gray-400" />
                </motion.div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <h3 className="text-2xl font-thin text-gray-300">
                  Leave a mark,
                  <br />
                  not a footprint
                </h3>
                <motion.div variants={arrowVariants}>
                  <ChevronRight
                    className="w-6 h-6 text-white group-hover:text-gray-400 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Link>
        {/* Second row: 2 columns, add margin-top for spacing */}
        <Link href="/" className="col-span-12 md:col-span-6 mt-4">
          <motion.div
            className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col h-full relative group overflow-hidden shadow-lg cursor-pointer"
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            custom={4}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-[#2e3192] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-xs uppercase text-gray-300/80 mb-6 font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#2e3192] transition-colors duration-300">
                BNB CHAIN SECURITY
              </p>
              <div className="flex-grow flex items-center justify-center mb-8">
                <motion.div variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
                  <Code className="w-24 h-24 text-gray-400" />
                </motion.div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <h3 className="text-2xl font-thin text-gray-300">
                  Built on BNB Chain
                  <br />
                  for security & trust
                </h3>
                <motion.div variants={arrowVariants}>
                  <ChevronRight
                    className="w-6 h-6 text-white group-hover:text-gray-400 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Link>
        <Link href="/" className="col-span-12 md:col-span-6 mt-4">
          <motion.div
            className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col h-full relative group overflow-hidden shadow-lg cursor-pointer"
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            custom={5}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-[#2e3192] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-xs uppercase text-gray-300/80 mb-6 font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#2e3192] transition-colors duration-300">
                AUDITED CONTRACTS
              </p>
              <div className="flex-grow flex items-center justify-center mb-8">
                <motion.div variants={iconVariants} initial="initial" animate="animate" whileHover="hover">
                  <Lock className="w-24 h-24 text-gray-400" />
                </motion.div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <h3 className="text-2xl font-thin text-gray-300">
                  Security audits
                  <br />
                  for peace of mind
                </h3>
                <motion.div variants={arrowVariants}>
                  <ChevronRight
                    className="w-6 h-6 text-white group-hover:text-gray-400 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
