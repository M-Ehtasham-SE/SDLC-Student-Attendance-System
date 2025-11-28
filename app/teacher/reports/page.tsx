"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ReportGenerator } from "@/components/report-generator"

export default function TeacherReportsPage() {
  const [selectedCourse, setSelectedCourse] = useState("math101")
  const [reportType, setReportType] = useState("attendance")

  const attendanceData = [
    { student_name: "Alice Johnson", student_id: "S001", present: 22, absent: 2, percentage: "92%" },
    { student_name: "Bob Smith", student_id: "S002", present: 20, absent: 4, percentage: "83%" },
    { student_name: "Charlie Brown", student_id: "S003", present: 18, absent: 6, percentage: "75%" },
  ]

  const resultsData = [
    {
      student_name: "Alice Johnson",
      student_id: "S001",
      assessment: "Midterm",
      marks: 85,
      percentage: "85%",
      grade: "B+",
    },
    { student_name: "Bob Smith", student_id: "S002", assessment: "Midterm", marks: 92, percentage: "92%", grade: "A" },
    {
      student_name: "Charlie Brown",
      student_id: "S003",
      assessment: "Midterm",
      marks: 78,
      percentage: "78%",
      grade: "C+",
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">My Reports</h1>
      <p className="text-muted-foreground mb-8">Generate and export class reports</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="math101">Mathematics 101</option>
            <option value="calc201">Advanced Calculus</option>
            <option value="stats201">Statistics 201</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="attendance">Attendance Report</option>
            <option value="results">Results Report</option>
          </select>
        </div>
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {reportType === "attendance" ? (
                  <>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student Name</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">ID</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Present</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Absent</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Percentage</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student Name</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">ID</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Assessment</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Marks</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Grade</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(reportType === "attendance" ? attendanceData : resultsData).map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-all">
                  {reportType === "attendance" ? (
                    <>
                      <td className="px-6 py-4 text-foreground font-medium">{(row as any).student_name}</td>
                      <td className="px-6 py-4 text-center text-foreground">{(row as any).student_id}</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">{(row as any).present}</td>
                      <td className="px-6 py-4 text-center text-red-600 font-semibold">{(row as any).absent}</td>
                      <td className="px-6 py-4 text-center font-semibold">{(row as any).percentage}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-foreground font-medium">{(row as any).student_name}</td>
                      <td className="px-6 py-4 text-center text-foreground">{(row as any).student_id}</td>
                      <td className="px-6 py-4 text-center text-foreground">{(row as any).assessment}</td>
                      <td className="px-6 py-4 text-center text-foreground">{(row as any).marks}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full font-bold text-sm bg-blue-100 text-blue-800">
                          {(row as any).grade}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ReportGenerator
        title={`${reportType === "attendance" ? "Attendance" : "Results"} Report - ${selectedCourse.toUpperCase()}`}
        data={reportType === "attendance" ? attendanceData : resultsData}
        columns={
          reportType === "attendance"
            ? ["Student Name", "ID", "Present", "Absent", "Percentage"]
            : ["Student Name", "ID", "Assessment", "Marks", "Grade"]
        }
      />
    </div>
  )
}
