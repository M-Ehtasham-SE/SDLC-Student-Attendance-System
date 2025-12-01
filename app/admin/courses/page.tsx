"use client"

import { useState } from "react"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { removeEnrollment } from "@/lib/enrollment"

interface Course {
  id: string
  name: string
  code: string
  teacher: string
  students: number
  status: "active" | "inactive"
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Mathematics 101", code: "MATH101", teacher: "Sarah Teacher", students: 45, status: "active" },
    { id: "2", name: "Physics 201", code: "PHY201", teacher: "John Doe", students: 38, status: "active" },
    { id: "3", name: "Chemistry 150", code: "CHEM150", teacher: "Jane Smith", students: 52, status: "active" },
    { id: "4", name: "English Lit 101", code: "ENG101", teacher: "Mike Johnson", students: 41, status: "inactive" },
  ])

  // load persisted courses from localStorage if available
  // (useEffect can't be used at top level of hook initializer, so sync after mount)

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: "", code: "", teacher: "" })
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [studentsForCourse, setStudentsForCourse] = useState<Array<{ id: string; name: string; username?: string }>>([])
  const [studentsModalCourse, setStudentsModalCourse] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)

  const handleAddCourse = () => {
    if (!formData.name || !formData.code || !formData.teacher) return

    // if editing, update existing course
    if (editingCourseId) {
      const next = courses.map((c) =>
        c.id === editingCourseId
          ? { ...c, name: formData.name, code: formData.code, teacher: formData.teacher }
          : c
      )
      setCourses(next)
      try {
        localStorage.setItem("courses", JSON.stringify(next))
        try {
          const rawAct = localStorage.getItem("activities")
          const acts = rawAct ? JSON.parse(rawAct) : []
          acts.push({ action: `Updated course: ${formData.name}`, timestamp: Date.now() })
          localStorage.setItem("activities", JSON.stringify(acts))
          window.dispatchEvent(new Event("activities-updated"))
        } catch (e) {
          console.error(e)
        }
      } catch (e) {
        console.error(e)
      }
      setEditingCourseId(null)
      setFormData({ name: "", code: "", teacher: "" })
      setShowModal(false)
      return
    }

    const newCourse: Course = {
      id: String(courses.length + 1),
      name: formData.name,
      code: formData.code,
      teacher: formData.teacher,
      students: 0,
      status: "active",
    }
    const next = [...courses, newCourse]
    setCourses(next)
    try {
      localStorage.setItem("courses", JSON.stringify(next))
      // record activity for dashboard
      try {
        const rawAct = localStorage.getItem("activities")
        const acts = rawAct ? JSON.parse(rawAct) : []
        acts.push({ action: `New course created: ${formData.name}`, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        window.dispatchEvent(new Event("activities-updated"))
      } catch (e) {
        console.error(e)
      }
    } catch (e) {
      console.error(e)
    }
    setFormData({ name: "", code: "", teacher: "" })
    setShowModal(false)
  }

    const handleEditCourse = (id: string) => {
      const c = courses.find((x) => x.id === id)
      if (!c) return
      setEditingCourseId(id)
      setFormData({ name: c.name, code: c.code, teacher: c.teacher })
      setShowModal(true)
    }

    const handleDeleteCourse = (id: string) => {
      const c = courses.find((x) => x.id === id)
      if (!c) return
      if (!confirm(`Delete course ${c.name}? This action cannot be undone.`)) return
      const next = courses.filter((x) => x.id !== id)
      setCourses(next)
      try {
        localStorage.setItem("courses", JSON.stringify(next))
        try {
          const rawAct = localStorage.getItem("activities")
          const acts = rawAct ? JSON.parse(rawAct) : []
          acts.push({ action: `Deleted course: ${c.name}`, timestamp: Date.now() })
          localStorage.setItem("activities", JSON.stringify(acts))
          window.dispatchEvent(new Event("activities-updated"))
        } catch (e) {
          console.error(e)
        }
      } catch (e) {
        console.error(e)
      }
    }

  // load courses from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("courses")
      if (raw) {
        const parsed = JSON.parse(raw) as Course[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCourses(parsed)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Manage all courses and assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all"
        >
          + Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.code}</p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  course.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {course.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Teacher</span>
                <span className="font-medium text-foreground">{course.teacher}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Enrolled Students</span>
                <span className="font-medium text-foreground">{course.students}</span>
              </div>
            </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    // load students for this course from localStorage (UI placeholder)
                    try {
                      const raw = localStorage.getItem("enrolledStudents")
                      const enrolled = raw ? JSON.parse(raw) : []
                      const students = enrolled
                        .filter((s: any) => String(s.courseId) === String(course.id))
                        .map((s: any) => ({ id: s.id, name: s.name, username: s.username }))
                      setStudentsForCourse(students)
                      setStudentsModalCourse(course.id)
                      setShowStudentsModal(true)
                    } catch (e) {
                      setStudentsForCourse([])
                      setStudentsModalCourse(null)
                      setShowStudentsModal(true)
                    }
                  }}
                  className="px-3 py-2 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 rounded transition-all font-medium"
                >
                  Students
                </button>
              <button
                onClick={() => {
                  setAssigningCourseId(course.id)
                  setAssignError(null)
                  try {
                    const rawUsers = localStorage.getItem("users")
                    const users = rawUsers ? JSON.parse(rawUsers) : []
                    const firstStudent = users.find((u: any) => String(u.role).toLowerCase() === "student")
                    setSelectedStudentId(firstStudent ? String(firstStudent.id) : null)
                  } catch (e) {
                    setSelectedStudentId(null)
                  }
                  setShowAssignModal(true)
                }}
                className="px-3 py-2 text-sm bg-accent/20 text-accent hover:bg-accent/30 rounded transition-all font-medium"
              >
                Assign Student
              </button>
              <button
                onClick={() => handleEditCourse(course.id)}
                className="flex-1 px-3 py-2 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 rounded transition-all font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCourse(course.id)}
                className="flex-1 px-3 py-2 text-sm bg-destructive/20 text-destructive hover:bg-destructive/30 rounded transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">{editingCourseId ? "Edit Course" : "Create New Course"}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Course Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="e.g., Mathematics 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Course Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="e.g., MATH101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Assigned Teacher</label>
                <input
                  type="text"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Teacher name"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCourseId(null)
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                {editingCourseId ? "Save Changes" : "Create"}
              </button>
            </div>
          </Card>
        </div>
      )}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Assign Student to Course</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Student</label>
                <select
                  value={selectedStudentId || ""}
                  onChange={(e) => setSelectedStudentId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">-- choose a student --</option>
                  {(() => {
                    try {
                      const raw = localStorage.getItem("users")
                      const parsed = raw ? JSON.parse(raw) : []
                      return parsed.filter((u: any) => String(u.role).toLowerCase() === "student").map((s: any) => (
                        <option key={s.id} value={s.id}>{s.username || s.email || s.id}</option>
                      ))
                    } catch (e) {
                      return null
                    }
                  })()}
                </select>
              </div>
              {assignError && <div className="text-sm text-red-600">{assignError}</div>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setAssigningCourseId(null)
                  setSelectedStudentId(null)
                  setAssignError(null)
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!assigningCourseId || !selectedStudentId) {
                    setAssignError("Please select a student to assign")
                    return
                  }

                  try {
                    const rawEnrolled = localStorage.getItem("enrolledStudents")
                    const enrolled = rawEnrolled ? JSON.parse(rawEnrolled) : []

                    const userRaw = localStorage.getItem("users")
                    const users = userRaw ? JSON.parse(userRaw) : []
                    const student = users.find((u: any) => String(u.id) === String(selectedStudentId) && String(u.role).toLowerCase() === "student")
                    if (!student) {
                      setAssignError("Selected user is not a valid student")
                      return
                    }

                    const already = enrolled.find((e: any) => String(e.id) === String(student.id) && String(e.courseId) === String(assigningCourseId))
                    if (already) {
                      setAssignError("Student is already enrolled in that course")
                      return
                    }

                    const rawCourses = localStorage.getItem("courses")
                    const parsedCourses = rawCourses ? JSON.parse(rawCourses) : []
                    const course = parsedCourses.find((c: any) => String(c.id) === String(assigningCourseId))
                    const courseName = course ? course.name : "(Unknown Course)"

                    enrolled.push({ id: student.id, name: student.username || student.email || `student-${student.id}`, username: student.username, courseId: assigningCourseId, courseName })
                    localStorage.setItem("enrolledStudents", JSON.stringify(enrolled))

                    if (parsedCourses && parsedCourses.length > 0) {
                      const nextCourses = parsedCourses.map((c: any) =>
                        String(c.id) === String(assigningCourseId) ? { ...c, students: (Number(c.students || 0) + 1) } : c
                      )
                      localStorage.setItem("courses", JSON.stringify(nextCourses))
                      setCourses(nextCourses)
                    }

                    try {
                      const rawAct = localStorage.getItem("activities")
                      const acts = rawAct ? JSON.parse(rawAct) : []
                      acts.push({ action: `Assigned ${student.username} (id:${student.id}) to ${courseName}`, timestamp: Date.now() })
                      localStorage.setItem("activities", JSON.stringify(acts))
                    } catch (e) {
                      console.error(e)
                    }

                    window.dispatchEvent(new Event("activities-updated"))
                    window.dispatchEvent(new Event("enrollment-updated"))

                    setShowAssignModal(false)
                    setAssigningCourseId(null)
                    setSelectedStudentId(null)
                    setAssignError(null)
                  } catch (e) {
                    console.error(e)
                    setAssignError("Failed to assign student")
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                Assign
              </button>
            </div>
          </Card>
        </div>
      )}
      {showStudentsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Enrolled Students{studentsModalCourse ? ` — Course ${studentsModalCourse}` : ''}</h2>
              <button onClick={() => setShowStudentsModal(false)} className="text-xl text-slate-500 hover:text-slate-700">✕</button>
            </div>

            {studentsForCourse.length === 0 ? (
              <p className="text-slate-600">No students enrolled in this course.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {studentsForCourse.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-sm text-slate-500">{s.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Unenroll ${s.name} from this course?`)) return
                          try {
                            const removed = removeEnrollment(s.id, studentsModalCourse)
                            if (removed) {
                              // helper now updates course counts in localStorage; re-read to update UI state
                              try {
                                const rawCourses = localStorage.getItem("courses")
                                const parsedCourses = rawCourses ? JSON.parse(rawCourses) : []
                                setCourses(parsedCourses)
                              } catch (e) {
                                console.error("Failed to refresh courses after unenroll", e)
                              }

                              // remove locally so UI updates
                              setStudentsForCourse((prev) => prev.filter((x) => String(x.id) !== String(s.id)))

                              // helper now logs activity and dispatches events (activities-updated/enrollment-updated/courses-updated)
                              // enrollment-updated is dispatched inside the helper; courses-updated also dispatched there
                            } else {
                              alert("No enrollment found to remove")
                            }
                          } catch (e) {
                            console.error(e)
                            alert("Failed to unenroll")
                          }
                        }}
                        className="px-3 py-1 text-sm bg-warning/20 text-warning hover:bg-warning/30 rounded transition-all"
                      >
                        Unenroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
