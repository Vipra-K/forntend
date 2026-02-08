"use client";

import React from "react";
import {
  FileText,
  LayoutGrid,
  Settings,
  LogOut,
  User,
  Users,
  Activity,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

/* ── Skeleton for user profile card ──────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-9 w-full bg-slate-50 rounded-lg animate-pulse" />
    </div>
  );
}

/** Capitalise first letter of each word */
function formatDisplayName(
  user: { name?: string; email: string } | null,
): string {
  if (!user) return "";
  if (user.name && user.name.trim()) {
    return user.name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  // Fallback: capitalised email local part
  const local = user.email.split("@")[0] || "";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/** Get initials from name (max 2 chars) */
function getInitials(user: { name?: string; email: string } | null): string {
  if (!user) return "";
  if (user.name && user.name.trim()) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }
  return user.email.substring(0, 2).toUpperCase();
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const navItems = [
    { label: "My Forms", icon: FileText, path: "/dashboard" },
    { label: "Leads", icon: Users, path: "/dashboard/leads" },
    {
      label: "Activity Logs",
      icon: Activity,
      path: "/dashboard/activity-logs",
    },
    { label: "Templates", icon: LayoutGrid, path: "/dashboard/templates" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 border-r border-slate-200 flex flex-col h-screen bg-slate-50/30">
      {/* Brand */}
      <div className="p-8 pb-10 flex items-center space-x-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">
          FormFlow
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path && router.push(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              isActive(item.path || "")
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-slate-200/60">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black">
                {getInitials(user)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {formatDisplayName(user)}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
