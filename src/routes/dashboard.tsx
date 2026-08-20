import { createFileRoute } from "@tanstack/react-router";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardStoreCard } from "@/components/dashboard/DashboardStoreCard";
import { DashboardBanners } from "@/components/dashboard/DashboardBanners";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardJornada } from "@/components/dashboard/DashboardJornada";
import { DashboardActivity } from "@/components/dashboard/DashboardActivity";
import { DashboardShortcuts } from "@/components/dashboard/DashboardShortcuts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FitHub" },
      { name: "description", content: "Resumen de inventario y accesos rápidos." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { filteredItems, loading } = useInventory();
  const { store } = useStore();

  const getLastSyncText = () => {
    if (!filteredItems || filteredItems.length === 0) return "hace un momento";
    const allLotes = filteredItems.flatMap(i => i.lotes);
    if (allLotes.length === 0) return "hace un momento";
    return "hace un momento";
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-[24px] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      
      {loading ? (
        <Skeleton className="w-full h-44 sm:h-52 rounded-2xl" />
      ) : (
        <DashboardStoreCard />
      )}

      {loading ? (
        <Skeleton className="w-full h-[52px] rounded-lg" />
      ) : (
        <DashboardBanners />
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-[10px]">
          <Skeleton className="h-[90px] rounded-[10px]" />
          <Skeleton className="h-[90px] rounded-[10px]" />
          <Skeleton className="h-[90px] rounded-[10px]" />
        </div>
      ) : (
        <DashboardStats />
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
          <Skeleton className="h-[250px] rounded-[10px]" />
          <Skeleton className="h-[250px] rounded-[10px]" />
        </div>
      ) : (
        <DashboardAlerts />
      )}

      {loading ? (
        <Skeleton className="w-full h-[120px] rounded-[10px]" />
      ) : (
        <DashboardJornada />
      )}

      {loading ? (
        <Skeleton className="w-full h-[250px] rounded-[10px]" />
      ) : (
        <DashboardActivity />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
          <Skeleton className="h-[64px] rounded-[10px]" />
          <Skeleton className="h-[64px] rounded-[10px]" />
          <Skeleton className="h-[64px] rounded-[10px]" />
          <Skeleton className="h-[64px] rounded-[10px]" />
        </div>
      ) : (
        <DashboardShortcuts />
      )}

      <div className="text-center pt-[12px]">
        <p className="font-sans text-[10px] text-[#9CA3AF] m-0">
          Última sincronización: {getLastSyncText()} — FitHub Ciudad Demo
        </p>
      </div>

    </div>
  );
}
