"use client"

import { FileText, Shield, Edit } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
// import { AuroraText } from "@/components/magicui/aurora-text"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export default function HowItWorks() {
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
        delay: 0.2 * index,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -8,
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
      scale: 1.15,
      rotate: [0, -8, 8, -8, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  }

  const steps = [
    {
      icon: FileText,
      step: "Step 1",
      title: "Set Up & Fund Your Will",
      description:
        "Initialize your will by specifying a recipient and the amount to be inherited. Funds are securely locked in the contract on the Aptos blockchain.",
      features: [
        "Specify recipient address",
        "Choose inheritance amount",
        "Funds locked in contract",
        "Immutable blockchain record",
        "Global registry for recipients",
        "Aptos network security",
      ],
    },
    {
      icon: Shield,
      step: "Step 2",
      title: "Stay Active with Pings",
      description:
        "Periodically 'ping' the contract to prove you're active. If you don't ping within the set timeout, your will becomes claimable by the recipient.",
      features: [
        "Ping to show activity",
        "Customizable timeout period",
        "Automated monitoring",
        "No third-party required",
        "Transparent status tracking",
        "Owner-controlled updates",
      ],
    },
    {
      icon: Edit,
      step: "Step 3",
      title: "Claim by Recipient",
      description:
        "If the timeout passes without a ping, the recipient can claim the locked assets. The process is secure, automated, and transparent.",
      features: [
        "Automatic eligibility check",
        "Secure asset transfer",
        "No manual intervention",
        "View claimable wills",
        "Instant execution",
        "Full auditability",
      ],
    },
  ]

  return (
    <div className={cn("relative text-white py-20 px-4 md:px-6 z-10 bg-[#0d0f12]", poppins.className)}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[#0e090200] pointer-events-none"></div>

      {/* SVG Gradients for icons */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
        <linearGradient id="step-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="white" />
        </linearGradient>
      </svg>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className={cn("text-3xl md:text-4xl lg:text-5xl font-thin text-center mb-4 text-white", poppins.className)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#2e3192] via-white to-[#1b1e4b]">How It Works</span>
          </motion.h1>
          <motion.p
            className="text-white/70 text-2xl font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Create your digital legacy in three simple steps on the BNB Chain.
          </motion.p>
        </motion.div>

        {/* Steps Grid - Now 3 columns, centered */}
        <div className="grid md:grid-cols-3 gap-8 justify-center items-center text-center">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center relative group overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(192,192,192,0.2)] h-full text-center"
                initial="initial"
                animate="animate"
                whileHover="hover"
                variants={cardVariants}
                custom={index}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>

                {/* Step indicator */}
                <div className="flex flex-col items-center justify-between mb-6 w-full">
                  <motion.div
                    className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden mb-2"
                    variants={iconVariants}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <IconComponent
                      className="w-8 h-8 text-[#C0C0C0] group-hover:text-white transition-colors duration-300"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                  <span className="text-sm bg-gradient-to-r from-[#C0C0C0] to-white bg-clip-text text-transparent font-medium">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3
                  className={cn(
                    "text-2xl font-thin mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#C0C0C0] transition-colors duration-300 text-center",
                    poppins.className,
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed mb-6 font-light text-sm text-center">{step.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-grow flex flex-col items-center text-center">
                  {step.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-center text-xs text-white/70 justify-center text-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + featureIndex * 0.1, duration: 0.5 }}
                    >
                      <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="font-light">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Action indicator */}
                <div className="mt-auto pt-4">
                  <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#C0C0C0] to-transparent rounded-full"></div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Connection lines between steps (visible on lg and larger screens) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full z-0 pointer-events-none">
          <div className="relative h-0.5 bg-gradient-to-r from-transparent via-[#C0C0C0]/30 to-transparent w-[70%] mx-auto"></div>
        </div>
      </div>
    </div>
  )
}