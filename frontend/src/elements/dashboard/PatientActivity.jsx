import React from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
} from "@/components/ui/chart"

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
} from "recharts"

const data = [
  { month: "Jan", patients: 120 },
  { month: "Feb", patients: 200 },
  { month: "Mar", patients: 180 },
]

const PatientActivity = () => {
  return (
    <Card className="rounded-3xl shadow-xl border-0">

      <CardHeader>
        <CardTitle>
          Patient Activity
        </CardTitle>
      </CardHeader>

      <CardContent>

        <ChartContainer
          config={{
            patients: {
              label: "Patients",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[300px] w-full"
        >

          <LineChart
            accessibilityLayer
            data={data}
          >

            <CartesianGrid vertical={false} />

            <XAxis dataKey="month" />

            <Line
              type="monotone"
              dataKey="patients"
              stroke="var(--color-patients)"
              strokeWidth={3}
            />

          </LineChart>

        </ChartContainer>

      </CardContent>

    </Card>
  )
}

export default PatientActivity