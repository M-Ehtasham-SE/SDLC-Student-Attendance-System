"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface Course {
  id: string
  name: string
  code: string
  students: number
  startDate: string
}

export default function TeacherCoursesPage() {
  const [courses] = useState<Course[]>([
    { id: "1", name: "Mathematics 101", code: "MATH101", students: 45, startDate: "Jan 15, 2024" },
    { id: "2", name: "Advanced Calculus", code: "CALC201", students: 32, startDate: "Jan 15, 2024" },
    { id: "3", name: "Statistics 201", code: "STATS201", students: 38, startDate: "Feb 1, 2024" },
  ])

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">My Courses</h1>
      <p className="text-muted-foreground mb-8">Manage your assigned courses</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-accent">
            <h3 className="text-lg font-bold text-foreground mb-2">{course.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{course.code}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Enrolled Students</span>
                <span className="font-medium text-foreground">{course.students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium text-foreground">{course.startDate}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <a
                href="/teacher/attendance"
                className="flex-1 px-3 py-2 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded transition-all font-medium text-center"
              >
                Attendance
              </a>
              <a
                href="/teacher/results"
                className="flex-1 px-3 py-2 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 rounded transition-all font-medium text-center"
              >
                Results
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
