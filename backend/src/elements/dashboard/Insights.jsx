import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
const Insights = () => {
  return (
    <>
    
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mt-5 '>
        <Card>
          <CardHeader>
            <div className='h-10 w-10 bg-primary'></div>
            <CardTitle className='text-xl font-bold'>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>1242</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className='h-10 w-10 bg-accent'></div>

            <CardTitle className='text-xl font-bold'>Emergency Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p>42</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='h-10 w-10 bg-secondary'></div>

            <CardTitle className='text-xl font-bold'>Available Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <p>18</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className='h-10 w-10 bg-muted'></div>

            <CardTitle className='text-xl font-bold'>Doctors On Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <p>24</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className='h-10 w-10 bg-primary/30'></div>

            <CardTitle className='text-xl font-bold'>Total Appointments</CardTitle>
          </CardHeader>
          <CardContent >
            <p>156</p>
          </CardContent>
        </Card>

      </div>
    </>
  )
}

export default Insights
