import React ,{useState,useEffect}from 'react'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {Card,CardHeader,CardContent,CardTitle} from '@/components/ui/card'
const formSchema = z.object({
  patientname: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  age: z.string().min(1, {
    message: "Age is required."
  }),  
  cheifComplaint: z.string().min(6, {
    message: "Describe symptoms.."
  }),
  
})



const PatientRegister = () => {

  const [patientInfo,setPatientInfo]=useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientname: "",
      age: "",
      cheifComplaint:"",
      phone:""
    },
  })


  const handleSubmit=async(values)=>{

    try{

      const response =await axios.post("http://localhost:5000/api/auth/register",{
        patientname:values.patientname,
        age:values.age,
        symptoms:values.cheifComplaint,
        phone:values.phone
      })
      if(response.data.success){
        alert("Patient Registered successfully");
        form.reset();
        const getInfo=await axios.post("http://localhost:5000/api/triage/analyze",{
          symptoms:values.cheifComplaint,
          age:values.age
        })
        console.log(getInfo.data);
        setPatientInfo(getInfo.data);
      }
    }catch(error){
      console.log(error);
    }

  }
  return (
    <div className='flex gap-5 w-full'>
    <Card className='p-5 h-full w-full'>
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>
      </CardHeader>

      <Form {...form}>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='space-y-5'
        >

          <FormField
            control={form.control}
            name="patientname"
            render={({ field }) => (
              <FormItem>

                <FormLabel>
                  Patient Name
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter Patient name"
                    {...field}
                    />
                </FormControl>

                <FormMessage />

              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>

                <FormLabel>
                  Age
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter Age"
                    {...field}
                  />
                </FormControl>

                <FormMessage />

              </FormItem>
            )}
          />
          
          <FormField 
          control={form.control}
          name="phone"
          render={({field})=>(
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
          />
          
          <FormField
          control={form.control}
          name="cheifComplaint"
          render={({field})=>(
            <FormItem>
              <FormLabel>Chief Complaint</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe symptoms..." {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
          />
          <Button type="submit">
            Register Patient
          </Button>

        </form>

      </Form>

    </Card>
    <Card className='w-full p-5 '>
      <CardHeader>
        <CardTitle>AI generated Patient details</CardTitle>
      </CardHeader>
      <CardContent>
       {
        patientInfo &&(
          <div>
            

            <p>Assigned Doctor :{patientInfo?.doctor}</p>
            <p>Emergency Case :{patientInfo?.emergency.emergency}</p>
            <p>Severity :{patientInfo?.triage?.severity}</p>
            <p>Department :{patientInfo?.triage?.department}</p>
            <p>Queue Score :{patientInfo?.queue?.queueScore}</p>
          </div>
        )
       }
      </CardContent>
    </Card>
            </div>
  )
}

export default PatientRegister