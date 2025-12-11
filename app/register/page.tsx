"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/app/providers";
import RegisterForm from "@/components/auth/register-form";
import { ArrowLeft, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      await register(name, email, password);
      router.push("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleBack = () => {
    // Navigate back using window.history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home if no history
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Safety
          </Button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Join VolunMe
          </h1>
          <p className="text-muted-foreground text-lg">
            Start making a difference in your community today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Information */}
          <div className="space-y-22">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Secure Login Portal</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Welcome to Our{" "}
                <span className="text-primary">Volunteer Community</span>
              </h1>
            </div>

            {/* System Requirements Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">
                    What We Need From You
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Valid Email Address
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Enter the email you registered with. Must be active and
                        accessible for verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Secure Password</h4>
                      <p className="text-xs text-muted-foreground">
                        Your private password (case-sensitive). Minimum 8
                        characters with letters and numbers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Login Form */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <RegisterForm onSubmit={handleRegister} />

              {/* Helper Links */}
              <div className="space-y-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    New to our community?{" "}
                    <Link
                      href="/register"
                      className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Create your account
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
