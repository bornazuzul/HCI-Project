"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/app/providers";
import { ArrowLeft, Shield, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login...");
      const result = await login(email, password);

      if (result.success) {
        console.log("Login successful, waiting for auth state update...");

        // Wait a bit for the auth state to update
        setTimeout(() => {
          console.log("Redirecting to home page...");
          window.location.href = "/"; // Use window.location for guaranteed redirect
        }, 500);
      } else {
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Information */}
          <div className="space-y-8">
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

            {/* Demo Accounts */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-semibold text-primary">
                    QUICK ACCESS FOR TESTING
                  </span>
                </div>
                <h4 className="font-semibold mb-3">Try Demo Accounts</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  These accounts reset daily. Use them to explore the platform
                  without creating an account.
                </p>

                <div className="space-y-3">
                  <div className="bg-white/50 rounded-lg p-3 border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Regular Volunteer Account
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs font-medium min-w-[60px]">
                          Email:
                        </span>
                        <code className="text-xs bg-primary/10 px-3 py-1.5 rounded flex-1 font-mono break-all">
                          user@volunme.com
                        </code>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs font-medium min-w-[60px]">
                          Password:
                        </span>
                        <code className="text-xs bg-primary/10 px-3 py-1.5 rounded flex-1 font-mono">
                          user123
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-lg p-3 border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Administrator Account
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs font-medium min-w-[60px]">
                          Email:
                        </span>
                        <code className="text-xs bg-secondary/10 px-3 py-1.5 rounded flex-1 font-mono break-all text-secondary">
                          admin@volunme.com
                        </code>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs font-medium min-w-[60px]">
                          Password:
                        </span>
                        <code className="text-xs bg-secondary/10 px-3 py-1.5 rounded flex-1 font-mono text-secondary">
                          Admin123
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Note: These are demo accounts. Please create your own account
                  for personal use.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Login Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sign In to Your Account
                </h2>
                <p className="text-muted-foreground">
                  Enter your credentials below to access your volunteer
                  dashboard
                </p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Before you begin:
                </p>
                <p className="text-xs text-blue-700">
                  Make sure you have your email and password ready. The system
                  will verify your credentials before granting access.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

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
