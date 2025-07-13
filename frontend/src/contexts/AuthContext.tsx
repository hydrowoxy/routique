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

    if (!username || !display_name) return;

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username,
      display_name,
    });

    if (error) console.error('Failed to create profile:', error.message);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) await ensureProfile(data.session.user);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_evt, s) => {
        setSession(s);
        if (s?.user) await ensureProfile(s.user);
        setLoading(false);
      },
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ session, loading }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
