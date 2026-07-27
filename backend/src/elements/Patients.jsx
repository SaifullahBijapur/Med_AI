import React from 'react'
import PatientRegister from './patients/PatientRegister'
import PatientRecords from './patients/PatientRecords'
const Patient = () => {
  return (
    <div className='flex flex-col gap-5'>
      <PatientRegister/>
      <PatientRecords/>
      
    </div>
  )
}

export default Patient
