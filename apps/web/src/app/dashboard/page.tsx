'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth';

interface UserStats {
  totalAttempts: number;
  correctAttempts: number;
  xp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  recentAttempts: Array<{
    id: string;
    question: {
      domain: string;
      difficulty: number;
    };
    correct: boolean;
    timeSpent: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUserStats();
    }
  }, [user, loading, router]);

  const fetchUserStats = async () => {
    try {
      const [statsResponse, streakResponse] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/streaks')
      ]);

      if (statsResponse.ok && streakResponse.ok) {
        const [statsData, streakData] = await Promise.all([
          statsResponse.json(),
          streakResponse.json()
        ]);

        setStats({
          ...statsData,
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const accuracy = stats && stats.totalAttempts > 0 
    ? (stats.correctAttempts / stats.totalAttempts * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Keep up the great work with your math practice.
          </p>
        </div>

        {statsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading your progress...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* XP Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">⚡</div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats?.xp || 0}</p>
                    <p className="text-gray-600">Experience Points</p>
                  </div>
                </div>
              </div>

              {/* Level Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">🏆</div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">Level {stats?.currentLevel || 1}</p>
                    <p className="text-gray-600">Current Level</p>
                  </div>
                </div>
              </div>

              {/* Accuracy Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">🎯</div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
                    <p className="text-gray-600">Accuracy</p>
                  </div>
                </div>
              </div>

              {/* Questions Attempted */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">📝</div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalAttempts || 0}</p>
                    <p className="text-gray-600">Questions Attempted</p>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">🔥</div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats?.currentStreak || 0}</p>
                    <p className="text-gray-600">Current Streak</p>
                  </div>
                </div>
              </div>

              {/* Longest Streak */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">🏅</div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.longestStreak || 0}</p>
                    <p className="text-gray-600">Longest Streak</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/practice')} 
                  className="w-full"
                  size="lg"
                >
                  Continue Practicing
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    alert(`Current Streak: ${stats?.currentStreak || 0} days 🔥\nLongest Streak: ${stats?.longestStreak || 0} days 🏅`);
                  }}
                >
                  View Streak Details
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  AI Coach (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats && stats.recentAttempts.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.recentAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <div className={`text-lg mr-3 ${attempt.correct ? 'text-green-500' : 'text-red-500'}`}>
                        {attempt.correct ? '✅' : '❌'}
                      </div>
                      <div>
                        <p className="font-medium">{attempt.question.domain}</p>
                        <p className="text-sm text-gray-500">
                          {attempt.question.difficulty > 0.5 ? 'Hard' : 
                           attempt.question.difficulty > -0.5 ? 'Medium' : 'Easy'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {Math.round(attempt.timeSpent / 1000)}s
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No data state */}
        {stats && stats.totalAttempts === 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Ready to start learning?</h3>
            <p className="text-gray-600 mb-6">
              You haven&apos;t attempted any questions yet. Let&apos;s get started!
            </p>
            <Button onClick={() => router.push('/practice')} size="lg">
              Start Your First Practice Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}