import { motion } from "framer-motion";
import React from "react";

interface DotBackgroundProps {
    children: React.ReactNode;
}

export function DotBackground({ children }: DotBackgroundProps) {
    return (
        <motion.div
            className="relative h-full w-full bg-black dark:bg-black dark:bg-dot-white/[0.25] bg-dot-black/[1]"
            animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
                duration: 300, // Slow down the animation (increased duration for slower movement)
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
            }}
        >
            {/* Wrapped children */}
            {children}
        </motion.div>
    );
}
