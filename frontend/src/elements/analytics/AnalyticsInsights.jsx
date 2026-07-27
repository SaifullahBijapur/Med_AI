import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'

const AnalyticsInsights = ({ colorMap }) => {

  const dashboardStats = [
    {
      title: "Patient Growth",
      value: "+4.2%",
      color: "success",
    },
    {
      title: "Avg Stay",
      value: "3.8d",
      color: "info",
    },
    {
      title: "Revenue Today",
      value: "₹2.4M",
      color: "purple",
    },
    {
      title: "Satisfaction",
      value: "94%",
      color: "warning",
    },
    {
      title: "ER Cases (WoW)",
      value: "−12%",
      color: "danger",
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 my-4'>

      {dashboardStats.map((stat, index) => {

        const { bg, text } = colorMap[stat.color]

        return (
          <Card
            key={index}
            className={` ${text}`}
          >

            <CardHeader>
              <div className='h-10 w-10 rounded-full bg-white/40'></div>

              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <h2 className='text-3xl font-bold'>
                {stat.value}
              </h2>
            </CardContent>

          </Card>
        )
      })}

    </div>
  )
}

export default AnalyticsInsights