"use client";

import React from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <SidebarNav />
      <main className={cn("flex-1 overflow-hidden", className)}>
        {children}
      </main>
    </div>
  );
}
