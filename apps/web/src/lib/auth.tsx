'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'no user');
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If user signs in, create profile if it doesn't exist
        if (event === 'SIGNED_IN' && session?.user) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              updated_at: new Date().toISOString(),
            });
          
          if (error) {
            console.error('Error creating profile:', error);
          }
        }
        
        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('signOut function called');
    try {
      const supabase = createClient();
      console.log('Calling supabase.auth.signOut()');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      console.log('Sign out successful');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}