'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

const protectedRoutes = [
  '/settings',
  '/create',
  '/routine', //todo shouldnt this just be routine/id/edit 
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (user: User) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existing) return;

    const { username, display_name } = user.user_metadata as {
      username?: string;
      display_name?: string;
    };

    if (!username || !display_name || !user.email) return;

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username,
      display_name,
      email: user.email,
    });

    if (error) console.error('Failed to create profile:', error.message);
  };

  useEffect(() => {
    const current = window.location.pathname;

    const isProtected = protectedRoutes.some((path) =>
      current === path || current.startsWith(`${path}/`) && current.endsWith('/edit')
    );

    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      if (data.session?.user && data.session.user.confirmed_at) {
        await ensureProfile(data.session.user);
      } else if (isProtected) {
        redirectToLogin();
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_evt, s) => {
        setSession(s);
        setLoading(false);
        if (s?.user && s.user.confirmed_at) {
          await ensureProfile(s.user);
        } else if (isProtected) {
          redirectToLogin();
        }
      },
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  const redirectToLogin = () => {
    const current = window.location.pathname;
    if (current !== '/login' && current !== '/signup') {
      window.location.href = '/login';
    }
  };

  const value = useMemo(
    () => ({ session, loading }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
