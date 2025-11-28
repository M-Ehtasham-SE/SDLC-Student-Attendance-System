"use client"

import { useState, useEffect } from "react"
import { Users, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { getUser } from "@/lib/auth"
import { initializeStudents } from "@/lib/setup-students"

export default function TeacherDashboard() {
  interface Course {
    id: string
    name: string
    code?: string
    teacher?: string
    students?: number
    status?: string
  }

  interface Student {
    id: string
    name: string
    courseId: string
    courseName: string
  }

  const [courses, setCourses] = useState<Course[]>([])
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [avgAttendance, setAvgAttendance] = useState<string>("N/A")
  const [pendingTasks, setPendingTasks] = useState<number>(0)
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [showStudentsModal, setShowStudentsModal] = useState(false)

  const loadCourses = () => {
    try {
      const raw = localStorage.getItem("courses")
      const parsed = raw ? (JSON.parse(raw) as Course[]) : []
      const user = getUser()
      // If teacher is signed in, show only their courses (match by username or teacher field). Otherwise show all.
      const filtered = parsed.filter((c) => {
        if (!user) return true
        const teacherField = (c.teacher || "").toString()
        return teacherField === user.username || teacherField.toLowerCase() === (user.username || "").toLowerCase()
      })
      if (filtered.length > 0) {
        setCourses(filtered)
        return
      }

      // fallback sample courses if none in storage
      setCourses([
        { id: "1", name: "Mathematics 101", students: 5 },
        { id: "2", name: "Advanced Calculus", students: 0 },
        { id: "3", name: "Statistics 201", students: 0 },
      ])
    } catch (e) {
      console.error(e)
    }
  }

  const loadEnrolledStudents = () => {
    try {
      const raw = localStorage.getItem("enrolledStudents")
      const students = raw ? (JSON.parse(raw) as Student[]) : []
      // filter to only students enrolled in teacher's courses
      const courseIds = new Set(courses.map((c) => c.id))
      const filtered = students.filter((s) => courseIds.has(s.courseId))
      setEnrolledStudents(filtered)
    } catch (e) {
      console.error(e)
    }
  }

  const computeStats = () => {
    try {
      // total students = count from enrolledStudents list
      setTotalStudents(enrolledStudents.length)

      // average attendance across these courses from localStorage.attendance
      const attendanceRaw = localStorage.getItem("attendance")
      let avg = "N/A"
      if (attendanceRaw) {
        try {
          const attendance = JSON.parse(attendanceRaw) as Record<string, Array<{ date?: string; status?: string }>>
          let totalPresent = 0
          let totalRecords = 0
          for (const c of courses) {
            const recs = attendance[c.id] || []
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
      setAvgAttendance(avg)

      // pending tasks: count courses that don't have attendance recorded for today
      const today = new Date().toISOString().split("T")[0]
      let pending = 0
      const attendance = attendanceRaw ? JSON.parse(attendanceRaw) : {}
      for (const c of courses) {
        const recs = (attendance[c.id] || []) as Array<{ date?: string }>
        const hasToday = recs.some((r) => r.date === today)
        if (!hasToday) pending++
      }
      setPendingTasks(pending)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadCourses()
    initializeStudents()
    computeStats()
    const onStorage = (e: StorageEvent) => {
      if (e.key === "courses" || e.key === "attendance") {
        loadCourses()
        // compute stats after a small delay to ensure courses state updates
        setTimeout(() => computeStats(), 50)
      }
      if (e.key === "enrolledStudents") {
        // reload enrolled students when enrollment changes
        loadEnrolledStudents()
        setTimeout(() => computeStats(), 50)
      }
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener("activities-updated", () => {
      loadCourses()
      setTimeout(() => computeStats(), 50)
    })
    // enrollment updates (same-tab) — reload enrolled students
    window.addEventListener("enrollment-updated", () => {
      loadEnrolledStudents()
      setTimeout(() => computeStats(), 50)
    })
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    // when courses change, recompute stats
    computeStats()
  }, [courses])

  useEffect(() => {
    // when courses change, load enrolled students
    loadEnrolledStudents()
  }, [courses])

  useEffect(() => {
    // when enrolled students change, recompute stats
    computeStats()
  }, [enrolledStudents])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Teacher Portal</h1>
          <p className="text-slate-600">Manage your courses and students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => setShowStudentsModal(true)} className="stat-card cursor-pointer hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center justify-between mb-4">
              <Users className={`w-8 h-8 text-blue-600`} />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Total Students</p>
            <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
          </button>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className={`w-8 h-8 text-emerald-600`} />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Avg Attendance</p>
            <p className="text-3xl font-bold text-slate-900">{avgAttendance}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <Clock className={`w-8 h-8 text-orange-600`} />
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Pending Tasks</p>
            <p className="text-3xl font-bold text-slate-900">{pendingTasks}</p>
          </div>
        </div>

        {/* Courses */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Your Courses</h2>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="card-base p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{course.name}</h3>
                    <div className="flex gap-8 mt-3 text-sm">
                      <span className="text-slate-600">{course.students || 0} Students</span>
                      <span className="text-slate-600">{/* attendance percent shown in stats */ "—"} Attendance</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex gap-3">
                  <a href={`/teacher/attendance?course=${course.id}`} className="btn-primary flex-1 text-center">
                    Mark Attendance
                  </a>
                  <a href={`/teacher/results?course=${course.id}`} className="btn-secondary flex-1 text-center">
                    Upload Results
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students Modal */}
      {showStudentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowStudentsModal(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-2xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">All Enrolled Students ({enrolledStudents.length})</h3>
              <button onClick={() => setShowStudentsModal(false)} className="text-slate-500 hover:text-slate-700 text-xl">✕</button>
            </div>
            {enrolledStudents.length === 0 ? (
              <p className="text-slate-600">No students enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {enrolledStudents.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-500">{student.courseName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
