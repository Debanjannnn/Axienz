"use client"

import { motion } from "framer-motion"

const partners = [
  { name: "Telos", logo: "/telos-logo.svg" },
  { name: "EVM+", logo: "/evm-plus-logo.svg" },
  { name: "Deciduous", logo: "/deciduous-logo.svg" },
  { name: "Telos Foundation", logo: "/telos-foundation-logo.svg" },
  { name: "TelosEVM", logo: "/telos-evm-logo.svg" },
]

export default function Partners() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-display mb-4">Trusted by Leading Organizations</h2>
        </div>
        <div className="flex justify-center items-center space-x-12">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img src={partner.logo || "/placeholder.svg"} alt={partner.name} className="h-8 w-auto" />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
    </section>
  )
}

