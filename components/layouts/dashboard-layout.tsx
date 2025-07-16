"use client";

import React from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div
      className="flex min-h-screen relative overflow-hidden"
      style={{
        background: `
          linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 20%, #000000 100%),
          url('/images/CORE.png')
        `,
        backgroundPosition: "top center, top center",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "100% auto, 100% auto",
        backgroundBlendMode: "normal, normal",
      }}
    >
      {/* Background overlay to maintain the dark aesthetic */}
      <div className="absolute inset-0 bg-[#120b03]/80 backdrop-blur-[1px]" />

      {/* Floating particles background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <SidebarNav />
      <main className={cn("flex-1 relative z-10 overflow-auto", className)}>
        {children}
      </main>
    </div>
  );
}
