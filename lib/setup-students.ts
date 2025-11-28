/**
 * Utility to initialize sample enrolled students for the teacher portal
 * Call this from pages that need demo data
 */

export interface Student {
  id: string
  name: string
  courseId: string
  courseName: string
}

export function initializeStudents() {
  try {
    const existing = localStorage.getItem("enrolledStudents")
    if (!existing) {
      const sampleStudents: Student[] = [
        { id: "s1", name: "Alice Johnson", courseId: "1", courseName: "Mathematics 101" },
        { id: "s2", name: "Bob Smith", courseId: "1", courseName: "Mathematics 101" },
        { id: "s3", name: "Charlie Brown", courseId: "1", courseName: "Mathematics 101" },
        { id: "s4", name: "Diana Prince", courseId: "1", courseName: "Mathematics 101" },
        { id: "s5", name: "Eve Wilson", courseId: "1", courseName: "Mathematics 101" },
      ]
      localStorage.setItem("enrolledStudents", JSON.stringify(sampleStudents))
    }
  } catch (e) {
    console.error("Failed to initialize students:", e)
  }
}
