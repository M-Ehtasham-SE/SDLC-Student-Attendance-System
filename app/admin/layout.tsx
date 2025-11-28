"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type User, getUser } from "@/lib/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Courses", href: "/admin/courses", icon: "📚" },
    { label: "Reports", href: "/admin/reports", icon: "📈" },
  ]

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <svg
        className="fixed inset-0 w-full h-full opacity-10 pointer-events-none z-0"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bookGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="bookGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="bookGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Book 1 */}
        <rect x="80" y="250" width="160" height="480" fill="url(#bookGrad1)" rx="8" />
        {/* Book 2 */}
        <rect x="320" y="200" width="160" height="520" fill="url(#bookGrad2)" rx="8" />
        {/* Book 3 */}
        <rect x="540" y="280" width="160" height="430" fill="url(#bookGrad3)" rx="8" />
        {/* Pen */}
        <line x1="750" y1="380" x2="920" y2="480" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
        <circle cx="920" cy="485" r="8" fill="#fbbf24" />
      </svg>

      <Sidebar items={sidebarItems} title="Admin Panel" />
      <main className="flex-1 overflow-auto relative z-10">{children}</main>
    </div>
  )
}
