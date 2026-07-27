import React from 'react'
import DoctorSchedule from './doctors/DoctorSchedule'
import DoctorsRecords from './doctors/DoctorsRecords'
const Doctors = () => {
  return (
    <div className='flex flex-col md:flex-row'>
      <DoctorsRecords/>
      <DoctorSchedule/>
    </div>
  )
}

export default Doctors
