"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface Assessment {
  type: string
  marks: number
  maxMarks: number
  date: string
  grade: string
}

export default function ResultsPage() {
  const [selectedCourse, setSelectedCourse] = useState("math101")
  const [results] = useState<Record<string, Assessment[]>>({
    math101: [
      { type: "Quiz 1", marks: 18, maxMarks: 20, date: "2024-01-20", grade: "A" },
      { type: "Assignment 1", marks: 45, maxMarks: 50, date: "2024-01-25", grade: "A" },
      { type: "Midterm Exam", marks: 85, maxMarks: 100, date: "2024-02-15", grade: "B+" },
      { type: "Quiz 2", marks: 19, maxMarks: 20, date: "2024-02-22", grade: "A" },
      { type: "Assignment 2", marks: 48, maxMarks: 50, date: "2024-03-10", grade: "A" },
    ],
  })

  const assessments = results[selectedCourse] || []
  const avgPercentage =
    assessments.length > 0
      ? Math.round((assessments.reduce((sum, a) => sum + a.marks / a.maxMarks, 0) / assessments.length) * 100)
      : 0

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    if (grade.startsWith("D")) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">My Results</h1>
      <p className="text-muted-foreground mb-8">View your assessments and grades</p>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2 text-foreground">Select Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-64 px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        >
          <option value="math101">Mathematics 101</option>
          <option value="calc201">Advanced Calculus</option>
          <option value="stats201">Statistics 201</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Total Assessments</p>
          <p className="text-3xl font-bold text-foreground mt-2">{assessments.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Average Score</p>
          <p className="text-3xl font-bold text-primary mt-2">{avgPercentage}%</p>
        </Card>

        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Current Standing</p>
          <p className="text-3xl font-bold text-accent mt-2">A</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Assessment Details</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assessment</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Marks</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Out of</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Percentage</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Grade</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assessments.map((assessment, idx) => {
                const percentage = Math.round((assessment.marks / assessment.maxMarks) * 100)
                return (
                  <tr key={idx} className="hover:bg-muted/50 transition-all">
                    <td className="px-6 py-4 text-foreground font-medium">{assessment.type}</td>
                    <td className="px-6 py-4 text-center text-foreground font-semibold">{assessment.marks}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{assessment.maxMarks}</td>
                    <td className="px-6 py-4 text-center text-foreground font-semibold">{percentage}%</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${getGradeColor(assessment.grade)}`}
                      >
                        {assessment.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
