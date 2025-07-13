"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-display mb-6">
              Smart Will Management
              <br />
              Dashboard
            </h2>
            <p className="text-gray-400 mb-8">
              Monitor your will&apos;s status, track milestone completions, and manage beneficiary distributions through our
              intuitive dashboard. Make updates in real-time and ensure your wishes are executed exactly as planned.
            </p>
            <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full text-sm transition-colors">
              View Demo
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-black/50 border-gray-800">
              <div className="p-6">
                <img
                  src="/dashboard-preview.svg"
                  alt="Dashboard Preview"
                  className="w-full rounded-lg border border-gray-800"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

