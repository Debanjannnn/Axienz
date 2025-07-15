"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"
import Link from "next/link"
import type { JSX } from "react/jsx-runtime"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string
    link: string
    icon?: JSX.Element
  }[]
  className?: string
}) => {
  const { scrollYProgress } = useScroll()
  const [visible, setVisible] = useState(true) // Set to true initially to make it visible on load
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current! - scrollYProgress.getPrevious()!
      if (scrollYProgress.get() < 0.05) {
        setVisible(true) // Make the navbar visible when at the top
      } else {
        setVisible(direction < 0) // Show the navbar when scrolling down
      }
    }
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 50,
          damping: 15,
        }}
        className={cn(
          "flex max-w-7xl w-full mx-auto border border-white/20 dark:border-gray-300/20 rounded-3xl bg-white/10 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,0.1),0px_0px_0px_1px_rgba(255,255,255,0.05)] z-[5000] px-8 py-4 items-center justify-between space-x-4 relative fixed top-6 inset-x-6",
          className,
        )}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 z-[-1] bg-gradient-to-r from-white/5 via-gray-100/10 to-white/5 rounded-3xl"
          animate={{
            scale: [1, 1.03, 0.97, 1.02, 1],
            y: [0, -2, 3, -2, 0],
            rotate: [0, 0.5, -0.5, 0.3, 0],
            opacity: [0.3, 0.5, 0.4, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />

        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img src="/icons/legacyonchainfav.png" alt="Qubik" width={36} height={36} className="rounded-full" />
          <span className={cn("text-xl font-semibold text-black dark:text-white", poppins.className)}>Axienz</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-8">
          {navItems.map((navItem: any, idx: number) => (
            <Link
              key={`link-${idx}`}
              href={navItem.link}
              className={cn(
                "relative text-black dark:text-black items-center flex space-x-1 hover:text-gray-600 transition-colors py-2",
                poppins.className,
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
            </Link>
          ))}
        </div>

        {/* Create Will Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "border text-sm font-medium relative border-white/20 text-black dark:text-black px-8 py-3 rounded-2xl hover:bg-white/20 transition-colors bg-white/10",
              poppins.className,
            )}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            Create Will
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col overflow-hidden z-[6000]"
              >
                <DropdownItem href="/create-will/simple" text="Create Simple Will" />
                <DropdownItem href="/create-will/customized" text="Create Customized Will" />
                <DropdownItem href="/check-my-will" text="Check My Will" isLast />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

const DropdownItem = ({ href, text, isLast = false }: { href: string; text: string; isLast?: boolean }) => (
  <Link
    href={href}
    className={cn(
      "text-sm text-gray-700 hover:text-black transition-colors py-3 px-5 hover:bg-white/20",
      isLast ? "rounded-b-2xl" : "",
      "first:rounded-t-2xl",
      poppins.className,
    )}
  >
    {text}
  </Link>
)
