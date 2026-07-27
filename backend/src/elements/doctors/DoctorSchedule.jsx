import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
const doctorSchedule = {
    initials: "RV",
    name: "Dr. Rahul Verma",
    specialization: "Cardiologist",
    qualification: "MBBS, MD, DM",
    hospital: "AIIMS Delhi",
    department: "Cardiology",
    status: "Available",

    schedule: [
        {
            time: "9:00 AM",
            title: "Ward Rounds — ICU",
            details: "4 patients · 45 min",
            status: "Done",
        },
        {
            time: "10:00 AM",
            title: "Lata Sharma — OPD",
            details: "Follow-up consultation",
            status: "Done",
        },
        {
            time: "10:30 AM",
            title: "Rajesh Patel — OPD",
            details: "Angioplasty follow-up",
            status: "In Progress",
        },
        {
            time: "11:30 AM",
            title: "Team Meeting — Cath Lab",
            details: "Case discussion",
            status: "Upcoming",
        },
        {
            time: "2:00 PM",
            title: "Ravi Gupta — Surgery",
            details: "Bypass surgery",
            status: "Scheduled",
        },
    ],
};
const DoctorSchedule = () => {
    return (
        <>
            <Card className='w-full h-screen'>
                <CardHeader>
                    Today's Schedule — Dr. Rahul Verma
                </CardHeader>
                <CardContent>
                    
                    {
                        doctorSchedule.schedule.map((item, index) => (
                            <div
                                key={index}
                                className="border rounded-xl p-4 mb-3 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-lg">{item.title}</h2>
                                    <span className="text-sm px-3 py-1 rounded-full bg-gray-100">
                                        {item.status}
                                    </span>
                                </div>

                                <p className="text-gray-500">{item.time}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {item.details}
                                </p>
                            </div>
                        ))
                    }
                    


                </CardContent>
            </Card>
        </>
    )
}

export default DoctorSchedule
