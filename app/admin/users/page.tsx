"use client"

import { useState, useEffect } from "react"
import { hashPassword, migrateStoredPasswords, looksHashed, getUser } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { removeEnrollment } from "@/lib/enrollment"

interface User {
  id: string
  username: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "inactive"
  password?: string
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
      { id: "1", username: "johnsmith", email: "john@example.com", role: "student", status: "active", password: "password_john" },
      { id: "2", username: "sarahteacher", email: "sarah@example.com", role: "teacher", status: "active", password: "password_sarah" },
      { id: "3", username: "mikeadmin", email: "mike@example.com", role: "admin", status: "active", password: "password_mike" },
      { id: "4", username: "emmastudent", email: "emma@example.com", role: "student", status: "inactive", password: "password_emma" },
    ]
  })

  const [showModal, setShowModal] = useState(false)
  const [activeAdmin, setActiveAdmin] = useState<any | null>(null)
 
  const [activeTeacher, setActiveTeacher] = useState<any | null>(null)
 
 
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollingUserId, setEnrollingUserId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ username: string; email: string; role: "student" | "teacher" | "admin"; password: string }>({ username: "", email: "", role: "student", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // ensure stored passwords are hashed and refresh state
    const migrate = async () => {
      await migrateStoredPasswords()
      try {
        const raw = localStorage.getItem("users")
        if (raw) setUsers(JSON.parse(raw))
      } catch (e) {
        console.error(e)
      }
    }
    migrate().catch(() => {})

    // load active admin and active teacher if present
    try {
      const rawActive = localStorage.getItem("activeAdmin")
      setActiveAdmin(rawActive ? JSON.parse(rawActive) : null)
    } catch (e) {
      setActiveAdmin(null)
    }
    try {
      const rawActiveT = localStorage.getItem("activeTeacher")
      setActiveTeacher(rawActiveT ? JSON.parse(rawActiveT) : null)
    } catch (e) {
      setActiveTeacher(null)
    }
  }, [])

  // keep activeAdmin in sync with other tabs and helper actions
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeAdmin") {
        try {
          const raw = localStorage.getItem("activeAdmin")
          setActiveAdmin(raw ? JSON.parse(raw) : null)
        } catch (e) {
          setActiveAdmin(null)
        }
      }
      if (e.key === "activeTeacher") {
        try {
          const raw = localStorage.getItem("activeTeacher")
          setActiveTeacher(raw ? JSON.parse(raw) : null)
        } catch (e) {
          setActiveTeacher(null)
        }
      }
    }
    const onActivities = () => {
      try {
        const raw = localStorage.getItem("activeAdmin")
        setActiveAdmin(raw ? JSON.parse(raw) : null)
      } catch (e) {
        setActiveAdmin(null)
      }
      try {
        const rawT = localStorage.getItem("activeTeacher")
        setActiveTeacher(rawT ? JSON.parse(rawT) : null)
      } catch (e) {
        setActiveTeacher(null)
      }
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener("activities-updated", onActivities)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("activities-updated", onActivities)
    }
  }, [])
  const [formError, setFormError] = useState("")
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const handleAddUser = async () => {
    const uname = formData.username.trim()
    if (!uname) {
      setFormError("Please enter a username")
      return
    }
    if (!formData.email.trim()) {
      setFormError("Please enter an email")
      return
    }

    // require password when creating new user; for edits empty password means keep existing
    if (!editingUserId && !formData.password) {
      setFormError("Please provide a password for the new user")
      return
    }

    // If editing, update existing user
    if (editingUserId) {
      // check username uniqueness excluding the user being edited
      const exists = users.find((u) => u.id !== editingUserId && u.username.toLowerCase() === uname.toLowerCase())
      if (exists) {
        setFormError("This username is already taken. Choose a different username.")
        return
      }

      // if password is provided on edit, ensure it's unique across other users and hash it
      let hashedForEdit: string | undefined = undefined
      if (formData.password) {
        // strength
        const st = (() => {
          let score = 0
          if ((formData.password || "").length >= 8) score++
          if (/[a-z]/.test(formData.password)) score++
          if (/[A-Z]/.test(formData.password)) score++
          if (/[0-9]/.test(formData.password)) score++
          if (/[^A-Za-z0-9]/.test(formData.password)) score++
          return score
        })()
        if (st < 4) {
          setFormError("Password too weak — use 8+ chars, mix upper/lower, a digit and a symbol")
          return
        }
        hashedForEdit = await hashPassword(formData.password)
        const passDup = users.find((u) => u.id !== editingUserId && u.password && u.password === hashedForEdit)
        if (passDup) {
          setFormError("This password is already used by another account. Choose a different password.")
          return
        }
      }
      if (exists) {
        setFormError("This username is already taken. Choose a different username.")
        return
      }

      const next = users.map((u) =>
        u.id === editingUserId
          ? {
              ...u,
              username: uname,
              email: formData.email.trim(),
              role: formData.role,
              password: hashedForEdit ? hashedForEdit : u.password,
            }
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
      setFormData({ username: "", email: "", role: "student", password: "" })
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

    // ensure password is provided
    if (!formData.password) {
      setFormError("Please provide a password for this user.")
      return
    }

    // strength check
    const st = (() => {
      let score = 0
      if ((formData.password || "").length >= 8) score++
      if (/[a-z]/.test(formData.password)) score++
      if (/[A-Z]/.test(formData.password)) score++
      if (/[0-9]/.test(formData.password)) score++
      if (/[^A-Za-z0-9]/.test(formData.password)) score++
      return score
    })()
    if (st < 4) {
      setFormError("Password too weak — use 8+ chars, mix upper/lower, a digit and a symbol")
      return
    }

    // hash and enforce uniqueness
    const newHashed = await hashPassword(formData.password)
    const passConflict = users.find((u) => u.password && u.password === newHashed)
    if (passConflict) {
      setFormError("This password is already used by another account. Choose a different password.")
      return
    }

    const newUser: User = {
      id: String(users.length + 1),
      username: uname,
      email: formData.email.trim(),
      role: formData.role,
      status: "active",
      password: newHashed,
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
    setFormData({ username: "", email: "", role: "student", password: "" })
    setFormError("")
    setShowModal(false)
  }

  const handleEditUser = (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    setEditingUserId(id)
    setFormData({ username: u.username, email: u.email, role: u.role, password: "" })
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

  const currentSession = getUser()

  const assignTeacherTo = (target: any) => {
    if (!currentSession) return
    // only the currently active admin can assign teacher access
    try {
      const rawActive = localStorage.getItem("activeAdmin")
      const active = rawActive ? JSON.parse(rawActive) : null
      if (!active || String(active.username).toLowerCase() !== String(currentSession.username).toLowerCase()) {
        alert("Only the active admin can assign teacher access.")
        return
      }

      if (!confirm(`Grant teacher portal access to ${target.username}? This will make them the only eligible teacher.`)) return

      const newActiveT = { id: target.id, username: target.username, setAt: Date.now() }
      localStorage.setItem("activeTeacher", JSON.stringify(newActiveT))
      setActiveTeacher(newActiveT)

      // log activity
      try {
        const rawActs = localStorage.getItem("activities")
        const acts = rawActs ? JSON.parse(rawActs) : []
        acts.push({ actor: currentSession.username, action: "assign-teacher", to: target.username, teacherId: target.id, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        try { window.dispatchEvent(new Event("activities-updated")) } catch (e) {}
      } catch (e) {
        console.error("Failed to log teacher assign activity", e)
      }
    } catch (e) {
      console.error(e)
      alert("Failed to assign teacher access")
    }
  }

  const revokeTeacherAccess = () => {
    if (!currentSession) return
    try {
      const rawActive = localStorage.getItem("activeAdmin")
      const active = rawActive ? JSON.parse(rawActive) : null
      if (!active || String(active.username).toLowerCase() !== String(currentSession.username).toLowerCase()) {
        alert("Only the active admin can revoke teacher access.")
        return
      }
      if (!confirm("Revoke teacher portal access so no teacher can sign in until assigned?")) return
      localStorage.removeItem("activeTeacher")
      setActiveTeacher(null)
      try {
        const rawActs = localStorage.getItem("activities")
        const acts = rawActs ? JSON.parse(rawActs) : []
        acts.push({ actor: currentSession.username, action: "revoke-teacher", timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        try { window.dispatchEvent(new Event("activities-updated")) } catch (e) {}
      } catch (e) {
        console.error(e)
      }
    } catch (e) {
      console.error(e)
    }
  }
  const transferAdminTo = (target: any) => {
    if (!currentSession) return
    // only the currently active admin can transfer
    try {
      const rawActive = localStorage.getItem("activeAdmin")
      const active = rawActive ? JSON.parse(rawActive) : null
      if (!active || String(active.username).toLowerCase() !== String(currentSession.username).toLowerCase()) {
        alert("Only the active admin can transfer admin access.")
        return
      }

      if (!confirm(`Make ${target.username} the active admin? This will transfer admin portal access to them.`)) return

      const newActive = { id: target.id, username: target.username, setAt: Date.now() }
      localStorage.setItem("activeAdmin", JSON.stringify(newActive))
      setActiveAdmin(newActive)

      // log activity
      try {
        const rawActs = localStorage.getItem("activities")
        const acts = rawActs ? JSON.parse(rawActs) : []
        acts.push({ actor: currentSession.username, action: "transfer-admin", from: active ? active.username : null, to: target.username, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        try { window.dispatchEvent(new Event("activities-updated")) } catch (e) {}
      } catch (e) {
        console.error("Failed to log admin transfer activity", e)
      }
    } catch (e) {
      console.error(e)
      alert("Failed to transfer admin access")
    }
  }

  const revokeAdminAccess = () => {
    if (!currentSession) return
    try {
      const rawActive = localStorage.getItem("activeAdmin")
      const active = rawActive ? JSON.parse(rawActive) : null
      if (!active || String(active.username).toLowerCase() !== String(currentSession.username).toLowerCase()) {
        alert("Only the active admin can revoke admin access.")
        return
      }
      if (!confirm("Revoke admin portal access so no admin can sign in until transferred?")) return
      localStorage.removeItem("activeAdmin")
      setActiveAdmin(null)
      try {
        const rawActs = localStorage.getItem("activities")
        const acts = rawActs ? JSON.parse(rawActs) : []
        acts.push({ actor: currentSession.username, action: "revoke-admin", admin: currentSession.username, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
        try { window.dispatchEvent(new Event("activities-updated")) } catch (e) {}
      } catch (e) {
        console.error(e)
      }
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
          {activeAdmin ? (
            <div className="mt-2 text-sm text-slate-600">Admin portal active: <strong className="ml-2">{activeAdmin.username}</strong></div>
          ) : (
            <div className="mt-2 text-sm text-slate-600">Admin portal not claimed — first admin to sign in becomes active, or existing active admin can transfer.</div>
          )}
          {activeTeacher ? (
            <div className="mt-1 text-sm text-slate-600">Teacher access assigned to: <strong className="ml-2">{activeTeacher.username}</strong></div>
          ) : (
            <div className="mt-1 text-sm text-slate-600">Teacher access not restricted — any teacher may sign in unless assigned by admin.</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingUserId(null)
              setFormData({ username: "", email: "", role: "student", password: "" })
              setFormError("")
              setShowModal(true)
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all"
          >
            + Add User
          </button>
          {currentSession && activeAdmin && String(currentSession.username).toLowerCase() === String(activeAdmin.username).toLowerCase() && (
            <>
              <button onClick={revokeAdminAccess} className="px-3 py-1 text-sm bg-warning/20 text-warning rounded transition-all">Revoke Admin Access</button>
              {activeTeacher ? (
                <button onClick={revokeTeacherAccess} className="px-3 py-1 text-sm bg-warning/20 text-warning rounded transition-all">Revoke Teacher Access</button>
              ) : null}
            </>
          )}
        </div>
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
                    {String(user.role).toLowerCase() === "student" && (
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

                    {String(user.role).toLowerCase() === "admin" && (
                      <>
                        {activeAdmin && String(activeAdmin.username).toLowerCase() === String(user.username).toLowerCase() ? (
                          <span className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full">Active Admin</span>
                        ) : (
                          // If current session is the active admin, allow transfer to this admin
                          currentSession && String(currentSession.username).toLowerCase() === String(activeAdmin?.username || "").toLowerCase() ? (
                            <button
                              type="button"
                              onClick={() => transferAdminTo(user)}
                              className="px-3 py-1 text-sm bg-accent/20 text-accent hover:bg-accent/30 rounded transition-all"
                            >
                              Make Active
                            </button>
                          ) : (
                            // not active admin — show locked badge
                            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded">Locked</span>
                          )
                        )}
                      </>
                    )}
                    {String(user.role).toLowerCase() === "teacher" && (
                      <>
                        {activeTeacher && String(activeTeacher.username).toLowerCase() === String(user.username).toLowerCase() ? (
                          <span className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full">Active Teacher</span>
                        ) : (
                          currentSession && String(currentSession.username).toLowerCase() === String(activeAdmin?.username || "").toLowerCase() ? (
                            <button
                              type="button"
                              onClick={() => assignTeacherTo(user)}
                              className="px-3 py-1 text-sm bg-accent/20 text-accent hover:bg-accent/30 rounded transition-all"
                            >
                              Make Active
                            </button>
                          ) : (
                            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded">Locked</span>
                          )
                        )}
                      </>
                    )}
                    {String(user.role).toLowerCase() === "student" && (
                      (() => {
                        // check if this user is enrolled anywhere
                        try {
                          const raw = localStorage.getItem("enrolledStudents")
                          const enrolled = raw ? JSON.parse(raw) : []
                          const isEnrolled = enrolled.some((e: any) => {
                            try {
                              if (String(e.id) === String(user.id)) return true
                              if (e.username && user.username && String(e.username).toLowerCase() === String(user.username).toLowerCase()) return true
                              if (e.name && user.username && String(e.name).toLowerCase().includes(String(user.username).toLowerCase())) return true
                            } catch (err) {
                              // ignore
                            }
                            return false
                          })
                              if (isEnrolled) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!confirm(`Unenroll ${user.username} from all courses?`)) return
                                      try {
                                        const raw = localStorage.getItem("enrolledStudents")
                                        const enrolled = raw ? JSON.parse(raw) : []
                                        // find course ids for this student
                                        const toRemove = enrolled.filter((e: any) => {
                                          if (String(e.id) === String(user.id)) return true
                                          if (e.username && user.username && String(e.username).toLowerCase() === String(user.username).toLowerCase()) return true
                                          if (e.name && user.username && String(e.name).toLowerCase().includes(String(user.username).toLowerCase())) return true
                                          return false
                                        })
                                        if (toRemove.length === 0) {
                                          alert("No enrollments found for this student")
                                          return
                                        }
                                        const rawCourses = localStorage.getItem("courses")
                                        const parsedCourses = rawCourses ? JSON.parse(rawCourses) : []

                                        let removedAny = false
                                        for (const r of toRemove) {
                                          const removed = removeEnrollment(r.id, r.courseId)
                                          if (removed) {
                                            removedAny = true
                                            try {
                                              window.dispatchEvent(new Event("enrollment-updated"))
                                              window.dispatchEvent(new Event("activities-updated"))
                                            } catch (e) {
                                              // ignore in non-browser env
                                            }
                                          }
                                        }

                                        if (removedAny) {
                                          // helper dispatched enrollment-updated, courses-updated and logs activities already
                                          // re-read courses so UI reflects updated counts
                                          try {
                                            // notify other parts of the app that courses may have changed
                                            try { window.dispatchEvent(new Event("courses-updated")) } catch (e) {}
                                          } catch (e) {
                                            console.error("Failed to notify courses update after unenroll all", e)
                                          }
                                          // trigger re-render for the users table
                                          setRefreshCounter((n) => n + 1)
                                        }
                                      } catch (err) {
                                        console.error(err)
                                        alert("Failed to unenroll student; check console")
                                      }
                                    }}
                                    className="px-3 py-1 text-sm bg-warning/20 text-warning hover:bg-warning/30 rounded transition-all"
                                  >
                                    Unenroll
                                  </button>
                                )
                          }
                        } catch (e) {
                          // ignore
                        }
                        return null
                      })()
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

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    placeholder={editingUserId ? "Leave empty to keep current password" : "Set a password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-2 text-sm text-muted-foreground px-2 py-1 rounded"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formData.password && (
                  (() => {
                    let score = 0
                    if ((formData.password || "").length >= 8) score++
                    if (/[a-z]/.test(formData.password)) score++
                    if (/[A-Z]/.test(formData.password)) score++
                    if (/[0-9]/.test(formData.password)) score++
                    if (/[^A-Za-z0-9]/.test(formData.password)) score++
                    const label = score <= 2 ? "Weak" : score === 3 ? "Medium" : "Strong"
                    const pct = Math.min(100, (score / 5) * 100)
                    const color = label === "Weak" ? "bg-red-500" : label === "Medium" ? "bg-yellow-400" : "bg-emerald-500"
                    return (
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <div className="flex-1 mr-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className={`${color} h-2 rounded-full`} />
                        </div>
                        <div className={`font-semibold ${label === "Weak" ? "text-red-600" : label === "Medium" ? "text-yellow-600" : "text-emerald-600"}`}>
                          {label}
                        </div>
                      </div>
                    )
                  })()
                )}
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
