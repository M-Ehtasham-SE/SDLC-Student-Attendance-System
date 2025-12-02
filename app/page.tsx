"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, BookOpen, Sparkles } from "lucide-react"
import { hashPassword, migrateStoredPasswords, looksHashed } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [existingUser, setExistingUser] = useState<any | null>(null)
  const [showSetPwModal, setShowSetPwModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [setPwError, setSetPwError] = useState("")
  const [isSetting, setIsSetting] = useState(false)
  const setPwRef = useRef<HTMLFormElement | null>(null)
  const newPwRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    migrateStoredPasswords().catch(() => { })
  }, [])

  const checkStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[a-z]/.test(pw)) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const label = score <= 2 ? "Weak" : score === 3 ? "Medium" : "Strong"
    return { score, label }
  }

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    if (!password) {
      setError("Please enter a password")
      return
    }

    // Enforce globally unique usernames across all roles (case-insensitive)
    const uname = username.trim()
    setIsLoading(true)
    try {
      await migrateStoredPasswords()
      const raw = localStorage.getItem("users")
      // users may be created by admin (with id, email, status) or by sign-in (previous format).
      const users: any[] = raw ? JSON.parse(raw) : []

      const existing = users.find((u) => (u.username || "").toLowerCase() === uname.toLowerCase())

      if (existing) {
        // username exists
        if (String(existing.role).toLowerCase() !== String(role).toLowerCase()) {
          setError("This username is already taken by another role. Please choose a different username.")
          setIsLoading(false)
          return
        }

        // If the existing account has a password, validate it
        if (existing.password !== undefined) {
          // compare hashed values
          const hashedInput = looksHashed(existing.password) ? await hashPassword(password) : password
          if (existing.password !== hashedInput) {
            setError("Incorrect password for this account")
            setIsLoading(false)
            return
          }
          // password matched -> allow login
        } else {
          // account has no password set (likely created from admin UI) - require admin to set password
          setError("This account does not have a password set. Please contact your administrator or create a new account.")
          setIsLoading(false)
          return
        }
      } else {
        // Account not found - do not allow auto-creation
        setError("Account not found. Please contact your administrator.")
        setIsLoading(false)
        return
      }
      const user = { username: uname, role }

      // ADMIN ACCESS CONTROL: only one active admin allowed at a time
      if (String(role).toLowerCase() === "admin") {
        try {
          const rawActive = localStorage.getItem("activeAdmin")
          const active = rawActive ? JSON.parse(rawActive) : null
          // if an active admin exists and is not this username, block admin sign in
          if (active && String(active.username).toLowerCase() !== uname.toLowerCase()) {
            setError(`Admin portal reserved for '${active.username}'. Request transfer via Manage Users.`)
            setIsLoading(false)
            return
          }

          // no active admin assigned -> claim active admin for this account
          if (!active) {
            const rawUsers = localStorage.getItem("users")
            const all = rawUsers ? JSON.parse(rawUsers) : []
            const matched = all.find((u: any) => (u.username || "").toLowerCase() === uname.toLowerCase() && String(u.role).toLowerCase() === "admin")
            const adminId = matched ? matched.id : null
            const newActive = { id: adminId, username: uname, setAt: Date.now() }
            try {
              localStorage.setItem("activeAdmin", JSON.stringify(newActive))
              // log this action
              const rawActs = localStorage.getItem("activities")
              const acts = rawActs ? JSON.parse(rawActs) : []
              acts.push({ actor: uname, action: "become-active-admin", adminId, timestamp: Date.now() })
              localStorage.setItem("activities", JSON.stringify(acts))
              try { window.dispatchEvent(new Event("activities-updated")) } catch (e) { }
            } catch (e) {
              console.error("Failed to set activeAdmin during login", e)
            }
          }

          // persist session only after admin active checks succeed
          localStorage.setItem("user", JSON.stringify(user))
          router.push("/admin/dashboard")
        } catch (e) {
          // fallback: allow admin access if there is an error reading active admin
          localStorage.setItem("user", JSON.stringify(user))
          router.push("/admin/dashboard")
        }
      } else if (String(role).toLowerCase() === "teacher") {
        localStorage.setItem("user", JSON.stringify(user))
        router.push("/teacher/dashboard")
      } else {
        localStorage.setItem("user", JSON.stringify(user))
        router.push("/student/dashboard")
      }
    } catch (err) {
      setError("An error occurred while signing in. Please try again.")
      setIsLoading(false)
      console.error(err)
    }
  }

  // handler used by Set Password modal (supports Enter submitting the form)
  const handleSetPassword = async () => {
    setIsSetting(true)
    setSetPwError("")
    try {
      const np = newPassword || ""
      if (!np) {
        setSetPwError("Please enter a new password")
        setIsSetting(false)
        return
      }
      if (np !== confirmPassword) {
        setSetPwError("Passwords do not match")
        setIsSetting(false)
        return
      }
      const st = checkStrength(np)
      if (st.score < 4) {
        setSetPwError("Password too weak — use 8+ chars, mix upper/lower, a digit and a symbol")
        setIsSetting(false)
        return
      }

      // hash and check uniqueness
      const hashed = await hashPassword(np)
      const raw = localStorage.getItem("users")
      const users: any[] = raw ? JSON.parse(raw) : []
      // ensure nobody else has this same password hash
      const conflict = users.find((u) => u.password && u.password === hashed)
      if (conflict) {
        setSetPwError("This password is already used by another account. Choose a different password.")
        setIsSetting(false)
        return
      }

      // find the target user — prefer by id if available
      const targetIndex = users.findIndex((u) => (u.username || "").toLowerCase() === (username || "").trim().toLowerCase() && String(u.role).toLowerCase() === String(role).toLowerCase())
      if (targetIndex === -1) {
        setSetPwError("Account not found. Please check your username and role.")
        setIsSetting(false)
        return
      }

      users[targetIndex].password = hashed
      localStorage.setItem("users", JSON.stringify(users))

      // log activity
      try {
        const rawAct = localStorage.getItem("activities")
        const acts = rawAct ? JSON.parse(rawAct) : []
        acts.push({ action: `Password set for ${users[targetIndex].username} (id:${users[targetIndex].id})`, timestamp: Date.now() })
        localStorage.setItem("activities", JSON.stringify(acts))
      } catch (e) {
        console.error(e)
      }

      // dispatch and auto-login
      window.dispatchEvent(new Event("activities-updated"))
      const sess = { username: users[targetIndex].username, role: users[targetIndex].role }
      // If this is an admin account being set, ensure activeAdmin exists or is set to this user
      try {
        if (String(users[targetIndex].role).toLowerCase() === "admin") {
          const rawActive = localStorage.getItem("activeAdmin")
          const active = rawActive ? JSON.parse(rawActive) : null
          if (active && String(active.username).toLowerCase() !== String(users[targetIndex].username).toLowerCase()) {
            // active admin exists and is different -> block admin auto-entry
            setError(`Admin portal reserved for '${active.username}'. Request transfer via Manage Users.`)
            setIsSetting(false)
            return
          }
          if (!active) {
            const adminId = users[targetIndex].id
            const newActive = { id: adminId, username: users[targetIndex].username, setAt: Date.now() }
            localStorage.setItem("activeAdmin", JSON.stringify(newActive))
            const rawActs = localStorage.getItem("activities")
            const acts = rawActs ? JSON.parse(rawActs) : []
            acts.push({ actor: users[targetIndex].username, action: "become-active-admin", adminId, timestamp: Date.now() })
            localStorage.setItem("activities", JSON.stringify(acts))
            try { window.dispatchEvent(new Event("activities-updated")) } catch (e) { }
          }
        }
      } catch (e) {
        console.error("active admin check failed in set-password flow", e)
      }
      // persist session only after admin checks completed
      localStorage.setItem("user", JSON.stringify(sess))
      // show success toast
      try {
        toast({ title: "Password set", description: "Your password has been saved and you're now signed in." })
      } catch (e) {
        /* ignore */
      }

      setShowSetPwModal(false)
      setIsSetting(false)
      router.push(String(users[targetIndex].role).toLowerCase() === "admin" ? "/admin/dashboard" : String(users[targetIndex].role).toLowerCase() === "teacher" ? "/teacher/dashboard" : "/student/dashboard")
    } catch (e) {
      console.error(e)
      setSetPwError("Failed to set password — try again")
      setIsSetting(false)
    }
  }

  const handleSignInClick = () => {
    // Scroll the login card into view and focus the username input
    if (usernameRef.current) {
      usernameRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      usernameRef.current.focus()
    }
  }

  // detect if the typed username/role matches an existing user purposely without a password
  useEffect(() => {
    try {
      const raw = localStorage.getItem("users")
      const users: any[] = raw ? JSON.parse(raw) : []
      const found = users.find((u) => (u.username || "").toLowerCase() === (username || "").trim().toLowerCase() && String(u.role).toLowerCase() === String(role).toLowerCase())
      setExistingUser(found || null)
    } catch (e) {
      setExistingUser(null)
    }
  }, [username, role])

  // focus trap and focus management for Set Password modal
  useEffect(() => {
    if (!showSetPwModal) return
    // focus first input
    setTimeout(() => {
      try {
        newPwRef.current?.focus()
      } catch (e) {
        /* ignore */
      }
    }, 10)

    const root = setPwRef.current
    if (!root) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [showSetPwModal])

  const roles = [
    { id: "admin", label: "Admin", icon: "⚙️", description: "Manage system" },
    { id: "teacher", label: "Teacher", icon: "👨‍🏫", description: "Track students" },
    { id: "student", label: "Student", icon: "👨‍🎓", description: "View grades" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">EduMatrix</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={handleSignInClick}
            className="px-4 py-2 text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Text */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Student Management</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Manage students
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                intelligently
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Track attendance, manage results, and inspire student success with EduMatrix.
            </p>
          </div>

          {/* Login Card */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-border/50"
          >
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Username</label>
              <input
                type="text"
                value={username}
                ref={usernameRef}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-2 text-sm text-muted-foreground px-2 py-1 rounded"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {/* strength */}
              {password.length > 0 && (
                (() => {
                  const st = checkStrength(password)
                  const pct = Math.min(100, (st.score / 5) * 100)
                  const color = st.label === "Weak" ? "bg-red-500" : st.label === "Medium" ? "bg-yellow-400" : "bg-emerald-500"
                  return (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex-1 mr-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`${color} h-2 rounded-full`} />
                      </div>
                      <div className={`font-semibold ${st.label === "Weak" ? "text-red-600" : st.label === "Medium" ? "text-yellow-600" : "text-emerald-600"}`}>
                        {st.label}
                      </div>
                    </div>
                  )
                })()
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-lg font-medium text-sm transition-all ${role === r.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-secondary/5 text-foreground border border-border hover:bg-secondary/10"
                      }`}
                  >
                    <div className="text-xl mb-1">{r.icon}</div>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
            )}

            {existingUser && !existingUser.password && (
              <div className="text-sm text-foreground mt-2 flex items-center justify-between">
                <div className="text-slate-600">It looks like this account doesn't have a password yet.</div>
                <button
                  type="button"
                  onClick={() => {
                    setNewPassword("")
                    setConfirmPassword("")
                    setSetPwError("")
                    setShowSetPwModal(true)
                  }}
                  className="text-sm text-blue-600 hover:underline ml-4"
                >
                  Set password
                </button>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Continue"}
              {!isLoading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Set password modal for accounts that currently have no password */}
          {showSetPwModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowSetPwModal(false)} />
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  await handleSetPassword()
                }}
                ref={setPwRef}
                className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-bold mb-3 text-foreground">Set a password for your account</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a strong password so you can sign in going forward.</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">New password</label>
                    <input
                      ref={newPwRef}
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setSetPwError("")
                      }}
                      className="w-full px-3 py-2 border border-input rounded-lg"
                      placeholder="Choose a strong password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setSetPwError("")
                      }}
                      className="w-full px-3 py-2 border border-input rounded-lg"
                      placeholder="Repeat your password"
                    />
                  </div>

                  {setPwError && <div className="text-sm text-red-600">{setPwError}</div>}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowSetPwModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    disabled={isSetting}
                  >
                    {isSetting ? "Setting…" : "Set password & sign in"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">Demo mode • Use any username to explore</p>
        </div>
      </div>
    </div>
  )
}
