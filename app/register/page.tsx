"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/app/providers"
import RegisterForm from "@/components/auth/register-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useApp()

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      await register(name, email, password)
      router.push("/")
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Join VolunMe</h1>
          <p className="text-muted-foreground text-lg">Start making a difference in your community today</p>
        </div>

        <RegisterForm onSubmit={handleRegister} />

        <p className="text-center text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
