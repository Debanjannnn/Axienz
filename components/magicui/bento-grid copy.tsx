"use client"

import { ChevronRight, Clock, Code, Leaf, Database, FileText } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
// import { AuroraText } from "@/components/magicui/aurora-text"
import Link from "next/link"
import AnimatedListDemo from "@/components/Notification"
// import { Notification } from "@/components/Notification"

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
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className={cn("relative text-white px-4 md:px-6 z-10 py-20", poppins.className)}>
      <div className="w-full max-w-[95vw] lg:max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 grid-rows-6 gap-4 h-auto ">
          <motion.h1
            className={cn("text-3xl md:text-4xl lg:text-5xl font-thin text-center mb-32 col-span-12 ", poppins.className)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-5xl text-white/80 leading-tight">Why Choose Our Digital Will dApp?</span>
            <br />
            <span className="text-xl md:text-2xl font-light text-white/70 ">
              Fast, affordable, and secure digital wills—Built on Aptos.
            </span>
          </motion.h1>

          {/* Fast Transactions - Top Left (Large) */}
          <Link href="/" className="col-span-12 md:col-span-4 row-span-3 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-2xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={0}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#df500f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-thin leading-tight mb-2 text-white">
                      Instant Will Execution
                    </h2>
                    <p className="text-white/90 text-sm font-light">No waiting, no congestion</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Block Time</p>
                    <p className="text-3xl font-bold">0.5s</p>
                    <p className="text-green-300 text-sm">Your wishes, executed instantly</p>
                  </div>
                  <p className="text-white/70 text-sm font-light">
                    Our dApp leverages Aptos's parallel execution for ultra-fast, reliable will fulfillment—so your loved ones never wait.
                  </p>
                </div>
                
              </div>
            </motion.div>
          </Link>

          {/* Low-Cost Operations - Top Center */}
          <Link href="/" className="col-span-12 md:col-span-4 row-span-3 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={1}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#df500f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-thin mb-2 text-white">Ultra-Low Fees</h3>
                  <p className="text-white/90 text-sm font-light">Affordable for everyone, always</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <div className="text-red-400 text-xs mb-1">Ethereum</div>
                    <div className="text-white font-bold text-lg">$5-50</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                    <div className="text-green-400 text-xs mb-1">Aptos</div>
                    <div className="text-white font-bold text-lg">$0.01</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                    <div className="text-blue-400 text-xs mb-1">Solana</div>
                    <div className="text-white font-bold text-sm">$0.00025</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                    <div className="text-purple-400 text-xs mb-1">Our dApp</div>
                    <div className="text-white font-bold text-sm">No hidden costs</div>
                  </div>
                </div>
                
              </div>
            </motion.div>
          </Link>

          {/* EVM Compatibility - Top Right */}
          <Link href="/" className="col-span-12 md:col-span-4 row-span-2 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={2}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#df500f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-thin text-white">Why Aptos, Not Ethereum or Solana?</h3>
                    <p className="text-white/90 text-sm font-light">Security, speed, and future-proofing</p>
                  </div>
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Aptos:</span>
                    <span className="text-green-400 text-xs">Resource-oriented, parallel, upgradable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Ethereum:</span>
                    <span className="text-yellow-400 text-xs">Expensive, slow, contract-based</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Solana:</span>
                    <span className="text-blue-400 text-xs">Fast, but less secure for sensitive assets</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold">Aptos = Peace of Mind</p>
                    <p className="text-green-400 text-xs">Best for digital legacy</p>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Data Transparency - Middle Right */}
          <Link href="/" className="col-span-12 md:col-span-4 row-span-1 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={3}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#df500f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative z-10 h-full flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-thin text-white">Transparent & Trustless</h3>
                  <p className="text-lg font-thin text-white/90">No middlemen, no secrets</p>
                </div>
                <div className="w-10 h-10 bg-[#df500f]/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Database className="w-5 h-5 text-[#df500f]" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Will Creation - Bottom Left */}
          <Link href="/" className="col-span-12 md:col-span-3 row-span-3 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={4}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#df500f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#df500f] to-[#ff6b35] rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/10">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border border-white/20">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 bg-[#df500f] rounded-full opacity-60"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        delay: dot * 0.3,
                      }}
                    />
                  ))}
                </div>
                <h3 className="text-xl font-thin mb-3 text-white">Create Your Will</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6 font-light">
                  Set up your digital legacy in minutes. Our dApp automates will creation and asset distribution, secured by Aptos.
                </p>
                <div className="mt-auto">
                  <ChevronRight className="text-[#df500f] w-6 h-6" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Eco-Friendly Features - Bottom Center */}
          <Link href="/" className="col-span-12 md:col-span-5 row-span-3 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={5}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#df500f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-thin mb-2 text-white">Eco-Friendly Legacy</h3>
                  <p className="text-white/90 text-sm font-light">Leave a mark, not a footprint</p>
                </div>
                <div className="space-y-4 flex-1">
                  {[
                    {
                      metric: "Energy Efficiency",
                      value: "99% Less",
                      detail: "vs Traditional Chains",
                      color: "text-green-400",
                    },
                    {
                      metric: "Carbon Footprint",
                      value: "0.001 kWh",
                      detail: "per transaction",
                      color: "text-blue-400",
                    },
                    {
                      metric: "Sustainability",
                      value: "100% Green",
                      detail: "renewable powered",
                      color: "text-emerald-400",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#df500f]/20 rounded-full flex items-center justify-center border border-white/10">
                          <Leaf className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{item.metric}</div>
                          <div className="text-xs text-white/50">{item.detail}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <ChevronRight className="text-[#df500f] w-6 h-6" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Smart Contract Features - Bottom Right */}
          <Link href="/" className="col-span-12 md:col-span-4 row-span-3 group cursor-pointer">
            <motion.div
              className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={6}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>

              <div className="relative z-10 h-full flex flex-col">
                {/* Smart Contract Cards */}
                <div className="mb-4 flex-1 flex flex-col justify-start">
                  <AnimatedListDemo />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )
}
