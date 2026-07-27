import * as React from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"

const Form = FormProvider

const FormField = ({ ...props }) => {
  return <Controller {...props} />
}

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`space-y-2 ${className}`} {...props} />
))

const FormLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium ${className}`}
    {...props}
  />
))

const FormControl = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} {...props} />
))

const FormMessage = () => {
  const {
    formState: { errors },
  } = useFormContext()

  const error = Object.values(errors)[0]

  if (!error) return null

  return (
    <p className="text-sm text-red-500">
      {error.message?.toString()}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}