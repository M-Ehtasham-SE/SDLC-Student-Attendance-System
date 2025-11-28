"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ReportGenerator } from "@/components/report-generator"

export default function ResultsReportPage() {
  const [course, setCourse] = useState("all")
  const [assessment, setAssessment] = useState("all")

  const reportData = [
    {
      student_name: "Alice Johnson",
      student_id: "S001",
      course_code: "MATH101",
      midterm: 85,
      final: 88,
      average: "86.5",
      grade: "B+",
    },
    {
      student_name: "Bob Smith",
      student_id: "S002",
      course_code: "MATH101",
      midterm: 92,
      final: 90,
      average: "91",
      grade: "A",
    },
    {
      student_name: "Charlie Brown",
      student_id: "S003",
      course_code: "MATH101",
      midterm: 78,
      final: 82,
      average: "80",
      grade: "B",
    },
    {
      student_name: "Diana Prince",
      student_id: "S004",
      course_code: "CALC201",
      midterm: 88,
      final: 91,
      average: "89.5",
      grade: "A",
    },
    {
      student_name: "Eve Wilson",
      student_id: "S005",
      course_code: "CALC201",
      midterm: 95,
      final: 92,
      average: "93.5",
      grade: "A",
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Results Report</h1>
      <p className="text-muted-foreground mb-8">Generate and export student results and grades</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Course</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="all">All Courses</option>
            <option value="math101">Mathematics 101</option>
            <option value="calc201">Advanced Calculus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Assessment</label>
          <select
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="all">All Assessments</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student Name</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">ID</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Course</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Midterm</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Final</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Average</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-all">
                  <td className="px-6 py-4 text-foreground font-medium">{row.student_name}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.student_id}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.course_code}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.midterm}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.final}</td>
                  <td className="px-6 py-4 text-center text-foreground font-semibold">{row.average}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                        row.grade === "A" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {row.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ReportGenerator
        title="Results Report"
        data={reportData}
        columns={["Student Name", "ID", "Course", "Midterm", "Final", "Average", "Grade"]}
      />
    </div>
  )
}
