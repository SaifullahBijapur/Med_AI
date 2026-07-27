import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  {
    department: "Cardiology",
    patients: 120,
  },
  {
    department: "Neurology",
    patients: 98,
  },
  {
    department: "Orthopedic",
    patients: 86,
  },
  {
    department: "Pediatrics",
    patients: 140,
  },
  {
    department: "Emergency",
    patients: 170,
  },
]

const chartConfig = {
  patients: {
    label: "Patients",
    color: "#2563eb",
  },
}

const DepartmentPerformance = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Department Performance
        </CardTitle>
      </CardHeader>

      <CardContent>

        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] w-full"
        >
          <BarChart data={chartData}>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
            />

            <YAxis />

            <ChartTooltip
              content={<ChartTooltipContent />}
            />

            <Bar
              dataKey="patients"
              radius={8}
            />

          </BarChart>
        </ChartContainer>

      </CardContent>
    </Card>
  )
}

export default DepartmentPerformance