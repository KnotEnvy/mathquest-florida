// apps/web/src/app/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Users2, Trophy as TrophyIcon, CalendarCheck, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth';

const FEATURE_CARDS = [
  {
    title: 'Adaptive Daily Quests',
    description: 'Five fresh questions tuned to the learner’s ability curve so practice always feels challenging but winnable.',
    icon: CalendarCheck,
  },
  {
    title: 'Instant AI Coaching',
    description: 'Ask for hints, full explanations, pep talks, or extra challenges without leaving the question flow.',
    icon: Sparkles,
  },
  {
    title: 'Progress That Motivates',
    description: 'XP, streaks, and mastery maps translate hard work into visible wins that keep students engaged.',
    icon: TrophyIcon,
  },
];

const EXPERIENCE_PANELS = [
  {
    heading: '1. Warm Up',
    body: 'Start with a quick diagnostic and accessibility preferences so MathQuest meets learners where they are.',
  },
  {
    heading: '2. Daily Flow',
    body: 'Tackle adaptive quests, call on the coach when stuck, and bank XP for streaks and cosmetic rewards.',
  },
  {
    heading: '3. Track & Celebrate',
    body: 'Parents and students get real-time dashboards with streak recovery tools, predictive scoring, and highlights to celebrate.',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-violet-50">
      <Navigation />
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pt-32 lg:px-8">
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-magenta-primary/20 blur-3xl" />
          </div>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-magenta-primary/20 bg-white px-4 py-1 text-sm font-medium text-magenta-primary shadow-sm">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  AI Coach + Adaptive Practice for SAT & PERT
                </span>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Turn test jitters into daily wins.
                </h1>
                <p className="max-w-xl text-lg text-slate-600">
                  MathQuest Florida pairs adaptive quests with an empathetic AI coach so learners build confidence, master tough concepts, and walk into the SAT ready to thrive.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {loading ? (
                    <div className="h-11 w-36 animate-pulse rounded-md bg-slate-200" />
                  ) : user ? (
                    <>
                      <Button size="lg" asChild>
                        <Link href="/practice">
                          Continue practicing <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/dashboard">View your dashboard</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" asChild>
                        <Link href="/register">
                          Start free quest <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </>
                  )}
                </div>
                <dl className="grid max-w-lg grid-cols-2 gap-6 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-slate-900">30k+</dt>
                    <dd>Learners in pilot quests</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">85%</dt>
                    <dd>Avg. quest completion rate</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900"><ShieldCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />FERPA</dt>
                    <dd>Built with privacy & safety defaults</dd>
                  </div>
                </dl>
              </div>
              <div className="relative rounded-3xl border border-magenta-primary/10 bg-white/70 p-8 shadow-xl backdrop-blur">
                <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-magenta-primary/20 bg-white px-4 py-2 text-sm font-medium text-magenta-primary shadow-sm lg:flex">
                  <Users2 className="h-4 w-4" aria-hidden="true" />
                  Parents, tutors, and learners onboard in minutes
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-magenta-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-magenta-primary">
                      Inside the practice flow
                    </span>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">Adaptive quest snapshot</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Gauge readiness with difficulty-balanced questions, then call on MathQuest Coach for hints, full explanations, or confidence boosts—no tutor scheduling required.
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <Brain className="mt-0.5 h-4 w-4 text-magenta-primary" aria-hidden="true" />
                      <span>Questions adapt in real time using ability estimates stored in Supabase profiles.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 text-magenta-primary" aria-hidden="true" />
                      <span>Coach responses stream from OpenAI with safety filters, caching, and rate limits baked in.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-magenta-primary" aria-hidden="true" />
                      <span>Progress, streaks, and XP sync instantly, keeping learners motivated across devices.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Built to unlock confident math thinking</h2>
              <p className="mt-4 text-lg text-slate-600">
                Every layer of MathQuest reinforces growth: adaptive content to keep learners in flow, an empathetic coach to remove friction, and meaningful rewards to celebrate consistency.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {FEATURE_CARDS.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <feature.icon className="h-10 w-10 text-magenta-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-magenta-primary/20 bg-white/80 p-10 shadow-lg backdrop-blur">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-magenta-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-magenta-primary">
                  How it works
                </span>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Support every learner—from first quest to test day</h2>
                <p className="text-slate-600">
                  Families and tutors get transparency, students stay motivated, and teachers can track growth without extra spreadsheets.
                </p>
              </div>
              <div className="space-y-4">
                {EXPERIENCE_PANELS.map((panel) => (
                  <div key={panel.heading} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">{panel.heading}</h3>
                    <p className="mt-2 text-sm text-slate-600">{panel.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

