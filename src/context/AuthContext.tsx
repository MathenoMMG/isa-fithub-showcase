import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isEmailAllowed } from "@/lib/auth-config";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAllowed: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserAccess = async (currentSession: Session | null) => {
    if (!currentSession?.user?.email) {
      setSession(null);
      setUser(null);
      return false;
    }

    const email = currentSession.user.email;
    if (!isEmailAllowed(email)) {
      console.warn(`[FitHub Security] Intento de acceso no autorizado con correo: ${email}`);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      toast.error("Acceso restringido: Esta cuenta no está en la lista blanca del sistema.");
      return false;
    }

    setSession(currentSession);
    setUser(currentSession.user);
    return true;
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error al obtener sesión de Supabase:", error);
        }
        if (mounted) {
          await checkUserAccess(initialSession);
        }
      } catch (err) {
        console.error("Error inicializando Auth:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setLoading(true);
        await checkUserAccess(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Verificación preventiva antes de llamar a Supabase
    if (!isEmailAllowed(trimmedEmail)) {
      const err = new Error("El correo ingresado no está autorizado para ingresar a FitHub.");
      toast.error(err.message);
      return { error: err };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        toast.error(`Error al ingresar: ${error.message}`);
        return { error };
      }

      if (data.session) {
        const allowed = await checkUserAccess(data.session);
        if (!allowed) {
          return { error: new Error("Cuenta no autorizada.") };
        }
        toast.success("¡Bienvenida de nuevo a FitHub!");
      }

      return { error: null };
    } catch (err: any) {
      const e = err instanceof Error ? err : new Error(String(err));
      toast.error(e.message);
      return { error: e };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      try {
        localStorage.removeItem("fithub_auth_granted_v3");
        localStorage.removeItem("fithub_auth_granted_v2");
      } catch (e) {}
      toast.info("Has cerrado sesión exitosamente.");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const sendPasswordReset = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!isEmailAllowed(trimmedEmail)) {
      const err = new Error("El correo no se encuentra registrado en la lista permitida.");
      toast.error(err.message);
      return { error: err };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) {
        toast.error(`Error al enviar recuperación: ${error.message}`);
        return { error };
      }
      toast.success("Te hemos enviado un enlace a tu correo para restablecer tu contraseña.");
      return { error: null };
    } catch (err: any) {
      const e = err instanceof Error ? err : new Error(String(err));
      return { error: e };
    }
  };

  const isAuthenticated = useMemo(() => !!session && !!user && isEmailAllowed(user.email), [session, user]);
  const isAllowed = useMemo(() => isEmailAllowed(user?.email), [user]);

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    isAllowed,
    signIn,
    signOut,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
