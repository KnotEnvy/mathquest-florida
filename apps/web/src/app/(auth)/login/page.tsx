"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  unknown: { label: "Checking Supabase...", tone: "text-slate-500" },
  online: { label: "Supabase connected", tone: "text-emerald-600" },
  offline: { label: "Supabase unavailable", tone: "text-rose-600" },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        setConnectionStatus(error ? "offline" : "online");
      } catch {
        setConnectionStatus("offline");
      }
    };

    verifyConnection();
  }, [supabase]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  const status = STATUS_COPY[connectionStatus];

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Check your inbox</h2>
            <p className="mt-2 text-gray-600">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Click the link in your email to sign in. It may take a few minutes to arrive.
            </p>
            <Button onClick={() => setMagicLinkSent(false)} variant="ghost" className="mt-4">
              ? Back to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-600">Sign in to resume your MathQuest journey</p>
          <p className={`text-xs font-medium ${status.tone}`}>{status.label}</p>
        </div>

        {error && (
          <div className="rounded-md bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <Button onClick={handleMagicLink} disabled={loading || !email} variant="outline" className="w-full">
          {loading ? "Sending..." : "Email me a magic link"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
