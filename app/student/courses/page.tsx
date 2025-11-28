"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface StudentCourse {
  id: string
  name: string
  code: string
  instructor: string
  schedule: string
  credits: number
}

export default function StudentCoursesPage() {
  const [courses] = useState<StudentCourse[]>([
    {
      id: "1",
      name: "Mathematics 101",
      code: "MATH101",
      instructor: "Dr. Sarah Johnson",
      schedule: "MWF 9:00-10:30 AM",
      credits: 3,
    },
    {
      id: "2",
      name: "Advanced Calculus",
      code: "CALC201",
      instructor: "Prof. John Smith",
      schedule: "TTh 1:00-2:30 PM",
      credits: 4,
    },
    {
      id: "3",
      name: "Statistics 201",
      code: "STATS201",
      instructor: "Dr. Emily Brown",
      schedule: "MWF 11:00 AM-12:30 PM",
      credits: 3,
    },
  ])

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">My Courses</h1>
      <p className="text-muted-foreground mb-8">View your enrolled courses and schedules</p>

      <div className="mb-8 bg-primary/10 rounded-lg p-4 border border-primary/20">
        <p className="text-sm text-muted-foreground">Total Credit Hours</p>
        <p className="text-2xl font-bold text-primary mt-1">{totalCredits} Credits</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-6 border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.code}</p>
              </div>
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                {course.credits} Credits
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Instructor</p>
                <p className="font-medium text-foreground">{course.instructor}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Schedule</p>
                <p className="font-medium text-foreground">{course.schedule}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <a
                href="/student/attendance"
                className="flex-1 px-3 py-2 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded transition-all font-medium text-center"
              >
                View Attendance
              </a>
              <a
                href="/student/results"
                className="flex-1 px-3 py-2 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 rounded transition-all font-medium text-center"
              >
                View Results
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
