"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useApp } from "@/app/providers";

export default function AuthStateDebug() {
  const { data: session } = authClient.useSession();
  const { user, isLoggedIn, isLoading } = useApp();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="space-y-2">
        <div>
          <strong>Better Auth Session:</strong>
          <pre className="mt-1 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        <div>
          <strong>App Context:</strong>
          <pre className="mt-1 overflow-auto">
            {JSON.stringify({ user, isLoggedIn, isLoading }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
