import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
const AiInsight = () => {
  return (
    <>
    <Card className='grid grid-col-1 gap-5  p-2'>
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className='bg-primary/20  p-2 border-primary/30 border-2 mx-2'>
              <h2>High patient load predicion-Cardiology</h2>
              <p>
                Expect 34% above average volume in the next 3 hours. Consider redistributing to Gen. Medicine.</p>

            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className='bg-primary/20 p-2 border-primary/30 border-2 mx-2'>

              <h2>High patient load predicion-Cardiology</h2>
              <p>
                Expect 34% above average volume in the next 3 hours. Consider redistributing to Gen. Medicine.</p>

            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className='bg-primary/20 p-2 border-primary/30 border-2 mx-2'>
              <h2>High patient load predicion-Cardiology</h2>
              <p>
                Expect 34% above average volume in the next 3 hours. Consider redistributing to Gen. Medicine.</p>

            </CardContent>
          </Card>
        </Card>
    </>
  )
}

export default AiInsight
