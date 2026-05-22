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

  return (
    <Sidebar collapsible="icon" className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-r-slate-200 dark:border-r-slate-800">
      <SidebarHeader className="border-b border-sidebar-border p-4 group-data-[collapsible=icon]:p-2 transition-all">
        <Link to="/" className="flex items-center gap-3 justify-center hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 flex items-center justify-center shrink-0 overflow-hidden rounded-xl transition-all">
            <img src="/isa.svg" alt="FitHub Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden text-left">
            <span className="font-bold text-sidebar-foreground text-base leading-tight">FitHub</span>
            <span className="text-xs text-sidebar-foreground/70">Gestión de Inventario</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className="h-11 text-base">
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-3 flex flex-col gap-2">
        <AddProductDialog 
          customTrigger={
            <Button
              className="h-12 bg-white hover:bg-slate-50 text-emerald-600 border border-emerald-200 font-semibold rounded-xl gap-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
            >
              <Plus className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Añadir Producto</span>
            </Button>
          }
        />
        <Button
          asChild
          className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl gap-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
        >
          <Link to="/horarios">
            <LogIn className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Registrar Horario</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
