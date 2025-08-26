'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export function Navigation() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MathQuest Florida
            </Link>
            <div className="h-8 w-20 animate-pulse bg-gray-200 rounded"></div>
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
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Practice
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.user_metadata?.display_name || user.email?.split('@')[0]}!
                </span>
                <Button onClick={() => {
                  console.log('Sign out button clicked');
                  signOut();
                }} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}