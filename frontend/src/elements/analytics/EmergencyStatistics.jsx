import React from 'react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts'

const chartData = [
  {
    month: 'Jan',
    emergency: 42,
  },
  {
    month: 'Feb',
    emergency: 35,
  },
  {
    month: 'Mar',
    emergency: 48,
  },
  {
    month: 'Apr',
    emergency: 70,
  },
  {
    month: 'May',
    emergency: 66,
  },
  {
    month: 'Jun',
    emergency: 82,
  },
  {
    month: 'Jul',
    emergency: 74,
  },
  {
    month: 'Aug',
    emergency: 55,
  }
]

const chartConfig = {
  emergency: {
    label: "Emergency Cases",
    color: "#ef4444",
  },
}

const EmergencyStatistics = () => {
  return (
    <Card className='w-full'>

      <CardHeader>
        <CardTitle>
          Monthly Emergency Statistics
        </CardTitle>
      </CardHeader>

      <CardContent>

        <ChartContainer
          config={chartConfig}
          className="w-full min-h-[300px]"
        >

          <AreaChart data={chartData}>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis />

            <ChartTooltip
              content={<ChartTooltipContent />}
            />

            <Area
              type="monotone"
              dataKey="emergency"
              fill="#fca5a5"
              stroke="#ef4444"
              strokeWidth={3}
            />

          </AreaChart>

        </ChartContainer>

      </CardContent>

    </Card>
  )
}

export default EmergencyStatistics