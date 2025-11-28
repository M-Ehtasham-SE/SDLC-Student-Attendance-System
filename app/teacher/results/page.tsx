"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"

interface StudentResult {
  id: string
  name: string
  marks: string
  maxMarks: number
}

export default function ResultsPage() {
  const search = useSearchParams()
  const courseParam = search.get("course")

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [assessment, setAssessment] = useState("midterm")
  const [students, setStudents] = useState<StudentResult[]>([])
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("courses")
      const parsed = raw ? JSON.parse(raw) : []
      const list = Array.isArray(parsed) && parsed.length > 0 ? parsed.map((c: any) => ({ id: c.id, name: c.name })) : []
      if (list.length > 0) setAvailableCourses(list)
      if (courseParam) setSelectedCourse(courseParam)
      else if (list.length > 0) setSelectedCourse(list[0].id)
      else setSelectedCourse("math101")

      // sample students
      // do not set sample students here; loading happens per-course/assessment
    } catch (e) {
      console.error(e)
    }
  }, [courseParam])

  const loadStudentsForCourse = (courseId: string, assessmentKey: string) => {
    try {
      const rawEnrolled = localStorage.getItem("enrolledStudents")
      const enrolled = rawEnrolled ? JSON.parse(rawEnrolled) : []
      let courseStudents = Array.isArray(enrolled) ? enrolled.filter((s: any) => s.courseId === courseId).map((s: any) => ({ id: s.id, name: s.name, marks: "", maxMarks: 100 })) : []
      if (courseStudents.length === 0) {
        // fallback sample students
        courseStudents = [
          { id: "1", name: "Alice Johnson", marks: "", maxMarks: 100 },
          { id: "2", name: "Bob Smith", marks: "", maxMarks: 100 },
          { id: "3", name: "Charlie Brown", marks: "", maxMarks: 100 },
          { id: "4", name: "Diana Prince", marks: "", maxMarks: 100 },
          { id: "5", name: "Eve Wilson", marks: "", maxMarks: 100 },
        ]
      }

      // load saved results for this course & assessment
      const rawResults = localStorage.getItem("results")
      if (rawResults) {
        try {
          const results = JSON.parse(rawResults)
          if (results[courseId] && results[courseId][assessmentKey]) {
            const saved = results[courseId][assessmentKey] as Array<{ id: string; name: string; marks: string }>
            const savedMap: Record<string, string> = {}
            saved.forEach((r) => (savedMap[r.id] = r.marks))
            courseStudents = courseStudents.map((s) => ({ ...s, marks: savedMap[s.id] ?? s.marks }))
          }
        } catch (e) {
          console.error("Failed to parse results:", e)
        }
      }

      setStudents(courseStudents)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!selectedCourse) return
    loadStudentsForCourse(selectedCourse, assessment)
  }, [selectedCourse, assessment])

  const handleMarksChange = (id: string, value: string) => {
    setStudents((s) => s.map((x) => (x.id === id ? { ...x, marks: value } : x)))
  }

  const getGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const handleSave = () => {
    if (!selectedCourse) return
    try {
      const raw = localStorage.getItem("results")
      const results = raw ? JSON.parse(raw) : {}
      results[selectedCourse] = results[selectedCourse] || {}
      results[selectedCourse][assessment] = students.map((s) => ({ id: s.id, name: s.name, marks: s.marks }))
      localStorage.setItem("results", JSON.stringify(results))
      window.dispatchEvent(new Event("activities-updated"))
      alert("Results saved")
    } catch (e) {
      console.error(e)
      alert("Failed to save results")
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Upload Results</h1>
      <p className="text-muted-foreground mb-8">Enter and manage student grades</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <label className="block text-sm font-medium mb-2 text-foreground">Assessment Type</label>
          <select
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="midterm">Midterm Exam</option>
            <option value="final">Final Exam</option>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Enter Student Marks</h2>
          <p className="text-sm text-muted-foreground mt-1">Out of {students[0]?.maxMarks}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student Name</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Marks</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Out of</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Percentage</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const percentage = student.marks ? Math.round((Number.parseInt(student.marks) / student.maxMarks) * 100) : 0
                const grade = student.marks ? getGrade(Number.parseInt(student.marks), student.maxMarks) : "-"

                return (
                  <tr key={student.id} className="hover:bg-muted/50 transition-all">
                    <td className="px-6 py-4 text-foreground font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={student.maxMarks}
                        value={student.marks}
                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                        className="w-20 px-2 py-1 border border-input rounded text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 text-center text-foreground">{student.maxMarks}</td>
                    <td className="px-6 py-4 text-center text-foreground font-medium">{percentage}%</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                          grade === "A"
                            ? "bg-green-100 text-green-800"
                            : grade === "B"
                              ? "bg-blue-100 text-blue-800"
                              : grade === "C"
                                ? "bg-yellow-100 text-yellow-800"
                                : grade === "D"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all">
            Save Results
          </button>
          <button className="px-6 bg-muted hover:bg-border text-foreground font-semibold py-2.5 rounded-lg transition-all">
            Cancel
          </button>
        </div>
      </Card>
    </div>
  )
}
