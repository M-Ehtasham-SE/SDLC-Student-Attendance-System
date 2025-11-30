export interface User {
  username: string
  role: "admin" | "teacher" | "student"
}

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem("user")
  window.location.href = "/"
}

// Hash a password using SHA-256 and return a hex string
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined") return password
  const enc = new TextEncoder()
  const data = enc.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const arr = Array.from(new Uint8Array(hashBuffer))
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Simple detector whether a stored password looks like a SHA-256 hex
export function looksHashed(pw?: string) {
  if (!pw) return false
  return /^[0-9a-f]{64}$/.test(pw)
}

// Migrate any existing users in localStorage that have plaintext passwords into hashed form.
export async function migrateStoredPasswords() {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem("users")
    if (!raw) return
    const users = JSON.parse(raw) as any[]
    let changed = false
    for (const u of users) {
      if (u.password && !looksHashed(u.password)) {
        u.password = await hashPassword(String(u.password))
        changed = true
      }
    }
    if (changed) localStorage.setItem("users", JSON.stringify(users))
  } catch (e) {
    console.error("migrateStoredPasswords failed", e)
  }
}
