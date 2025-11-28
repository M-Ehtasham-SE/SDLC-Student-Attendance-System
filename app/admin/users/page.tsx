"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface User {
  id: string
  username: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "inactive"
}

export default function UsersPage() {
  // Initialize users from localStorage if present, otherwise use demo data
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem("users")
      if (raw) return JSON.parse(raw)
    } catch (e) {
      // ignore
    }
    return [
      { id: "1", username: "johnsmith", email: "john@example.com", role: "student", status: "active" },
      { id: "2", username: "sarahteacher", email: "sarah@example.com", role: "teacher", status: "active" },
      { id: "3", username: "mikeadmin", email: "mike@example.com", role: "admin", status: "active" },
      { id: "4", username: "emmastudent", email: "emma@example.com", role: "student", status: "inactive" },
    ]
  })

  const [showModal, setShowModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollingUserId, setEnrollingUserId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ username: "", email: "", role: "student" as const })
  const [formError, setFormError] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const handleAddUser = () => {
    const uname = formData.username.trim()
    if (!uname) {
      setFormError("Please enter a username")
      return
    }
    if (!formData.email.trim()) {
      setFormError("Please enter an email")
      return
    }

    // If editing, update existing user
    if (editingUserId) {
      // check uniqueness excluding the user being edited
      const exists = users.find((u) => u.id !== editingUserId && u.username.toLowerCase() === uname.toLowerCase())
      if (exists) {
        setFormError("This username is already taken. Choose a different username.")
        return
      }

      const next = users.map((u) =>
        u.id === editingUserId
          ? { ...u, username: uname, email: formData.email.trim(), role: formData.role }
          : u
      )
      setUsers(next)
      try {
        localStorage.setItem("users", JSON.stringify(next))
        const rawAct = localStorage.getItem("activities")
        const acts = rawAct ? JSON.parse(rawAct) : []
        acts.push({ action: `Updated user: ${uname} (${formData.role})`, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        window.dispatchEvent(new Event("activities-updated"))
      } catch (e) {
        console.error(e)
      }
      setFormData({ username: "", email: "", role: "student" })
      setFormError("")
      setEditingUserId(null)
      setShowModal(false)
      return
    }

    // check for username uniqueness (case-insensitive) across all users
    const exists = users.find((u) => u.username.toLowerCase() === uname.toLowerCase())
    if (exists) {
      setFormError("This username is already taken. Choose a different username.")
      return
    }

    const newUser: User = {
      id: String(users.length + 1),
      username: uname,
      email: formData.email.trim(),
      role: formData.role,
      status: "active",
    }
    const next = [...users, newUser]
    setUsers(next)
    try {
      localStorage.setItem("users", JSON.stringify(next))
      // record activity
      try {
        const rawAct = localStorage.getItem("activities")
        const acts = rawAct ? JSON.parse(rawAct) : []
        acts.push({ action: `New user added: ${uname} (${formData.role})`, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        // dispatch custom event so same-tab listeners update immediately
        window.dispatchEvent(new Event("activities-updated"))
      } catch (e) {
        console.error(e)
      }
    } catch (e) {
      console.error(e)
    }
    setFormData({ username: "", email: "", role: "student" })
    setFormError("")
    setShowModal(false)
  }

  const handleEditUser = (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    setEditingUserId(id)
    setFormData({ username: u.username, email: u.email, role: u.role })
    setFormError("")
    setShowModal(true)
  }

  const handleDeleteUser = (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    if (!confirm(`Delete user ${u.username}? This action cannot be undone.`)) return
    const next = users.filter((x) => x.id !== id)
    setUsers(next)
    try {
      localStorage.setItem("users", JSON.stringify(next))
      const rawAct = localStorage.getItem("activities")
      const acts = rawAct ? JSON.parse(rawAct) : []
      acts.push({ action: `Deleted user: ${u.username} (${u.role})`, timestamp: Date.now() })
      localStorage.setItem("activities", JSON.stringify(acts))
      window.dispatchEvent(new Event("activities-updated"))
    } catch (e) {
      console.error(e)
    }
  }

  const roleColors = {
    student: "bg-blue-100 text-blue-800",
    teacher: "bg-green-100 text-green-800",
    admin: "bg-purple-100 text-purple-800",
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
        <button
          onClick={() => {
            setEditingUserId(null)
            setFormData({ username: "", email: "", role: "student" })
            setFormError("")
            setShowModal(true)
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all"
        >
          + Add User
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-all">
                  <td className="px-6 py-4 text-foreground font-medium">{user.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="px-3 py-1 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 rounded transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-1 text-sm bg-destructive/20 text-destructive hover:bg-destructive/30 rounded transition-all"
                    >
                      Delete
                    </button>
                    {user.role === "student" && (
                      <button
                        onClick={() => {
                          setEnrollingUserId(user.id)
                          setEnrollError(null)
                          // choose default course if available
                          try {
                            const raw = localStorage.getItem("courses")
                            const parsed = raw ? JSON.parse(raw) : []
                            setSelectedCourseId(parsed && parsed.length > 0 ? parsed[0].id : null)
                          } catch (e) {
                            setSelectedCourseId(null)
                          }
                          setShowEnrollModal(true)
                        }}
                        className="px-3 py-1 text-sm bg-accent/20 text-accent hover:bg-accent/30 rounded transition-all"
                      >
                        Enroll
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">{editingUserId ? "Edit User" : "Add New User"}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormError("")
                    setFormData({ ...formData, username: e.target.value })
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="email@example.com"
                />
              </div>

              {formError && <div className="text-sm text-red-600">{formError}</div>}

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingUserId(null)
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                {editingUserId ? "Save Changes" : "Add User"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Enroll student modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Enroll Student</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Select Course</label>
                <select
                  value={selectedCourseId || ""}
                  onChange={(e) => setSelectedCourseId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">-- choose a course --</option>
                  {(() => {
                    try {
                      const raw = localStorage.getItem("courses")
                      const parsed = raw ? JSON.parse(raw) : []
                      return parsed.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    } catch (e) {
                      return null
                    }
                  })()}
                </select>
              </div>
              {enrollError && <div className="text-sm text-red-600">{enrollError}</div>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEnrollModal(false)
                  setEnrollingUserId(null)
                  setSelectedCourseId(null)
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // handle enroll
                  if (!enrollingUserId || !selectedCourseId) {
                    setEnrollError("Please select a course to enroll")
                    return
                  }

                  try {
                    const raw = localStorage.getItem("enrolledStudents")
                    const enrolled = raw ? JSON.parse(raw) : []
                    // find user details
                    const usr = users.find((u) => u.id === enrollingUserId)
                    if (!usr) {
                      setEnrollError("Invalid student selected")
                      return
                    }

                    // check duplicate by student id + courseId
                    const exists = enrolled.find((e: any) => String(e.id) === String(usr.id) && String(e.courseId) === String(selectedCourseId))
                    if (exists) {
                      setEnrollError("Student is already enrolled in that course")
                      return
                    }

                    // find course name
                    const rawCourses = localStorage.getItem("courses")
                    const parsedCourses = rawCourses ? JSON.parse(rawCourses) : []
                    const course = parsedCourses.find((c: any) => String(c.id) === String(selectedCourseId))
                    const courseName = course ? course.name : "(Unknown Course)"

                    // create enrolled student record - use user.id and attach username so later lookup works
                    const newRecord = { id: usr.id, name: usr.username || usr.email || `student-${usr.id}`, username: usr.username, courseId: selectedCourseId, courseName }
                    enrolled.push(newRecord)
                    localStorage.setItem("enrolledStudents", JSON.stringify(enrolled))

                    // update courses' students count if present
                    if (parsedCourses && parsedCourses.length > 0) {
                      const nextCourses = parsedCourses.map((c: any) =>
                        String(c.id) === String(selectedCourseId) ? { ...c, students: (Number(c.students || 0) + 1) } : c
                      )
                      localStorage.setItem("courses", JSON.stringify(nextCourses))
                      // also update local state, if needed - here we already update activities and dispatch events
                    }

                    // record activity
                    try {
                      const rawAct = localStorage.getItem("activities")
                      const acts = rawAct ? JSON.parse(rawAct) : []
                      acts.push({ action: `Enrolled ${usr.username} (id:${usr.id}) to ${courseName}`, timestamp: Date.now() })
                      localStorage.setItem("activities", JSON.stringify(acts))
                    } catch (e) {
                      console.error(e)
                    }

                    // dispatch both activities and enrollment events so other pages update immediately
                    window.dispatchEvent(new Event("activities-updated"))
                    window.dispatchEvent(new Event("enrollment-updated"))

                    setShowEnrollModal(false)
                    setEnrollingUserId(null)
                    setSelectedCourseId(null)
                    setEnrollError(null)
                  } catch (e) {
                    console.error(e)
                    setEnrollError("Failed to enroll student")
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                Enroll
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
