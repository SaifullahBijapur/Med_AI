import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { GoogleLogin } from "@react-oauth/google"
type CredentialResponse = {
  credential?: string
  select_by?: string
}
import axios from "axios"
import { useState } from "react"
import { useNavigate } from 'react-router'
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await axios.post(
        "https://medai-production-8a03.up.railway.app/api/auth/login",
        {
          email,
          password,
        }
      )

      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
    } catch (error: any) {
      console.error(error)

      alert(
        error?.response?.data?.message ||
        "Login Failed"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const res = await axios.post(
        "https://medai-production-8a03.up.railway.app/api/auth/google",
        {
          credential: credentialResponse.credential,
        }
      )

      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
      console.log(res.data)
      alert("Google Login Successful")
    } catch (error: any) {
      console.error(error)

      alert(
        error?.response?.data?.message ||
        "Google Login Failed"
      )
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-5">
            <FieldGroup>
              <Field className="">

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    console.log("Google Login Failed")
                  }

                />

              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  } />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <span
                    onClick={() => navigate("/signup")}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium"
                  >
                    Sign up
                  </span>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}