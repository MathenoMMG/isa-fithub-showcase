import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@tanstack/react-router";
import { Lock, Mail, Eye, EyeOff, Loader2, KeyRound, ShieldCheck, ArrowRight } from "lucide-react";
import { isEmailAllowed } from "@/lib/auth-config";

interface LoginModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LoginModal({ trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: LoginModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn, sendPasswordReset } = useAuth();
  const router = useRouter();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage("Por favor completa tu correo y contraseña.");
      return;
    }

    if (!isEmailAllowed(trimmedEmail)) {
      setErrorMessage("Este correo no está registrado en la lista de acceso de FitHub.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(trimmedEmail, password);
      if (!error) {
        setIsOpen(false);
        router.navigate({ to: "/dashboard" });
      } else {
        setErrorMessage(
          error.message.includes("Invalid login credentials")
            ? "Contraseña o correo incorrectos. Por favor verifica tus datos."
            : error.message
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el ingreso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Ingresa tu correo para enviarte el enlace de recuperación.");
      return;
    }

    if (!isEmailAllowed(trimmedEmail)) {
      setErrorMessage("Este correo no está registrado en la lista de acceso de FitHub.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await sendPasswordReset(trimmedEmail);
      if (!error) {
        setIsResetMode(false);
      } else {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al solicitar recuperación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="text-center sm:text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 rounded-2xl flex items-center justify-center shadow-inner">
            {isResetMode ? (
              <KeyRound className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          <div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isResetMode ? "Recuperar Contraseña" : "Acceso FitHub Manager"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isResetMode
                ? "Te enviaremos un correo con instrucciones para restablecer tu clave."
                : "Ingresa con tu correo autorizado y contraseña."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 text-xs text-red-600 dark:text-red-400 font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {!isResetMode ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="isa@fithub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-emerald-500"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contraseña</Label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setIsResetMode(true);
                  }}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-emerald-500"
                  required
                  autoComplete="current-password"
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 text-sm gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  Ingresar a la Plataforma
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Registrado</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="isa@fithub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-emerald-500"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  "Enviar Enlace de Recuperación"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setErrorMessage(null);
                  setIsResetMode(false);
                }}
                className="w-full h-10 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Volver a Iniciar Sesión
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
