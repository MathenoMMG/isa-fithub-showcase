import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type GroupingState,
  type ExpandedState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/types/inventory";
import { ExpiryBadge } from "./ExpiryBadge";
import { QuantityStepper } from "./QuantityStepper";
import { formatExpiryDate } from "@/lib/expiry";
import { useInventory } from "@/context/InventoryContext";

interface Props {
  data: InventoryItem[];
  globalFilter: string;
}

export function InventoryTable({ data, globalFilter }: Props) {
  const { incrementStock, decrementStock } = useInventory();
  const [grouping, setGrouping] = useState<GroupingState>(["linea_producto"]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "linea_producto",
        header: "Línea",
        cell: ({ getValue }) => <span className="font-semibold">{String(getValue())}</span>,
      },
      {
        id: "producto",
        header: "Producto",
        accessorFn: (row) => `${row.nombre} ${row.subcategoria_sabor} ${row.sku}`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{row.original.nombre}</span>
            <span className="text-sm text-slate-500">
              {row.original.subcategoria_sabor} · {row.original.sku}
            </span>
          </div>
        ),
      },
      {
        id: "tienda",
        header: "Tienda",
        accessorKey: "id_tienda",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-sm font-medium border-slate-300">
            {row.original.id_tienda}
          </Badge>
        ),
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: ({ row }) => (
          <QuantityStepper
            value={row.original.cantidad}
            onIncrement={() => incrementStock(row.original.id)}
            onDecrement={() => decrementStock(row.original.id)}
          />
        ),
      },
      {
        accessorKey: "fecha_caducidad",
        header: "Caducidad",
        cell: ({ row }) => (
          <span className="text-slate-700 tabular-nums">{formatExpiryDate(row.original.fecha_caducidad)}</span>
        ),
      },
      {
        id: "estado",
        header: "Estado",
        cell: ({ row }) => <ExpiryBadge fecha={row.original.fecha_caducidad} />,
      },
    ],
    [incrementStock, decrementStock],
  );

  const table = useReactTable({
    data,
    columns,
    state: { grouping, expanded, globalFilter },
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-slate-50">
              {hg.headers.map((header) => {
                if (header.column.getIsGrouped()) return null;
                return (
                  <TableHead key={header.id} className="text-slate-600 font-semibold text-sm py-4 px-4">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500">
                No hay productos que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows.map((row) => {
            if (row.getIsGrouped()) {
              return (
                <TableRow
                  key={row.id}
                  className="bg-slate-100/60 hover:bg-slate-100 cursor-pointer"
                  onClick={row.getToggleExpandedHandler()}
                >
                  <TableCell
                    colSpan={columns.length - 1}
                    className="py-4 px-4 font-semibold text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      {row.getIsExpanded() ? (
                        <ChevronDown className="h-5 w-5 text-slate-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                      )}
                      <span className="text-base">{String(row.getValue("linea_producto"))}</span>
                      <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-700">
                        {row.subRows.length}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }
            return (
              <TableRow key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.getIsGrouped()) return null;
                  return (
                    <TableCell key={cell.id} className="py-4 px-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
