'use client';

import React, { useState } from 'react';
import { RoleProvider } from '@/context/RoleContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RoleProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-gray-50/60 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
            {/* Live Demo Role Switcher Banner */}
            <RoleSwitcher />

            <div className="flex flex-1 w-full">
              {/* Sidebar */}
              <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <Navbar onOpenMobileMenu={() => setIsMobileOpen(true)} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
                  {children}
                </main>
              </div>
            </div>
          </div>
        </ToastProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}
