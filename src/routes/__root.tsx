import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StoreProvider } from "@/context/StoreContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { TimeLogProvider } from "@/context/TimeLogContext";
import { VisitProvider } from "@/context/VisitContext";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { GlowBackground } from "@/components/layout/GlowBackground";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { UpdatePasswordModal } from "@/components/auth/UpdatePasswordModal";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">Intenta recargar la página.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const start = window.scrollY;
    if (start === 0) return;
    const duration = 700;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start * (1 - easeInOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-xl border border-emerald-500/30 transition-all hover:scale-110 active:scale-95 duration-300 cursor-pointer animate-in fade-in zoom-in-75 duration-300"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
    </button>
  );
}

function ConnectionLogger() {
  const { profile } = useProfile();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    const logConnection = async () => {
      try {
        let ip = "Desconocida";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          if (res.ok) {
            const data = await res.json();
            ip = data.ip || "Desconocida";
          }
        } catch (e) {
          console.warn("No se pudo obtener la IP pública del cliente:", e);
        }

        if (!active) return;

        await supabase.from("conexiones").insert({
          usuario: profile.name || "Mercaimpulsadora",
          ip: ip,
        });
      } catch (err) {
        console.error("Error al registrar conexión:", err);
      }
    };

    logConnection();

    return () => {
      active = false;
    };
  }, [profile.name, isAuthenticated]);

  return null;
}

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <>
        <Outlet />
        <UpdatePasswordModal />
        <Toaster richColors position="top-right" />
        <ScrollToTopButton />
      </>
    );
  }

  return (
    <AuthGuard>
      <ProfileProvider>
        <ConnectionLogger />
        <StoreProvider>
          <InventoryProvider>
            <TimeLogProvider>
              <VisitProvider>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 transition-colors relative">
                    <GlowBackground />
                    <AppSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                      <TopBar />
                      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto z-10">
                        <Outlet />
                      </main>
                    </div>
                  </div>
                  <UpdatePasswordModal />
                  <Toaster richColors position="top-right" />
                  <ScrollToTopButton />
                </SidebarProvider>
              </VisitProvider>
            </TimeLogProvider>
          </InventoryProvider>
        </StoreProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
