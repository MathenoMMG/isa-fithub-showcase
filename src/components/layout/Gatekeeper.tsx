import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Gatekeeper({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isGranted = localStorage.getItem("fithub_auth_granted_v2");
    if (isGranted === "true") {
      setGranted(true);
    }
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "IsaMat2026") {
      localStorage.setItem("fithub_auth_granted_v2", "true");
      setGranted(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!mounted) return null; // Wait for client side hydration
  
  if (granted) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Ingresa la contraseña para acceder a FitHub Manager.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500 mt-2 text-left">Contraseña incorrecta</p>}
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
