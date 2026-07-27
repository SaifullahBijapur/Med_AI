import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
const departments = [
  {
    name: "Emergency",
    value: 88,
  },
  {
    name: "Cardiology",
    value: 74,
  },
  {
    name: "Orthopedics",
    value: 61,
  },
  {
    name: "Neurology",
    value: 55,
  },
  {
    name: "Gen. Medicine",
    value: 42,
  },
  {
    name: "Pediatrics",
    value: 38,
  },
  {
    name: "Oncology",
    value: 29,
  },
]
const DepartmentLoad = () => {
  return (
    <>
           <Card className="rounded-3xl border-0 shadow-xl">

      <CardHeader>
        <CardTitle className="text-xl">
          Department Load
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {departments.map((dept) => (
          <div key={dept.name}>

            <div className="flex items-center justify-between mb-2">

              <h3 className="font-medium">
                {dept.name}
              </h3>

              <span className="text-sm text-muted-foreground">
                {dept.value}%
              </span>

            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">

              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${dept.value}%`,
                }}
              />

            </div>

          </div>
        ))}

      </CardContent>

    </Card></>
  )
}

export default DepartmentLoad
