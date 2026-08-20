import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export function UpdatePasswordModal() {
  const { isPasswordRecovery, setIsPasswordRecovery, updateUserPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updateUserPassword(password);
      if (!error) {
        setIsPasswordRecovery(false);
        setPassword("");
        setConfirmPassword("");
        // Limpiar hash de la URL si lo hay
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        router.navigate({ to: "/dashboard" });
      } else {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al actualizar contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isPasswordRecovery} onOpenChange={setIsPasswordRecovery}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="text-center sm:text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 rounded-2xl flex items-center justify-center shadow-inner">
            <KeyRound className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Establecer Nueva Contraseña
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Ingresa y confirma tu nueva clave para acceder a la plataforma.
            </DialogDescription>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 text-xs text-red-600 dark:text-red-400 font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-emerald-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-emerald-500"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 text-sm gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando contraseña...
              </>
            ) : (
              <>
                Guardar Contraseña y Entrar
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
