// apps/web/src/app/page.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Trophy, Brain, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
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
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Free Quest
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo" className="text-sm font-semibold leading-6 text-gray-900">
              Watch demo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
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
                  <Brain className="h-5 w-5 flex-none text-magenta-primary" />
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
                  <Target className="h-5 w-5 flex-none text-magenta-primary" />
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
                  <Trophy className="h-5 w-5 flex-none text-magenta-primary" />
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

      {/* Trust Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by thousands of students
              </h2>
              <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
                <div className="col-span-1 flex justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-magenta-primary">15+</div>
                    <div className="mt-1 text-sm text-gray-600">Percentile point improvement</div>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-magenta-primary">50K+</div>
                    <div className="mt-1 text-sm text-gray-600">Questions completed daily</div>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-magenta-primary">4.8★</div>
                    <div className="mt-1 text-sm text-gray-600">Average rating</div>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-magenta-primary">95%</div>
                    <div className="mt-1 text-sm text-gray-600">Recommend to friends</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
