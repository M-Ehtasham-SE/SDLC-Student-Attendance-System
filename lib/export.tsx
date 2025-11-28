export const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export const exportToPDF = (content: string, filename: string) => {
  const element = document.createElement("div")
  element.innerHTML = content
  element.style.padding = "20px"
  element.style.fontFamily = "Arial, sans-serif"
  element.style.fontSize = "12px"

  const printWindow = window.open("", "", "height=600,width=800")
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .header p { margin: 5px 0; color: #666; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <script>
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }
}
