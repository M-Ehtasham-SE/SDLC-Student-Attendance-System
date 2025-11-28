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
