import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ProfileProvider } from "@/context/ProfileContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StoreProvider } from "@/context/StoreContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { TimeLogProvider } from "@/context/TimeLogContext";
import { Toaster } from "@/components/ui/sonner";

import { VisitProvider } from "@/context/VisitContext";

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
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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

function RootComponent() {
  return (
    <ProfileProvider>
      <StoreProvider>
        <InventoryProvider>
          <TimeLogProvider>
            <VisitProvider>
              <SidebarProvider>
                <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <TopBar />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
                      <Outlet />
                    </main>
                  </div>
                </div>
                <Toaster richColors position="top-right" />
              </SidebarProvider>
            </VisitProvider>
          </TimeLogProvider>
        </InventoryProvider>
      </StoreProvider>
    </ProfileProvider>
  );
}
