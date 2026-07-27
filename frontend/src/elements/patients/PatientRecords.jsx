import React from 'react'
import {Card,CardContent,CardHeader} from '@/components/ui/card'
import { useState ,useEffect} from 'react'
import axios from 'axios'
const PatientRecords =  () => {
  const [data,setData]=useState(null);
  const patientData=async()=>{
    try{

      const response=await axios.get("http://localhost:5000/api/auth/patientsdata")
      setData(response.data.patients);
    }catch(error){
      console.log(error);
    }
  }
  useEffect(()=>{
patientData();
  },[])
  return (
    <>
    <Card className='h-screen w-full'>
      <CardHeader>
        <h2>Patient Records</h2>
      </CardHeader>
      <CardContent>
        {data ? (
          <ul>
            {data.map((patient,index) => (
              <div className='flex justify-between py-2 border-b'>


              <li key={patient._id}>

                <div className='flex-col'>
                  <p className='font-semibold'>Patient {index+1}</p>
                <p className='font-normal text-gray-500'>Name: {patient.name}</p>
                <p className='font-normal text-gray-500'>Symptoms: {patient.symptoms}</p>
                
                </div>
                <span>

                <p className='font-normal text-gray-500'>Age: {patient.age}</p>
                </span>
              </li>
              </div>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </CardContent>
    </Card>
    
    </>
  )
}

export default PatientRecords
