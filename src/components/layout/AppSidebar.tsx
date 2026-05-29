import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, Clock, Settings, LogIn, FileBarChart, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { useProfile } from "@/context/ProfileContext";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventario", url: "/inventario", icon: Package },
  { title: "Informes", url: "/informes", icon: FileBarChart },
  { title: "Horarios", url: "/horarios", icon: Clock },
  { title: "Ajustes", url: "/ajustes", icon: Settings },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => (p === "/" ? currentPath === "/" : currentPath.startsWith(p));
  const { profile } = useProfile();

  const isPremium = profile.stylePreset === "obsidian";

  return (
    <Sidebar collapsible="icon" className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-r-slate-200 dark:border-r-slate-800">
      <SidebarHeader className={`p-4 group-data-[collapsible=icon]:p-2 transition-all ${isPremium ? "border-b border-border dark:border-primary/5" : "border-b border-sidebar-border"}`}>
        <Link to="/" className="flex items-center gap-3 justify-start hover:opacity-80 transition-opacity px-2">
          <div className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 flex items-center justify-center shrink-0 overflow-hidden rounded-xl transition-all">
            <img src="/isa.svg" alt="FitHub Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden text-left">
            <span className={isPremium ? "font-mono font-bold text-slate-900 dark:text-slate-100 text-sm tracking-widest uppercase" : "font-bold text-slate-900 dark:text-slate-100 text-base leading-tight"}>
              {isPremium ? "[FITHUB_SYS]" : "FitHub"}
            </span>
            <span className={isPremium ? "font-mono text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5" : "text-xs text-slate-500 dark:text-slate-400"}>
              {isPremium ? "TELEMETRY_LOG_v2.0" : "Gestión de Inventario"}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isPremium ? "font-mono text-[8px] uppercase tracking-widest text-muted-foreground" : ""}>
            {isPremium ? "[ SYS_NAV // SELECT_PATH ]" : "Navegación"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title} className={`h-11 text-base transition-colors ${
                      isPremium 
                        ? `font-mono text-xs uppercase tracking-wider rounded-[3px] ${
                            active 
                              ? "bg-muted/40 dark:bg-primary/3 text-primary dark:text-emerald-400 border-l-[3px] border-l-primary dark:border-l-emerald-400 pl-2.5 font-bold" 
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pl-3"
                          }`
                        : active 
                        ? "text-emerald-700 dark:text-emerald-400 font-medium" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 shrink-0 ${isPremium ? "h-4 w-4" : ""}`} />
                        <span>
                          {isPremium ? `${item.title.toUpperCase()}` : item.title}
                        </span>
                        {isPremium && active && (
                          <span className="ml-auto text-[8px] opacity-60">ACTIVE</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isPremium && (
          <div className="mt-auto p-4 group-data-[collapsible=icon]:hidden">
            <div className="border border-border dark:border-primary/5 bg-muted/40 rounded-[3px] p-2.5 font-mono text-[8px] text-muted-foreground uppercase space-y-1">
              <div className="flex justify-between">
                <span>SYSTEM_STATUS:</span>
                <span className="text-emerald-500 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>TIME_ZONE:</span>
                <span>BOGOTA_COL</span>
              </div>
              <div className="flex justify-between">
                <span>BUFFER_OPS:</span>
                <span>NOMINAL</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className={`p-3 flex flex-col gap-2 ${isPremium ? "border-t border-border dark:border-primary/5" : "border-t border-slate-200"}`}>
        <AddProductDialog 
          customTrigger={
            <Button
              className={
                isPremium 
                  ? "h-10 bg-transparent hover:bg-muted/40 text-primary dark:text-emerald-400 border border-border dark:border-primary/5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-[3px] gap-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
                  : "h-12 bg-white hover:bg-slate-50 text-emerald-600 border border-emerald-200 font-semibold rounded-xl gap-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
              }
            >
              <Plus className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                {isPremium ? "NUEVO_PRODUCTO" : "Nuevo Producto"}
              </span>
            </Button>
          }
        />
        <Button
          asChild
          className={
            isPremium
              ? "h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-mono text-[10px] font-bold uppercase tracking-wider rounded-[3px] gap-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
              : "h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl gap-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
          }
        >
          <Link to="/horarios">
            <LogIn className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              {isPremium ? "REGISTRO_TURNO" : "Registrar Turno"}
            </span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
