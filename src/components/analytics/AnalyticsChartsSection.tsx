import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { FileBarChart } from "lucide-react";
import { Card } from "@/components/ui/card";

const PIE_COLORS = ['#059669', '#0284c7', '#d97706', '#9333ea', '#db2777', '#0d9488', '#2563eb', '#65a30d'];

export interface CategoryChartItem {
  name: string;
  fullName?: string;
  vendidos: number;
}

export interface PieChartItem {
  name: string;
  value: number;
}

interface AnalyticsChartsSectionProps {
  loadingSales: boolean;
  topSold: CategoryChartItem[];
  categoryData: PieChartItem[];
  isDark: boolean;
  textColor: string;
  gridColor: string;
}

export function AnalyticsChartsSection({
  loadingSales,
  topSold,
  categoryData,
  isDark,
  textColor,
  gridColor,
}: AnalyticsChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart */}
      <Card className="p-[24px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2 transition-all">
        <h3 className="font-sans text-[16px] font-bold text-[#111827] dark:text-slate-100 mb-[24px] transition-colors">Top Categorías Más Vendidas</h3>
        <div className="h-[350px] w-full" id="chart-container">
          {loadingSales ? (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Cargando datos...</div>
          ) : topSold.filter(t => t.vendidos > 0).length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSold} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 11, fill: textColor }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: textColor }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #334155' : 'none', 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value: number) => [`${value} uds`]}
                />
                <Bar dataKey="vendidos" radius={[6, 6, 0, 0]}>
                  {topSold.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <FileBarChart size={32} className="text-[#D1D5DB] dark:text-slate-700 mb-3" />
              <p className="font-sans text-[13px] text-[#6B7280] dark:text-slate-400">Registra conteos para ver el análisis por categoría</p>
            </div>
          )}
        </div>
      </Card>

      {/* Pie Chart */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Ventas por Categoría</h3>
        <div className="h-[350px] w-full">
          {loadingSales ? (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Cargando...</div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke={isDark ? "#0f172a" : "#ffffff"}
                  strokeWidth={2}
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #334155' : 'none', 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                  formatter={(val: number) => [`${val} uds`]}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
              Sin datos
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
