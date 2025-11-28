"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ReportGenerator } from "@/components/report-generator"
import { exportToCSV, exportToPDF } from "@/lib/export"

type ReportType = "attendance" | "results" | "activities" | "export"

export default function ReportsPage() {
  const [active, setActive] = useState<ReportType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [courses, setCourses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])

  // report preview data
  const [reportData, setReportData] = useState<any[]>([])
  const [reportTitle, setReportTitle] = useState<string>("")
  const [reportColumns, setReportColumns] = useState<string[]>([])

  useEffect(() => {
    try {
      const rawCourses = localStorage.getItem("courses")
      setCourses(rawCourses ? JSON.parse(rawCourses) : [])
    } catch (e) {
      setCourses([])
    }
    try {
      const rawUsers = localStorage.getItem("users")
      setUsers(rawUsers ? JSON.parse(rawUsers) : [])
    } catch (e) {
      setUsers([])
    }
    try {
      const rawActs = localStorage.getItem("activities")
      setActivities(rawActs ? JSON.parse(rawActs) : [])
    } catch (e) {
      setActivities([])
    }
    try {
      const rawResults = localStorage.getItem("results")
      setResults(rawResults ? JSON.parse(rawResults) : [])
    } catch (e) {
      setResults([])
    }
  }, [])

  const openReport = (type: ReportType) => {
    setActive(type)
    setModalOpen(true)
    setReportData([])
    setReportTitle("")
    setReportColumns([])
  }

  const generateAttendance = () => {
    // attendance stored as { courseId: [{ student_name, student_id, status, date }, ...] }
    try {
      const raw = localStorage.getItem("attendance")
      if (!raw) return setReportData([])
      const attendance = JSON.parse(raw) as Record<string, Array<any>>
      // produce per-student summary across all courses
      const summary: Record<string, any> = {}
      for (const courseId in attendance) {
        const recs = attendance[courseId] || []
        recs.forEach((r: any) => {
          const id = r.student_id || r.studentId || r.id || r.student_id || r.name || `${r.student_name || ""}`
          const key = `${r.student_id || r.studentId || r.student_name || r.name}`
          if (!summary[key]) summary[key] = { student_name: r.student_name || r.name || key, student_id: r.student_id || r.studentId || "-", present: 0, absent: 0 }
          if (r.status === "present") summary[key].present++
          else summary[key].absent++
        })
      }
      const data = Object.values(summary).map((s: any) => ({ ...s, percentage: `${Math.round((s.present / (s.present + s.absent || 1)) * 100)}%` }))
      setReportTitle("Attendance Report")
      setReportColumns(["Student Name", "ID", "Present", "Absent", "Percentage"])
      setReportData(data)
    } catch (e) {
      console.error(e)
      setReportData([])
    }
  }

  const generateResults = () => {
    // use localStorage.results if present, otherwise show empty
    const data = results && results.length ? results : []
    setReportTitle("Results Report")
    setReportColumns(["Student Name", "ID", "Assessment", "Marks", "Grade"])
    setReportData(
      data.map((r: any) => ({ student_name: r.student_name || r.name, student_id: r.student_id || r.id, assessment: r.assessment || r.exam, marks: r.marks || r.score, grade: r.grade || "-" })),
    )
  }

  const generateActivities = () => {
    const data = activities || []
    setReportTitle("User Activity Report")
    setReportColumns(["Action", "Time"])
    setReportData(data.map((a: any) => ({ action: a.action, time: new Date(a.timestamp).toLocaleString() })))
  }

  const exportSystemData = (format: "csv" | "pdf", which: "users" | "courses" | "activities" | "all") => {
    let data: any[] = []
    if (which === "users" || which === "all") data = data.concat(users)
    if (which === "courses" || which === "all") data = data.concat(courses)
    if (which === "activities" || which === "all") data = data.concat(activities)

    if (format === "csv") exportToCSV(data, `export-${which}`)
    else {
      const htmlContent = `<h1>Export - ${which}</h1><pre>${JSON.stringify(data, null, 2)}</pre>`
      exportToPDF(htmlContent, `export-${which}`)
    }
  }

  const onGenerate = () => {
    if (!active) return
    if (active === "attendance") generateAttendance()
    if (active === "results") generateResults()
    if (active === "activities") generateActivities()
    if (active === "export") {
      // default to export all users and courses preview
      setReportTitle("Export Preview")
      setReportColumns(["Type", "Data"])
      const preview = [
        ...users.map((u: any) => ({ Type: "user", Data: JSON.stringify(u) })),
        ...courses.map((c: any) => ({ Type: "course", Data: JSON.stringify(c) })),
      ]
      setReportData(preview)
    }
  }

  const downloadReport = (format: "csv" | "pdf") => {
    if (!reportData || reportData.length === 0) return
    if (format === "csv") exportToCSV(reportData, reportTitle.toLowerCase().replace(/\s+/g, "-"))
    else {
      const cols = reportColumns
      const html = `
        <div class="header"><h1>${reportTitle}</h1><p>Generated ${new Date().toLocaleString()}</p></div>
        <table>
          <thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>
            ${reportData
              .map(
                (row: any) => `<tr>${cols.map((col) => `<td>${row[col.toLowerCase().replace(/\s+/g, "_")] ?? Object.values(row)[0]}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      `
      exportToPDF(html, reportTitle.toLowerCase().replace(/\s+/g, "-"))
    }
  }

  const recordActivity = (action: string) => {
    try {
      const rawAct = localStorage.getItem("activities")
      const acts = rawAct ? JSON.parse(rawAct) : []
      acts.push({ action, timestamp: Date.now() })
      localStorage.setItem("activities", JSON.stringify(acts))
      window.dispatchEvent(new Event("activities-updated"))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Reports</h1>
      <p className="text-muted-foreground mb-8">Generate and view system reports</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 text-foreground">Attendance Report</h2>
          <p className="text-muted-foreground mb-4">Generate attendance reports by course or student</p>
          <div className="flex gap-2">
            <button
              onClick={() => openReport("attendance")}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all"
            >
              Generate Report
            </button>
            <button
              onClick={() => {
                // quick export all attendance raw
                try {
                  const raw = localStorage.getItem("attendance")
                  const data = raw ? JSON.parse(raw) : {}
                  exportToCSV(Object.entries(data).flatMap(([k, v]) => (v as any[]).map((r) => ({ course: k, ...r }))), "attendance-export")
                  recordActivity("Exported attendance data")
                } catch (e) {
                  console.error(e)
                }
              }}
              className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-lg"
            >
              Export
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 text-foreground">Results Report</h2>
          <p className="text-muted-foreground mb-4">Generate results reports and grade analysis</p>
          <div className="flex gap-2">
            <button
              onClick={() => openReport("results")}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all"
            >
              Generate Report
            </button>
            <button
              onClick={() => {
                try {
                  const raw = localStorage.getItem("results")
                  const data = raw ? JSON.parse(raw) : []
                  exportToCSV(data, "results-export")
                  recordActivity("Exported results data")
                } catch (e) {
                  console.error(e)
                }
              }}
              className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-lg"
            >
              Export
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 text-foreground">User Activity Report</h2>
          <p className="text-muted-foreground mb-4">Track user activities and system usage</p>
          <div className="flex gap-2">
            <button
              onClick={() => openReport("activities")}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all"
            >
              Generate Report
            </button>
            <button
              onClick={() => {
                try {
                  const raw = localStorage.getItem("activities")
                  const data = raw ? JSON.parse(raw) : []
                  exportToCSV(data, "activities-export")
                  recordActivity("Exported activities data")
                } catch (e) {
                  console.error(e)
                }
              }}
              className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-lg"
            >
              Export
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 text-foreground">Export Data</h2>
          <p className="text-muted-foreground mb-4">Export system data to CSV or PDF format</p>
          <div className="flex gap-2">
            <button
              onClick={() => openReport("export")}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all"
            >
              Preview & Export
            </button>
            <div className="flex gap-2">
              <button onClick={() => exportSystemData("csv", "all")} className="px-4 py-2 bg-secondary/20 rounded-lg">
                CSV
              </button>
              <button onClick={() => exportSystemData("pdf", "all")} className="px-4 py-2 bg-secondary/20 rounded-lg">
                PDF
              </button>
            </div>
          </div>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-auto">
          <Card className="w-full max-w-4xl p-6 mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                {active === "attendance"
                  ? "Attendance Report"
                  : active === "results"
                  ? "Results Report"
                  : active === "activities"
                  ? "User Activity Report"
                  : "Export Preview"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setModalOpen(false)
                    setActive(null)
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={() => {
                  onGenerate()
                  recordActivity(`Generated ${active} report`)
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded mr-2"
              >
                Generate
              </button>
              <button onClick={() => downloadReport("csv")} className="px-4 py-2 bg-secondary/20 rounded mr-2">
                Download CSV
              </button>
              <button onClick={() => downloadReport("pdf")} className="px-4 py-2 bg-secondary/20 rounded">
                Download PDF
              </button>
            </div>

            <div>
              <ReportGenerator title={reportTitle || "Report"} data={reportData} columns={reportColumns} />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
