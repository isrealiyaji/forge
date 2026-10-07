"use client";

import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { authApi } from "@/lib/api/auth";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

type SidebarProps = {
  roleLabel: string;
  personName: string;
  items: NavItem[];
};

const Sidebar = ({ roleLabel, personName, items }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authApi.logout().catch(() => {});
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line-dark bg-ground px-4 py-6">
      <div className="mb-8 px-2">
        <a href="/" className="font-display text-2xl tracking-poster text-ink-inverse hover:opacity-80">
          FORGE
        </a>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">{roleLabel}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          if (!item.href) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium text-muted-inverse/50"
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={2} />
                  {item.label}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-inverse/40">Soon</span>
              </div>
            );
          }
          const active = item.href === pathname;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-panel text-ink" : "text-ink-inverse/80 hover:bg-panel/10 hover:text-ink-inverse"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-line-dark px-2 pt-4">
        <p className="text-sm font-semibold text-ink-inverse">{personName}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs font-medium text-muted-inverse hover:text-ink-inverse"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
export type { NavItem };
