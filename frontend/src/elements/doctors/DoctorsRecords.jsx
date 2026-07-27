import React from 'react'

import {Card ,CardHeader,CardTitle,CardContent} from '@/components/ui/card'
const doctors = [
  {
    initials: "RV",
    name: "Dr. Rahul Verma",
    department: "Cardiology",
    experience: "12 yrs exp",
    status: "On Duty",
  },
  {
    initials: "PS",
    name: "Dr. Pooja Sharma",
    department: "Neurology",
    experience: "9 yrs exp",
    status: "On Duty",
  },
  {
    initials: "AK",
    name: "Dr. Arun Kapoor",
    department: "Orthopedics",
    experience: "15 yrs exp",
    status: "In Surgery",
  },
  {
    initials: "SR",
    name: "Dr. Swati Roy",
    department: "Pediatrics",
    experience: "7 yrs exp",
    status: "On Duty",
  },
  {
    initials: "KM",
    name: "Dr. Kunal Malhotra",
    department: "Emergency",
    experience: "11 yrs exp",
    status: "Emergency",
  },
  {
    initials: "NS",
    name: "Dr. Nisha Singh",
    department: "General Medicine",
    experience: "6 yrs exp",
    status: "Off Duty",
  },
  {
    initials: "VK",
    name: "Dr. Vivek Kumar",
    department: "Oncology",
    experience: "14 yrs exp",
    status: "On Duty",
  },
  {
    initials: "AD",
    name: "Dr. Ananya Das",
    department: "Dermatology",
    experience: "8 yrs exp",
    status: "On Duty",
  },
  {
    initials: "RJ",
    name: "Dr. Rohan Joshi",
    department: "ENT",
    experience: "10 yrs exp",
    status: "On Duty",
  },
  {
    initials: "MT",
    name: "Dr. Meera Tiwari",
    department: "Gynecology",
    experience: "13 yrs exp",
    status: "In Consultation",
  },
];



const DoctorsRecords = () => {
  return (
    <Card className='w-full h-screen p-2 m-2'>
        <CardHeader>
            <CardTitle>Doctor Directory</CardTitle>
        </CardHeader>
        <CardContent>

        {
            doctors.map((doctor)=>(
                <div className=' flex justify-between py-2 border-b'>
                    <div className='flex-col'>

                    <h2>{doctor.name}</h2>
                    <p>{doctor.department}</p>
                    </div>
                    <span>
                        <p>{doctor.status}</p>
                    </span>
                </div>
            ))
        }
        </CardContent>
    </Card>
  )
}

export default DoctorsRecords
