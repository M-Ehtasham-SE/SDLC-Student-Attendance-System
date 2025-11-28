"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, TrendingUp, BarChart3, Plus, FileText, Settings } from "lucide-react"

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState<number | null>(null)
  const [totalTeachers, setTotalTeachers] = useState<number | null>(null)
  const [activeCourses, setActiveCourses] = useState<number | null>(null)
  const [avgAttendance, setAvgAttendance] = useState<string>("N/A")
  const [settingsOpen, setSettingsOpen] = useState(false)

  const computeStats = () => {
    try {
      const usersRaw = localStorage.getItem("users")
      const users = usersRaw ? (JSON.parse(usersRaw) as Array<{ username: string; role: string }>) : []
      const students = users.filter((u) => u.role === "student").length
      const teachers = users.filter((u) => u.role === "teacher").length

      const coursesRaw = localStorage.getItem("courses")
      const courses = coursesRaw ? (JSON.parse(coursesRaw) as Array<any>) : []
      const active = courses.filter((c) => c.status === "active").length

      // attendance stored as { [courseId]: [{ date, status }] }
      const attendanceRaw = localStorage.getItem("attendance")
      let avg = "N/A"
      if (attendanceRaw) {
        try {
          const attendance = JSON.parse(attendanceRaw) as Record<string, Array<{ status: string }>>
          let totalPresent = 0
          let totalRecords = 0
          for (const key in attendance) {
            const recs = attendance[key] || []
            totalRecords += recs.length
            totalPresent += recs.filter((r) => r.status === "present").length
          }
          if (totalRecords > 0) {
            avg = `${Math.round((totalPresent / totalRecords) * 100)}%`
          }
        } catch (e) {
          console.error(e)
        }
      }

      setTotalStudents(students)
      setTotalTeachers(teachers)
      setActiveCourses(active)
      setAvgAttendance(avg)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    computeStats()

    const onStorage = (e: StorageEvent) => {
      if (e.key === "users" || e.key === "courses" || e.key === "attendance" || e.key === "activities") {
        computeStats()
        loadActivities()
      }
    }
    window.addEventListener("storage", onStorage)
    // also listen for custom same-tab events and recompute stats
    const onActivities = () => {
      computeStats()
      loadActivities()
    }
    window.addEventListener("activities-updated", onActivities)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("activities-updated", onActivities)
    }
  }, [])

  // Activities
  const [activities, setActivities] = useState<Array<{ action: string; timestamp: number }>>([])

  const loadActivities = () => {
    try {
      const raw = localStorage.getItem("activities")
      const list = raw ? (JSON.parse(raw) as Array<{ action: string; timestamp: number }>) : []
      // sort newest first
      list.sort((a, b) => b.timestamp - a.timestamp)
      setActivities(list)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  const addActivity = (action: string) => {
    try {
      const raw = localStorage.getItem("activities")
      const list = raw ? (JSON.parse(raw) as Array<{ action: string; timestamp: number }>) : []
      list.push({ action, timestamp: Date.now() })
      localStorage.setItem("activities", JSON.stringify(list))
      window.dispatchEvent(new Event("activities-updated"))
    } catch (e) {
      console.error(e)
    }
  }

  const exportAllData = () => {
    try {
      const keys = ["users", "courses", "attendance", "results", "activities", "user"]
      const payload: Record<string, any> = {}
      keys.forEach((k) => {
        const raw = localStorage.getItem(k)
        payload[k] = raw ? JSON.parse(raw) : null
      })
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `export-all-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      addActivity("Exported all local data from Settings")
    } catch (e) {
      console.error(e)
    }
  }

  const resetDemoData = () => {
    if (!confirm("Reset demo data? This will remove users, courses, attendance, results and activities from localStorage.")) return
    try {
      const keys = ["users", "courses", "attendance", "results", "activities", "user"]
      keys.forEach((k) => localStorage.removeItem(k))
      addActivity("Reset demo data via Settings")
      computeStats()
      loadActivities()
    } catch (e) {
      console.error(e)
    }
  }

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const days = Math.floor(hr / 24)
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Manage your educational institution</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Total Students</p>
            <p className="text-3xl font-bold text-slate-900">{totalStudents !== null ? totalStudents : "—"}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Total Teachers</p>
            <p className="text-3xl font-bold text-slate-900">{totalTeachers !== null ? totalTeachers : "—"}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Active Courses</p>
            <p className="text-3xl font-bold text-slate-900">{activeCourses !== null ? activeCourses : "—"}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Avg Attendance</p>
            <p className="text-3xl font-bold text-slate-900">{avgAttendance}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 card-base p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activities</h2>
                <div className="space-y-4">
                  {activities.length === 0 && (
                    <div className="text-sm text-muted-foreground">No recent activity</div>
                  )}
                  {activities.slice(0, 8).map((activity, i) => (
                    <div key={i} className="flex items-start justify-between pb-4 border-b border-slate-200 last:border-0">
                      <div>
                        <p className="text-slate-900 font-medium text-sm">{activity.action}</p>
                        <p className="text-slate-500 text-xs mt-1">{timeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
          </div>

          {/* Quick Actions */}
          <div className="card-base p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/admin/users" className="btn-primary flex items-center justify-center gap-2 w-full">
                <Plus className="w-4 h-4" /> Add User
              </a>
              <a href="/admin/courses" className="btn-primary flex items-center justify-center gap-2 w-full">
                <BookOpen className="w-4 h-4" /> Create Course
              </a>
              <a href="/admin/reports" className="btn-secondary flex items-center justify-center gap-2 w-full">
                <FileText className="w-4 h-4" /> Reports
              </a>
              <button onClick={() => setSettingsOpen(true)} className="btn-secondary flex items-center justify-center gap-2 w-full">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
          {settingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSettingsOpen(false)} />
              <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Settings</h3>
                  <button onClick={() => setSettingsOpen(false)} className="text-slate-500 hover:text-slate-700">Close</button>
                </div>
                <p className="text-sm text-slate-600 mb-4">Quick admin settings — export or reset demo data.</p>
                <div className="space-y-3">
                  <button onClick={exportAllData} className="w-full btn-primary">
                    Export All Local Data
                  </button>
                  <button onClick={resetDemoData} className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition-colors">
                    Reset Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
