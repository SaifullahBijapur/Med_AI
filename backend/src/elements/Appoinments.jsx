import React from 'react'
import { Calendar } from "@/components/ui/calendar"
import {Card} from '@/components/ui/card'
const Appoinments = () => {
const [date, setDate] = React.useState(new Date())

  return (
    <div className='flex flex-col md:flex-row gap-4'>
      <Card className='w-full'>

      
       <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border"
      captionLayout="dropdown"
      />
      </Card>
      <Card className='w-full '></Card>
      <Card className='w-full'></Card>
      
    </div>
  )
}

export default Appoinments
