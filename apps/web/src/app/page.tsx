// apps/web/src/app/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10">
          {/* Animated geometric shapes will go here */}
        </div>
        
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Turn test jitters into{' '}
            <span className="text-magenta-primary">daily wins</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Master SAT Math and Florida college readiness exams with AI-powered coaching, 
            adaptive practice, and game-like progression.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {loading ? (
              <div className="h-11 w-32 animate-pulse bg-gray-200 rounded"></div>
            ) : user ? (
              <Link href="/practice">
                <Button size="lg" className="gap-2">
                  Continue Practicing
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/practice" className="text-sm font-semibold leading-6 text-gray-900">
                  Try without signup <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="mt-16 flex justify-center gap-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-magenta-primary">13</div>
              <div className="text-sm text-gray-600">Questions Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-magenta-primary">4</div>
              <div className="text-sm text-gray-600">Math Domains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-magenta-primary">∞</div>
              <div className="text-sm text-gray-600">Practice Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Same as before */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-magenta-primary">
              Learn Smarter
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to ace your math exams
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  {/* Brain icon placeholder */}
                  <span className="h-5 w-5 flex-none text-magenta-primary">🧠</span>
                  AI-Powered Coach
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Get instant help from GPT-4 when you're stuck. Our AI coach provides 
                    hints, explanations, and encouragement tailored to your learning style.
                  </p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  {/* Target icon placeholder */}
                  <span className="h-5 w-5 flex-none text-magenta-primary">🎯</span>
                  Adaptive Difficulty
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Questions adjust to your skill level in real-time, keeping you in the 
                    optimal challenge zone for maximum learning.
                  </p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  {/* Trophy icon placeholder */}
                  <span className="h-5 w-5 flex-none text-magenta-primary">🏆</span>
                  Gamified Progress
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Earn XP, maintain streaks, unlock achievements, and customize your avatar 
                    as you master new concepts.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-magenta-primary/10 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to boost your math score?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start practicing now with our free questions. No sign-up required!
            </p>
            <div className="mt-8">
              {loading ? (
                <div className="h-11 w-40 mx-auto animate-pulse bg-gray-200 rounded"></div>
              ) : user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="default">
                    View Your Progress
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" variant="default">
                    Start Your Journey
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}