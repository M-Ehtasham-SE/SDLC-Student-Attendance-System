"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface AttendanceRecord {
  date: string
  status: "present" | "absent"
}

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("math101")
  const [attendanceData] = useState<Record<string, AttendanceRecord[]>>({
    math101: [
      { date: "2024-01-15", status: "present" },
      { date: "2024-01-16", status: "present" },
      { date: "2024-01-17", status: "absent" },
      { date: "2024-01-18", status: "present" },
      { date: "2024-01-19", status: "present" },
      { date: "2024-01-22", status: "present" },
      { date: "2024-01-23", status: "present" },
      { date: "2024-01-24", status: "absent" },
      { date: "2024-01-25", status: "present" },
      { date: "2024-01-26", status: "present" },
      { date: "2024-01-29", status: "present" },
      { date: "2024-01-30", status: "present" },
    ],
  })

  const records = attendanceData[selectedCourse] || []
  const presentCount = records.filter((r) => r.status === "present").length
  const absentCount = records.filter((r) => r.status === "absent").length
  const attendance = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Attendance Record</h1>
      <p className="text-muted-foreground mb-8">View your attendance details for each course</p>

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Total Classes</p>
          <p className="text-3xl font-bold text-foreground mt-2">{records.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Present</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{presentCount}</p>
        </Card>

        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Absent</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{absentCount}</p>
        </Card>

        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Attendance %</p>
          <p className={`text-3xl font-bold mt-2 ${attendance >= 75 ? "text-green-600" : "text-red-600"}`}>
            {attendance}%
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Attendance Timeline</h2>
        </div>

        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {records.map((record, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-all">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                    record.status === "present" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {record.status === "present" ? "✓" : "✗"}
                </div>
                <div>
                  <p className="font-medium text-foreground">{formatDate(record.date)}</p>
                  <p className="text-sm text-muted-foreground capitalize">{record.status}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  record.status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
