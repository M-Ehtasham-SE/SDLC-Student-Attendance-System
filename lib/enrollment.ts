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

    // persist the new enrolled list
    setEnrolledStudents(filtered)
    // gather removed records for activity logging and to compute how many were removed
    const removedRecords = arr.filter((r) => String(r.id) === idS && String(r.courseId) === courseS)

    // persist course counts as well (if the removed records affected the requested course)
    try {
      const removedCount = arr.length - filtered.length
      if (removedCount > 0) {
        const rawCourses = localStorage.getItem("courses")
        const parsedCourses = rawCourses ? JSON.parse(rawCourses) : []
        const nextCourses = parsedCourses.map((c: any) =>
          String(c.id) === courseS ? { ...c, students: Math.max(0, Number(c.students || 0) - removedCount) } : c
        )
        try {
          localStorage.setItem("courses", JSON.stringify(nextCourses))
        } catch (e) {
          console.error("Failed to persist updated courses after unenroll", e)
        }
      }
      // add activity entries for removed records
      if (removedRecords.length > 0) {
        try {
          const rawUser = localStorage.getItem("user")
          const actorObj = rawUser ? JSON.parse(rawUser) : null
          const actor = actorObj ? actorObj.username || actorObj.name || JSON.stringify(actorObj) : "(system)"

          const rawActs = localStorage.getItem("activities")
          const acts = rawActs ? JSON.parse(rawActs) : []
          for (const rec of removedRecords) {
            acts.push({ actor, action: "unenroll", studentId: rec.id, courseId: rec.courseId, timestamp: Date.now() })
          }
          localStorage.setItem("activities", JSON.stringify(acts))
          // notify listeners that activities changed
          try {
            window.dispatchEvent(new Event("activities-updated"))
          } catch (e) {
            /* ignore in non-browser */
          }
        } catch (e) {
          console.error("Failed to log unenroll activities", e)
        }
      }
    } catch (e) {
      console.error("Failed to update course counts after removeEnrollment", e)
    }

    // notify other parts of the app (same-tab for immediate updates)
    try {
      window.dispatchEvent(new Event("enrollment-updated"))
      // also notify that courses changed so UI can refresh if desired
      window.dispatchEvent(new Event("courses-updated"))
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
