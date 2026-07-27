import { Activity, Calendar, ShieldPlus, Users } from "lucide-react"
import SignupForm from '../elements/SignupForm'

export default function Register() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative flex-col justify-center items-center text-white 
        bg-gradient-to-br from-teal-800 via-cyan-800 to-slate-950 overflow-hidden">

        {/* soft glow background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
 <img
    src="MediHive.png"
    className="absolute inset-0 w-full h-full object-cover opacity-30"
  />

        <div className="relative max-w-xl ">

          {/* Brand */}
          <h1 className="text-6xl font-extrabold tracking-tight leading-tight">
            MediHive <span className="text-cyan-300">AI</span>
          </h1>

          <p className="mt-4 text-lg text-cyan-100/90 leading-relaxed">
            AI-powered healthcare management system designed for speed, clarity, and intelligent decision making.
          </p>

          <div className="mt-12 space-y-7">

            
            
            
           

          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-6">

        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Sign Up to continue to your MedAI dashboard
            </p>
          </div>

          {/* Card style form wrapper */}
          <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800">
            <SignupForm />
          </div>

        </div>
      </div>
    </div>
  )
}