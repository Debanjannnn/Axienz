"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Clock, Gift, FileSignature, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const CreateWill = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 px-4 relative overflow-hidden">
      {/* Background Gradient Overlay - subtle animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-gray-900 opacity-30 mix-blend-multiply pointer-events-none"
        animate={{
          x: ["-100%", "100%"],
          y: ["-50%", "50%"],
          rotate: [0, 360],
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Secure Your Legacy
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose the perfect digital will solution to protect your assets and loved ones
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full mb-16 relative z-10">
        {/* Standard Will Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="transition-transform duration-300" // Subtle card hover effect
        >
          <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Shield className="mr-3 text-blue-400" /> Standard Will
                </CardTitle>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 text-lg">
                Simple and secure inheritance for a single beneficiary with automatic time-based execution.
              </p>
              <ul className="space-y-4 text-gray-200 mb-8">
                <motion.li
                  className="flex items-start"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FileSignature className="mr-3 mt-1 text-green-400 flex-shrink-0" />
                  <span>Immutable Will: Assignments cannot be altered after creation, ensuring the testator&apos;s intent is permanent.</span>
                </motion.li>
                <motion.li
                  className="flex items-start"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Clock className="mr-3 mt-1 text-green-400 flex-shrink-0" />
                  <span>Automated Time Locks: The inheritance is automatically locked after 10 years of inactivity, resettable with the ping() function.</span>
                </motion.li>
                <motion.li
                  className="flex items-start"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <Gift className="mr-3 mt-1 text-green-400 flex-shrink-0" />
                  <span>Financial Safeguards: Assets are held in audited smart contracts until conditions are met.  Plus a 1-year cooldown.</span>
                </motion.li>
              </ul>
              <div className="flex justify-end">
                <Link href="/create-will/simple" passHref>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Setup My Will
                  </Button>
                </Link>

              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Will Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="transition-transform duration-300"
        >
          <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Users className="mr-3 text-purple-400" /> Milestone Will
                </CardTitle>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Coming Soon
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 text-lg">
                Advanced inheritance planning with conditional distributions and multiple beneficiaries.
              </p>
              <ul className="space-y-4 text-gray-200 mb-8 opacity-70">
                <motion.li
                  className="flex items-start"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Gift className="mr-3 mt-1 text-purple-400 flex-shrink-0" />
                  <span>Smart Distribution: Configure multiple beneficiaries with custom allocation rules and conditions.</span>
                </motion.li>
                <motion.li
                  className="flex items-start"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Clock className="mr-3 mt-1 text-purple-400 flex-shrink-0" />
                  <span>Time-Based Vesting: Create sophisticated distribution schedules based on time or specific events.</span>
                </motion.li>
                <motion.li
                  className="flex items-start"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <Shield className="mr-3 mt-1 text-purple-400 flex-shrink-0" />
                  <span>Enterprise-Grade Security: Immutable beneficiaries & claim validation.</span>
                </motion.li>
              </ul>
              <div className="flex justify-end">
                <Button variant="outline" disabled className="w-full sm:w-auto opacity-75">
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subtle Particle Background (Optional - Requires a library like react-tsparticles) */}
      {/*   <ParticlesComponent /> */}
    </div>
  );
};

export default CreateWill;