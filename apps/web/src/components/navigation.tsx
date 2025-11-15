"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

function resolveHomeUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL ?? "/";
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && /^https?:\/\//.test(envUrl)) {
    return envUrl;
  }
  if (envUrl) {
    const base = window.location.origin.replace(/\/$/, "");
    const path = envUrl.startsWith("/") ? envUrl : `/${envUrl}`;
    return `${base}${path}`;
  }
  return window.location.origin;
}

export function Navigation() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutMessage, setSignOutMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutMessage("Signing you out...");
    try {
      await signOut();
      setSignOutMessage("Signed out. Redirecting to home...");
      const destination = resolveHomeUrl();
      if (typeof window === "undefined") {
        router.replace("/");
      } else {
        window.location.href = destination;
      }
    } catch (error) {
      console.error("Sign-out failed", error);
      setSignOutMessage("Sign-out failed. Please try again.");
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MathQuest Florida
            </Link>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MathQuest Florida
            </Link>
            {user && (
              <div className="hidden md:flex space-x-6">
                <Link
                  href="/practice"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Practice
                </Link>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden text-sm text-gray-700 sm:inline">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </span>
                <div className="flex flex-col items-start">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={signingOut}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {signingOut ? "Signing Out..." : "Sign Out"}
                  </Button>
                  {signOutMessage && (
                    <span className="mt-1 text-xs text-gray-500" role="status" aria-live="polite">
                      {signOutMessage}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
