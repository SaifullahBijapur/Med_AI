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
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  {
    day: "Mon",
    patients: 120,
  },
  {
    day: "Tue",
    patients: 145,
  },
  {
    day: "Wed",
    patients: 132,
  },
  {
    day: "Thu",
    patients: 170,
  },
  {
    day: "Fri",
    patients: 190,
  },
  {
    day: "Sat",
    patients: 210,
  },
  {
    day: "Sun",
    patients: 185,
  },
]

const chartConfig = {
  patients: {
    label: "Patients",
    color: "#2563eb",
  },
}

const PatientTrends = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          7 Days Patient Trends
        </CardTitle>
      </CardHeader>

      <CardContent>

        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] w-full"
        >

          <LineChart data={chartData}>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
            />

            <YAxis />

            <ChartTooltip
              content={<ChartTooltipContent />}
            />

            <Line
              type="monotone"
              dataKey="patients"
              strokeWidth={3}
              dot={{ r: 5 }}
            />

          </LineChart>

        </ChartContainer>

      </CardContent>
    </Card>
  )
}

export default PatientTrends