"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ReportGenerator } from "@/components/report-generator"

export default function AttendanceReportPage() {
  const [course, setCourse] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const reportData = [
    {
      student_name: "Alice Johnson",
      student_id: "S001",
      course_code: "MATH101",
      classes_held: 24,
      present: 22,
      absent: 2,
      percentage: "92%",
    },
    {
      student_name: "Bob Smith",
      student_id: "S002",
      course_code: "MATH101",
      classes_held: 24,
      present: 20,
      absent: 4,
      percentage: "83%",
    },
    {
      student_name: "Charlie Brown",
      student_id: "S003",
      course_code: "MATH101",
      classes_held: 24,
      present: 18,
      absent: 6,
      percentage: "75%",
    },
    {
      student_name: "Diana Prince",
      student_id: "S004",
      course_code: "CALC201",
      classes_held: 20,
      present: 19,
      absent: 1,
      percentage: "95%",
    },
    {
      student_name: "Eve Wilson",
      student_id: "S005",
      course_code: "CALC201",
      classes_held: 20,
      present: 17,
      absent: 3,
      percentage: "85%",
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Attendance Report</h1>
      <p className="text-muted-foreground mb-8">Generate and export attendance statistics</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <option value="stats201">Statistics 201</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
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
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Classes</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Present</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Absent</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-all">
                  <td className="px-6 py-4 text-foreground font-medium">{row.student_name}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.student_id}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.course_code}</td>
                  <td className="px-6 py-4 text-center text-foreground">{row.classes_held}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">{row.present}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-semibold">{row.absent}</td>
                  <td className="px-6 py-4 text-center font-semibold">{row.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ReportGenerator
        title="Attendance Report"
        data={reportData}
        columns={["Student Name", "ID", "Course", "Classes", "Present", "Absent", "Percentage"]}
      />
    </div>
  )
}
