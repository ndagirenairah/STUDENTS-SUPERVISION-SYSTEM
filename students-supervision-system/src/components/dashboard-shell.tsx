"use client";

import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  accent = "blue",
  navItems,
  activeId,
  onNavigate,
  logoutAction,
  children,
}: {
  title: string;
  subtitle: string;
  accent?: "blue" | "indigo" | "violet" | "emerald";
  navItems: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  logoutAction: () => void;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const accentMap = {
    blue: {
      bar: "bg-blue-600",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      ring: "focus:ring-blue-500",
      badge: "bg-blue-100 text-blue-700",
    },
    indigo: {
      bar: "bg-indigo-600",
      active: "bg-indigo-50 text-indigo-700 border-indigo-200",
      ring: "focus:ring-indigo-500",
      badge: "bg-indigo-100 text-indigo-700",
    },
    violet: {
      bar: "bg-violet-600",
      active: "bg-violet-50 text-violet-700 border-violet-200",
      ring: "focus:ring-violet-500",
      badge: "bg-violet-100 text-violet-700",
    },
    emerald: {
      bar: "bg-emerald-600",
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ring: "focus:ring-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
    },
  }[accent];

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onNavigate(item.id);
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
              active
                ? accentMap.active
                : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="shrink-0 opacity-90">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${accentMap.bar}`}
              >
                <span className="text-lg font-bold">SS</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Supervision
                </p>
                <p className="text-xs text-slate-500">Student System</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">{Nav}</div>
          <div className="border-t border-slate-200 p-4">
            <div className={`mb-3 rounded-xl px-3 py-2 text-xs ${accentMap.badge}`}>
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 opacity-80">{subtitle}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle navigation"
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {title}
                  </h1>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>
              <form action={logoutAction} className="lg:hidden">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
            {mobileOpen && (
              <div className="border-t border-slate-200 bg-white lg:hidden">
                {Nav}
              </div>
            )}
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        ○
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-sm text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      {label}
    </div>
  );
}
