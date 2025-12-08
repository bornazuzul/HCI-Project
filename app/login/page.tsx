"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/app/providers";
import LoginForm from "@/components/auth/login-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password, "user");
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in to continue your volunteering journey
          </p>
        </div>

        <LoginForm onSubmit={handleLogin} />

        <p className="text-center text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Create one now
          </Link>
        </p>

        <div className="mt-8 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
          <p className="text-xs text-muted-foreground text-center">
            Try demo account:{" "}
            <span className="font-semibold text-foreground">
              john@example.com
            </span>{" "}
            / <span className="font-semibold text-foreground">user123</span>
            <span className="font-semibold text-foreground">
              admin@example.com
            </span>{" "}
            / <span className="font-semibold text-foreground">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
