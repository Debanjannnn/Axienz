"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSmartWill } from "@/context/SmartWillContext";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Search,
  Gift,
  Wallet,
  Settings,
  Menu,
  X,
  Home,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: "Overview and analytics",
  },
  {
    title: "Create Will",
    href: "/create-will",
    icon: <PlusCircle className="w-5 h-5" />,
    description: "Create new digital will",
  },
  {
    title: "Check My Will",
    href: "/check-my-will",
    icon: <Search className="w-5 h-5" />,
    description: "View existing wills",
  },
  {
    title: "Claimables",
    href: "/claimables",
    icon: <Gift className="w-5 h-5" />,
    description: "Available inheritances",
  },
  {
    title: "Home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
    description: "Back to landing page",
  },
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { account, balance, isConnected } = useSmartWill();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "72px" },
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <img
            src="/icons/legacyonchainfav.png"
            alt="Axienz"
            width={40}
            height={40}
            className="rounded-full"
          />
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              animate={isCollapsed ? "collapsed" : "expanded"}
              className="flex-1"
            >
              <h1 className="text-xl font-bold text-white">Axienz</h1>
              <p className="text-xs text-amber-400">Secure Your Legacy</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Wallet Info */}
      {isConnected && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            {!isCollapsed && (
              <motion.div
                variants={itemVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {formatAddress(account || "")}
                </p>
                <p className="text-xs text-amber-400">
                  {parseFloat(balance).toFixed(4)} BNB
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10 hover:border hover:border-white/20",
                )}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && (
                  <motion.div
                    variants={itemVariants}
                    animate={isCollapsed ? "collapsed" : "expanded"}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.description}
                      </p>
                    )}
                  </motion.div>
                )}
                {item.badge && !isCollapsed && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-0 w-1 h-8 bg-amber-500 rounded-l-lg"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hidden lg:flex transition-all"
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isCollapsed ? "rotate-0" : "rotate-180",
            )}
          />
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black/40 backdrop-blur-md border border-white/20 shadow-lg"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-black/60 backdrop-blur-md border-r border-white/20 z-50 lg:hidden shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "hidden lg:flex flex-col bg-black/40 backdrop-blur-md border-r border-white/10 h-screen sticky top-0 shadow-2xl",
          className,
        )}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
