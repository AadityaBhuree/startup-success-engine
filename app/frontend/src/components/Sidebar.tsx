"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/5 hidden md:flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Startup Intelligence
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                active
                  ? "text-white bg-white/10 border border-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "opacity-100" : "opacity-60"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-sm font-bold shadow-lg">
            AB
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Aditya Bhure</span>
            <span className="text-xs text-gray-400">Elite Engineer</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
