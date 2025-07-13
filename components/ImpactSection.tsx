"use client"

import { motion } from "framer-motion"

const stats = [
  { label: "Protected Assets", value: "$2.5B+" },
  { label: "Active Wills", value: "50,000+" },
  { label: "Charitable Impact", value: "$100M+" },
  { label: "Success Rate", value: "99.99%" },
]

export default function ImpactSection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-display mb-6">
              Making a Lasting
              <br />
              Impact Together
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of forward-thinking individuals who have already secured their legacy through our platform.
              Your impact can continue for generations to come.
            </p>
            <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full text-sm transition-colors">
              Learn More
            </button>
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-6"
              >
                <div className="text-2xl font-display text-emerald-400 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

