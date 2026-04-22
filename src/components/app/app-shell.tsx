"use client";

import { useState } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { MobileSidebar } from "@/components/app/mobile-sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { SidebarMobileTopBar } from "@/components/app/sidebar-mobile-top-bar";
import { TimeZoneMismatchNotice } from "@/components/app/time-zone-mismatch-notice";
import { UnsavedChangesDialog } from "@/components/app/unsaved-changes-dialog";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-72">
        <SidebarMobileTopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 pb-20 sm:px-6 lg:px-8 lg:pb-6">
          <TimeZoneMismatchNotice />
          {children}
        </main>
      </div>
      <MobileNav />
      <UnsavedChangesDialog />
    </div>
  );
}
