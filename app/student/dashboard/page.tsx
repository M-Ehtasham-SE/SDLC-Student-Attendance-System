"use client"

import { useState, useEffect } from "react"
import { BookOpen, CheckCircle2, Star, AlertCircle } from "lucide-react"
import { getUser } from "@/lib/auth"

interface EnrolledStudent {
  id: string
  name: string
  courseId: string
  courseName: string
  username?: string
}

export default function StudentDashboard() {
  const user = getUser()
  const [enrolled, setEnrolled] = useState<EnrolledStudent[]>([])
  const [studentRecord, setStudentRecord] = useState<EnrolledStudent | null>(null)
  const [coursesData, setCoursesData] = useState<Array<{ id: string; name: string; attendance: string; grade: string; trend: string }>>([])
  const [stats, setStats] = useState<Array<{ label: string; value: string; icon: any; color: string }>>([])

  useEffect(() => {
    const loadEnrolled = () => {
      try {
        const raw = localStorage.getItem("enrolledStudents")
        const list = raw ? (JSON.parse(raw) as EnrolledStudent[]) : []
        setEnrolled(list)

        if (user && String(user.role).toLowerCase() === "student") {
          // try to find the matching enrolled student by username or name heuristics
          const uname = (user.username || "").toLowerCase()
          const found = list.find((s) => (s.username && s.username === user.username) || s.id === user.username || s.name.toLowerCase() === uname || s.name.toLowerCase().includes(uname))
          setStudentRecord(found || null)
        }
      } catch (e) {
        console.error(e)
      }
    }

    loadEnrolled()

    const onStorage = (e: StorageEvent) => {
      if (e.key === "enrolledStudents") {
        loadEnrolled()
      }
    }

    const onEnrollmentEvent = () => loadEnrolled()

    window.addEventListener("storage", onStorage)
    window.addEventListener("enrollment-updated", onEnrollmentEvent)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("enrollment-updated", onEnrollmentEvent)
    }
  }, [user])

  useEffect(() => {
    if (!studentRecord) {
      // fallback: show nothing or generic message
      setCoursesData([])
      setStats([])
      return
    }

    // load courses and compute attendance/results for this student
    try {
      const rawCourses = localStorage.getItem("courses")
      const courses = rawCourses ? JSON.parse(rawCourses) : []

      const rawAttendance = localStorage.getItem("attendance")
      const attendance = rawAttendance ? JSON.parse(rawAttendance) : {}

      const rawResults = localStorage.getItem("results")
      const results = rawResults ? JSON.parse(rawResults) : {}

      // find courses the student is enrolled in
      const myCourses = enrolled.filter((s) => s.id === studentRecord.id).map((s) => ({ id: s.courseId, name: s.courseName }))

      const courseRows = myCourses.map((c) => {
        // attendance % for this student in course c.id
        const courseRecords = (attendance[c.id] || []) as Array<{ date?: string; studentId?: string; status?: string }>
        const studentRecords = courseRecords.filter((r) => r.studentId === studentRecord.id)
        const total = studentRecords.length
        const present = studentRecords.filter((r) => r.status === "present").length
        const attendancePct = total > 0 ? `${Math.round((present / total) * 100)}%` : "—"

        // compute average marks across all assessments for this course
        let grade = "—"
        if (results[c.id]) {
          const assessments = Object.keys(results[c.id])
          let sumPercent = 0
          let count = 0
          assessments.forEach((a) => {
            const arr = results[c.id][a] as Array<{ id: string; marks: string }>
            const rec = arr.find((r) => r.id === studentRecord.id)
            if (rec && rec.marks) {
              const pct = (Number(rec.marks) / 100) * 100
              sumPercent += pct
              count++
            }
          })
          if (count > 0) {
            const avg = Math.round(sumPercent / count)
            // simple grade mapping
            if (avg >= 90) grade = "A"
            else if (avg >= 80) grade = "B"
            else if (avg >= 70) grade = "C"
            else if (avg >= 60) grade = "D"
            else grade = "F"
          }
        }

        return { id: c.id, name: c.name, attendance: attendancePct, grade, trend: attendancePct !== "—" && Number.parseInt(attendancePct) >= 90 ? "↑" : attendancePct !== "—" && Number.parseInt(attendancePct) >= 75 ? "→" : "↓" }
      })

      setCoursesData(courseRows)

      // stats
      const totalCourses = courseRows.length
      const avgAttendance = (() => {
        const numeric = courseRows.map((r) => (r.attendance === "—" ? null : Number.parseInt(r.attendance)))
        const nums = numeric.filter((n) => n !== null) as number[]
        return nums.length > 0 ? `${Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)}%` : "—"
      })()

      // Calculate GPA from grades
      const gpaValue = (() => {
        const gradePoints: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 }
        const validGrades = courseRows.filter((r) => r.grade !== "—" && gradePoints[r.grade] !== undefined)
        if (validGrades.length === 0) return null
        const totalPoints = validGrades.reduce((sum, r) => sum + gradePoints[r.grade], 0)
        return totalPoints / validGrades.length
      })()

      const gpa = gpaValue !== null ? gpaValue.toFixed(2) : "—"

      // Show alert if GPA is below 2.0
      if (gpaValue !== null && gpaValue < 2.0) {
        setTimeout(() => {
          alert(`⚠️ Academic Alert\n\nYour GPA (${gpa}) has fallen below 2.0.\nPlease consider meeting with your academic advisor to discuss improvement strategies.`)
        }, 500)
      }

      // Show alert if any course attendance is below 75%
      const lowAttendanceCourses = courseRows.filter((c) => c.attendance !== "—" && Number.parseInt(c.attendance) < 75)
      if (lowAttendanceCourses.length > 0) {
        const courseList = lowAttendanceCourses.map((c) => `• ${c.name}: ${c.attendance}`).join('\n')
        setTimeout(() => {
          alert(`⚠️ Attendance Alert\n\nYou have ${lowAttendanceCourses.length} course(s) with attendance below 75%:\n\n${courseList}\n\nWarning: Attendance below 75% may affect your eligibility for exams.\nPlease improve your attendance immediately.`)
        }, 1000)
      }

      setStats([
        { label: "Total Courses", value: String(totalCourses), icon: BookOpen, color: "text-blue-600" },
        { label: "Avg Attendance", value: avgAttendance, icon: CheckCircle2, color: "text-emerald-600" },
        { label: "Overall GPA", value: gpa, icon: Star, color: "text-yellow-600" },
      ])
    } catch (e) {
      console.error(e)
    }
  }, [studentRecord, enrolled])

  const lowAttendance = coursesData.filter((c) => c.attendance !== "—" && Number.parseInt(c.attendance) < 75)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Your Academic Journey</h1>
          <p className="text-slate-600">Track your progress and achievements</p>
        </div>

        {!user || String(user.role).toLowerCase() !== "student" ? (
          <div className="text-sm text-slate-600">Please sign in as a student to view personal data.</div>
        ) : !studentRecord ? (
          <div className="text-sm text-slate-600">No enrolled student record found for your account.</div>
        ) : (
          <>
            {/* Alert */}
            {lowAttendance.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Attendance Alert</p>
                  <p className="text-red-700 text-sm">You have {lowAttendance.length} course(s) with attendance below 75%</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Courses */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6">My Courses</h2>
              <div className="space-y-4">
                {coursesData.map((course) => (
                  <div key={course.id} className="card-base p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{course.name}</h3>
                        <div className="flex gap-8 mt-3 text-sm">
                          <span className="text-slate-600">
                            Attendance: <span className="font-bold text-slate-900">{course.attendance}</span>
                          </span>
                          <span className="text-slate-600">
                            Grade: <span className="font-bold text-slate-900">{course.grade}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`text-xl ${course.trend === "↑" ? "text-emerald-600" : course.trend === "→" ? "text-slate-400" : "text-red-600"}`}>
                        {course.trend}
                      </span>
                    </div>
                    <a href={`/student/attendance?course=${course.id}`} className="btn-primary block text-center w-full">
                      View Details
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
