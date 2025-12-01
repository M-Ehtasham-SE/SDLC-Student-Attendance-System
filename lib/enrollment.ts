/**
 * Enrollment helpers — small utilities for reading/updating enrolledStudents in localStorage
 * This module provides a single helper removeEnrollment(studentId, courseId)
 * which removes any enrolledStudents records that match the provided pair.
 */

export function getEnrolledStudents(): Array<Record<string, any>> {
  try {
    const raw = localStorage.getItem("enrolledStudents")
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error("Failed to read enrolledStudents", e)
    return []
  }
}

export function setEnrolledStudents(arr: Array<Record<string, any>>) {
  try {
    localStorage.setItem("enrolledStudents", JSON.stringify(arr))
  } catch (e) {
    console.error("Failed to write enrolledStudents", e)
  }
}

/**
 * removeEnrollment(studentId, courseId)
 * - studentId and courseId can be numbers or strings; they are compared after stringifying
 * - returns true if at least one matching record was removed, false otherwise
 */
export function removeEnrollment(studentId: string | number, courseId: string | number): boolean {
  try {
    const idS = String(studentId)
    const courseS = String(courseId)

    const raw = localStorage.getItem("enrolledStudents")
    if (!raw) return false

    const arr = JSON.parse(raw) as Array<Record<string, any>>
    const filtered = arr.filter((r) => !(String(r.id) === idS && String(r.courseId) === courseS))

    if (filtered.length === arr.length) {
      // nothing removed
      return false
    }

    localStorage.setItem("enrolledStudents", JSON.stringify(filtered))
    // notify other parts of the app (same-tab for immediate updates)
    try {
      window.dispatchEvent(new Event("enrollment-updated"))
    } catch (e) {
      // ignore in non-browser environments
    }

    return true
  } catch (e) {
    console.error("removeEnrollment failed", e)
    return false
  }
}

export default removeEnrollment
