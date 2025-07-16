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
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <span className="text-black font-bold text-lg">W</span>
          </div>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              animate={isCollapsed ? "collapsed" : "expanded"}
              className="flex-1"
            >
              <h1 className="text-xl font-bold text-white">Axienz</h1>
              <p className="text-xs text-gray-400">Secure Your Legacy</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Wallet Info */}
      {isConnected && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-green-500" />
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
                <p className="text-xs text-gray-400">
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
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50",
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
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full text-gray-400 hover:text-white hidden lg:flex"
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
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900/80 backdrop-blur-sm border border-gray-700"
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
            className="fixed left-0 top-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-50 lg:hidden"
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
          "hidden lg:flex flex-col bg-gray-900 border-r border-gray-800 h-screen sticky top-0",
          className,
        )}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
