"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

// wraps the whole app to provide authentication context
const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

// sets up the provider for authentication context
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);
      setSession(data.session);
      setLoading(false);
    };

    getInitialSession();

    // listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // cleanup listener on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const contextValue = useMemo(
    () => ({ session, loading }),
    [session, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// lets other components access the authentication context
export const useAuth = () => useContext(AuthContext);
