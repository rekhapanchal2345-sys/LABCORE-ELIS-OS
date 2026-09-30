
"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import NotificationToast from "@/components/common/NotificationToast";
  
interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Set light theme for application (only on client side)
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.removeAttribute('data-theme');
      }
    };
  }, []);

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary)] relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-[260px]' : 'ml-0'} dashboard-main`}
      >
        {/* Header */}
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="page-container">
          {children}
        </main>
      </div>

      {/* Global Notification Toast */}
      <NotificationToast />

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 900px) {
          .dashboard-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
