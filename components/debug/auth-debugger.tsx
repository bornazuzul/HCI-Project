// components/debug/auth-debugger.tsx
"use client";

import { useEffect } from "react";
import { useApp } from "@/app/providers";

export default function AuthDebugger() {
  const { isLoggedIn, user, isLoading } = useApp();

  useEffect(() => {
    console.log("Auth Debug - Current State:", {
      isLoggedIn,
      user: user
        ? { id: user.id, email: user.email, name: user.name, role: user.role }
        : null,
      isLoading,
      timestamp: new Date().toISOString(),
    });
  }, [isLoggedIn, user, isLoading]);

  return null;
}
