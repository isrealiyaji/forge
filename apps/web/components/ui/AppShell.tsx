"use client";

import { useState, type ReactNode } from "react";
import { Menu, X, Bell } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { NAV_CONFIG, type Role } from "@/lib/nav-config";

type AppShellProps = {
  role: Role;
  personName: string;
  children: ReactNode;
};

const AppShell = ({ role, personName, children }: AppShellProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { roleLabel, items } = NAV_CONFIG[role];

  return (
    <div className="flex h-screen overflow-hidden bg-ground">
      {/* Desktop sidebar: fixed height, always fully visible, never scrolls with the page */}
      <div className="hidden md:flex md:h-screen">
        <Sidebar roleLabel={roleLabel} personName={personName} items={items} />
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-ground">
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="text-ink-inverse"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <Sidebar roleLabel={roleLabel} personName={personName} items={items} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar: static, spans the content area, never scrolls away */}
        <header className="flex shrink-0 items-center border-b border-line-dark bg-ground px-4 py-3 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="text-ink-inverse"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
            <a href="/" className="font-display text-lg tracking-poster text-ink-inverse">
              FORGE
            </a>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Notifications"
              className="relative text-ink-inverse transition-opacity hover:opacity-70"
            >
              <Bell size={20} strokeWidth={2} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Only this scrolls */}
        <main className="flex-1 overflow-y-auto px-5 py-8 md:px-12 md:py-10">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
