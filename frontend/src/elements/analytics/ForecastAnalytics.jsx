import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { describe } from 'zod/v4/core'
const ForecastAnalytics = () => {
  const Pridictiondata=[
    {
      title:"Next 7 days prediction",
      describe:"Patient volume expected to rise 18% due to seasonal respiratory illnesses. Prepare additional Gen. Medicine capacity."
    },
    {
      title:"Peak hours forecast",
      describe:"Mon–Wed 10 AM–1 PM will see highest OPD load. AI recommends 2 additional consultation rooms."
    },
    {
      title:"Revenue forecast",
      describe:"Monthly billing on track. Projected ₹71.2M vs ₹68.5M target (+3.9%)" 
    }
  ]

  return (
    <Card className='w-full'>
            <CardHeader>
                Forecast Analytics
            </CardHeader>
            <CardContent>
              {
                Pridictiondata.map((items)=>{
                  return(
                    <div key={items.title} className='bg-primary/20 min-w-full my-2 p-2'>
                      <h3 className='text-primary'>{items.title}</h3>
                      <p>{items.describe}</p>
                    </div>
                  )
                })
              }
                
            </CardContent>
    
        </Card>
  )
}

export default ForecastAnalytics
