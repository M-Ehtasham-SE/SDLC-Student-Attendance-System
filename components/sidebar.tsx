"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/auth"

interface NavItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  items: NavItem[]
  title: string
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold text-sidebar-primary">{title}</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full group ${pathname === item.href
                ? "bg-sidebar-primary/20 text-sidebar-primary font-semibold shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-primary hover:translate-x-1"
              }`}
          >
            <span className={`text-lg transition-transform group-hover:scale-110 ${pathname === item.href ? "scale-110" : ""}`}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
