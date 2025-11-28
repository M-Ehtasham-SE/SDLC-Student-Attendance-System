"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"

interface Student {
  id: string
  name: string
  present: boolean
}

export default function AttendancePage() {
  const search = useSearchParams()
  const courseParam = search.get("course")

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [students, setStudents] = useState<Student[]>([])
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; name: string }>>([])
  const [newStudentName, setNewStudentName] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("courses")
      const parsed = raw ? JSON.parse(raw) : []
      const list = Array.isArray(parsed) && parsed.length > 0 ? parsed.map((c: any) => ({ id: c.id, name: c.name, students: c.students })) : []
      if (list.length > 0) setAvailableCourses(list)
      if (courseParam) setSelectedCourse(courseParam)
      else if (list.length > 0) setSelectedCourse(list[0].id)
      else setSelectedCourse("math101")
    } catch (e) {
      console.error(e)
    }
  }, [courseParam])

  const loadStudentsForCourse = (courseId: string) => {
    try {
      const rawEnrolled = localStorage.getItem("enrolledStudents")
      const parsed = rawEnrolled ? JSON.parse(rawEnrolled) : []
      let courseStudents = Array.isArray(parsed) ? parsed.filter((s: any) => s.courseId === courseId).map((s: any) => ({ id: s.id, name: s.name, present: false })) : []
      if (courseStudents.length === 0) {
        courseStudents = [
          { id: "1", name: "Alice Johnson", present: false },
          { id: "2", name: "Bob Smith", present: false },
          { id: "3", name: "Charlie Brown", present: false },
          { id: "4", name: "Diana Prince", present: false },
          { id: "5", name: "Eve Wilson", present: false },
        ]
      }
      setStudents(courseStudents)

      // load attendance records for selected date (per student)
      const raw = localStorage.getItem("attendance")
      if (!raw) return
      const attendance = JSON.parse(raw)
      const courseRecords = attendance[courseId] || []
      const dayRecords = courseRecords.filter((r: any) => r.date === selectedDate)
      // if records include studentId, map by studentId
      const hasStudentId = dayRecords.some((r: any) => !!r.studentId)
      if (hasStudentId) {
        const map: Record<string, string> = {}
        dayRecords.forEach((r: any) => {
          if (r.studentId) map[r.studentId] = r.status
        })
        setStudents((prev) => prev.map((s) => ({ ...s, present: map[s.id] === "present" })))
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!selectedCourse) return
    loadStudentsForCourse(selectedCourse)
  }, [selectedCourse, selectedDate])

  const handleAddStudent = () => {
    if (!selectedCourse || !newStudentName.trim()) return
    try {
      const raw = localStorage.getItem("enrolledStudents")
      const list = raw ? JSON.parse(raw) : []
      const courseName = availableCourses.find((c) => c.id === selectedCourse)?.name || ""
      const id = `s${Date.now()}`
      list.push({ id, name: newStudentName.trim(), courseId: selectedCourse, courseName })
      localStorage.setItem("enrolledStudents", JSON.stringify(list))
      setNewStudentName("")
      loadStudentsForCourse(selectedCourse)
      window.dispatchEvent(new Event("activities-updated"))
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveStudent = (id: string) => {
    if (!selectedCourse) return
    try {
      const raw = localStorage.getItem("enrolledStudents")
      const list = raw ? JSON.parse(raw) : []
      const next = list.filter((s: any) => s.id !== id)
      localStorage.setItem("enrolledStudents", JSON.stringify(next))
      loadStudentsForCourse(selectedCourse)
      window.dispatchEvent(new Event("activities-updated"))
    } catch (e) {
      console.error(e)
    }
  }

  const toggleAttendance = (id: string) => {
    setStudents((s) => s.map((x) => (x.id === id ? { ...x, present: !x.present } : x)))
  }

  const presentCount = students.filter((s) => s.present).length
  const attendancePercentage = students.length ? Math.round((presentCount / students.length) * 100) : 0

  const handleSave = () => {
    if (!selectedCourse) return
    try {
      const raw = localStorage.getItem("attendance")
      const attendance = raw ? JSON.parse(raw) : {}
      attendance[selectedCourse] = attendance[selectedCourse] || []
      const date = selectedDate
      // remove any existing records for this date (so we replace, not append)
      attendance[selectedCourse] = attendance[selectedCourse].filter((r: any) => r.date !== date)
      // push one record per student including date and studentId
      students.forEach((st) => {
        attendance[selectedCourse].push({ date, studentId: st.id, status: st.present ? "present" : "absent" })
      })
      localStorage.setItem("attendance", JSON.stringify(attendance))
      // notify other components
      window.dispatchEvent(new Event("activities-updated"))
      alert("Attendance saved")
    } catch (e) {
      console.error(e)
      alert("Failed to save attendance")
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Mark Attendance</h1>
      <p className="text-muted-foreground mb-8">Record attendance for your students</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Course</label>
          <select
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            {availableCourses.length === 0 && (
              <>
                <option value="math101">Mathematics 101</option>
                <option value="calc201">Advanced Calculus</option>
                <option value="stats201">Statistics 201</option>
              </>
            )}
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
        </div>

        <div className="flex items-end">
          <div className="w-full bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
            <p className="text-2xl font-bold text-primary">{attendancePercentage}%</p>
          </div>
        </div>
      </div>
      
      {/* Enrollment editor */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            placeholder="Add student name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
          />
          <button onClick={handleAddStudent} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Add
          </button>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Enrolled Students</h3>
          {students.length === 0 ? (
            <div className="text-sm text-muted-foreground">No students found for this course.</div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 border border-slate-200 rounded">
                  <div className="text-sm">{s.name}</div>
                  <button onClick={() => handleRemoveStudent(s.id)} className="px-2 py-1 bg-destructive/20 text-destructive rounded hover:bg-destructive/30">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Student List</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {presentCount} present out of {students.length} students
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student Name</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/50 transition-all">
                  <td className="px-6 py-4 text-foreground font-medium">{student.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        student.present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.present ? "Present" : "Absent"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      className={`px-4 py-1.5 rounded-lg font-medium transition-all text-sm ${
                        student.present
                          ? "bg-green-100 hover:bg-green-200 text-green-800"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      {student.present ? "✓ Present" : "✗ Absent"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all">
            Save Attendance
          </button>
          <button className="px-6 bg-muted hover:bg-border text-foreground font-semibold py-2.5 rounded-lg transition-all">
            Cancel
          </button>
        </div>
      </Card>
    </div>
  )
}
