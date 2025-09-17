"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "tutor", label: "Tutor / Coach" },
];

const EXAMS = [
  { value: "SAT", label: "SAT" },
  { value: "PERT", label: "PERT" },
];

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [targetExam, setTargetExam] = useState("SAT");
  const [parentEmail, setParentEmail] = useState("");
  const [householdCode, setHouseholdCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const metadata = {
    display_name: displayName,
    role,
    target_exam: targetExam,
    parent_email: parentEmail || null,
    household_code: householdCode || null,
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/practice`,
        data: metadata,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user) {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleMagicLinkSignUp = async () => {
    setLoading(true);
    setError("");

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/practice`,
        data: metadata,
      },
    });

    if (magicError) {
      setError(magicError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-emerald-600">?</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
            <p className="text-gray-600">
              We sent a confirmation link to <strong>{email}</strong>. Confirm your address and you&apos;ll be routed straight to your first quest.
            </p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create your MathQuest account</h2>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ll personalize quests based on your role and goals. Parents can optionally link a learner email now or later.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    placeholder="What should we call you?"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    I am a...
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  >
                    {ROLES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="targetExam" className="block text-sm font-medium text-gray-700">
                    Target exam
                  </label>
                  <select
                    id="targetExam"
                    value={targetExam}
                    onChange={(event) => setTargetExam(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  >
                    {EXAMS.map((exam) => (
                      <option key={exam.value} value={exam.value}>
                        {exam.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
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
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">
                    Parent email (optional)
                  </label>
                  <input
                    id="parentEmail"
                    type="email"
                    value={parentEmail}
                    onChange={(event) => setParentEmail(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    placeholder="guardian@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="householdCode" className="block text-sm font-medium text-gray-700">
                    Invite code (optional)
                  </label>
                  <input
                    id="householdCode"
                    type="text"
                    value={householdCode}
                    onChange={(event) => setHouseholdCode(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    placeholder="Provided by your tutor"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create account"}
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

            <Button onClick={handleMagicLinkSignUp} disabled={loading || !email} variant="outline" className="w-full">
              {loading ? "Sending..." : "Sign up with magic link"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in
              </Link>
            </p>
          </div>

          <aside className="hidden flex-col justify-between rounded-2xl border border-purple-100 bg-purple-50/80 p-6 md:flex">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-900">What happens next?</h3>
              <ul className="space-y-3 text-sm text-purple-800">
                <li>• Confirm your email and you&apos;ll land on your first adaptive quest.</li>
                <li>• Invite parents or tutors anytime—multi-user households share progress automatically.</li>
                <li>• Need help? Use the in-app coach or email support@mathquest.app.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-purple-200 bg-white/80 p-4 text-sm text-purple-800 shadow-sm">
              <p>
                Supabase powers authentication. Make sure the project URL and anon key are set in `.env.local` before testing multi-user flows locally.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
