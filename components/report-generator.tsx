"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { exportToCSV, exportToPDF } from "@/lib/export"

interface ReportGeneratorProps {
  title: string
  data: any[]
  columns: string[]
}

export function ReportGenerator({ title, data, columns }: ReportGeneratorProps) {
  const [format, setFormat] = useState<"csv" | "pdf">("csv")

  const handleExport = () => {
    if (format === "csv") {
      exportToCSV(data, title.toLowerCase().replace(/\s+/g, "-"))
    } else {
      const htmlContent = `
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${columns.map((col) => `<th>${col}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${columns
                  .map((col) => {
                    const key = col.toLowerCase().replace(/\s+/g, "_")
                    return `<td>${row[key] || "-"}</td>`
                  })
                  .join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
      exportToPDF(htmlContent, title.toLowerCase().replace(/\s+/g, "-"))
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Export Report</h3>
          <p className="text-sm text-muted-foreground mt-1">{data.length} records</p>
        </div>
        <div className="flex gap-3">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "csv" | "pdf")}
            className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm"
          >
            <option value="csv">CSV Format</option>
            <option value="pdf">PDF Format</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all text-sm"
          >
            Download Report
          </button>
        </div>
      </div>
    </Card>
  )
}
