import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import AiInsight from './dashboard/AiInsight'
import RecentPatient from './dashboard/RecentPatient'
import DepartmentLoad from './dashboard/DepartmentLoad'
import UpcomingAppoinments from './dashboard/UpcomingAppoinments'
import PatientActivity from './dashboard/PatientActivity'
import Insights from './dashboard/Insights'

const Dashboard = () => {
  return (
    <div>
      dashboard
      <Insights/>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-5 gap-4'>
        {/**card1  */}
        <AiInsight/>
        {/**card2 */}
        <RecentPatient/>
        {/**Card3 */}

        <DepartmentLoad />
      </div>

      <div className='flex flex-col md:flex-row   mt-5 gap-4' >
        <UpcomingAppoinments />
        <PatientActivity />
      </div>



    </div>
  )
}

export default Dashboard
