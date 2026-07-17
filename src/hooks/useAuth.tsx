import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  standard: string | null;           // '10th' | 'intermediate' | 'diploma' | 'btech'
  academic_group: string | null;     // 'MPC' | 'BiPC' | 'CME'
  year_or_semester: string | null;   // '1st Year' | '2nd Year' | '1-1' | '1-2' etc.
  onboarding_complete: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (name: string, phone: string) => Promise<{ error: Error | null; isAdmin: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateAcademicProfile: (data: {
    standard: string;
    academic_group: string | null;
    year_or_semester: string | null;
    onboarding_complete: boolean;
  }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileData) {
      setProfile({
        id: profileData.id,
        user_id: profileData.user_id,
        name: profileData.name,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url ?? null,
        standard: (profileData as any).standard ?? null,
        academic_group: (profileData as any).academic_group ?? null,
        year_or_semester: (profileData as any).year_or_semester ?? null,
        onboarding_complete: (profileData as any).onboarding_complete ?? false,
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!roleData);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name, phone },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithPhone = async (name: string, phone: string) => {
    // Check if this is the admin
    const isAdminUser = name === "vrk.@info.in" && phone === "8297458070";

    // For demo purposes, we'll use email-based auth with phone as identifier
    const email = `${phone}@vrk-solutions.app`;
    const password = `vrk_${phone}_secure`;

    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If sign in fails, try to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name, phone },
        },
      });

      if (signUpError) {
        return { error: signUpError, isAdmin: false };
      }
    }

    // If admin credentials, set admin role using security definer function
    if (isAdminUser) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('set_admin_role', {
          _user_id: user.id,
          _name: name,
          _phone: phone
        });
      }
    }

    return { error: null, isAdmin: isAdminUser };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateAcademicProfile = async (data: {
    standard: string;
    academic_group: string | null;
    year_or_semester: string | null;
    onboarding_complete: boolean;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("profiles")
      .update({
        standard: data.standard,
        academic_group: data.academic_group,
        year_or_semester: data.year_or_semester,
        onboarding_complete: data.onboarding_complete,
      } as any)
      .eq("user_id", user.id);

    if (!error) {
      await fetchProfile(user.id);
    }

    return { error: error as unknown as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isLoading,
        signUp,
        signIn,
        signInWithPhone,
        signOut,
        refreshProfile,
        updateAcademicProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
