import type { InventoryItem } from "@/types/inventory";

// Helper to generate ISO dates relative to today
const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const mockInventory: InventoryItem[] = [
  // Proteínas - Sur
  { id: "1", id_tienda: "Sur", sku: "PRO-WHEY-CHO-2LB", nombre: "Whey Protein 2lb", linea_producto: "Proteínas", subcategoria_sabor: "Chocolate", cantidad: 12, fecha_caducidad: daysFromNow(180), proveedor: "MuscleTech" },
  { id: "2", id_tienda: "Sur", sku: "PRO-WHEY-VAN-2LB", nombre: "Whey Protein 2lb", linea_producto: "Proteínas", subcategoria_sabor: "Vainilla", cantidad: 8, fecha_caducidad: daysFromNow(15), proveedor: "MuscleTech" },
  { id: "3", id_tienda: "Sur", sku: "PRO-ISO-FRE-2LB", nombre: "Iso 100", linea_producto: "Proteínas", subcategoria_sabor: "Fresa", cantidad: 5, fecha_caducidad: daysFromNow(-10), proveedor: "Dymatize" },
  { id: "4", id_tienda: "Sur", sku: "PRO-CAS-CHO-2LB", nombre: "Caseína Nocturna", linea_producto: "Proteínas", subcategoria_sabor: "Chocolate", cantidad: 6, fecha_caducidad: daysFromNow(90), proveedor: "Optimum Nutrition" },

  // Pre-entrenos - Sur
  { id: "5", id_tienda: "Sur", sku: "PRE-C4-FRU", nombre: "C4 Original", linea_producto: "Pre-entrenos", subcategoria_sabor: "Frutas Tropicales", cantidad: 15, fecha_caducidad: daysFromNow(200), proveedor: "Cellucor" },
  { id: "6", id_tienda: "Sur", sku: "PRE-C4-PON", nombre: "C4 Original", linea_producto: "Pre-entrenos", subcategoria_sabor: "Ponche de Frutas", cantidad: 3, fecha_caducidad: daysFromNow(25), proveedor: "Cellucor" },
  { id: "7", id_tienda: "Sur", sku: "PRE-NOX-UVA", nombre: "NO Xplode", linea_producto: "Pre-entrenos", subcategoria_sabor: "Uva", cantidad: 7, fecha_caducidad: daysFromNow(120), proveedor: "BSN" },

  // Snacks - Sur
  { id: "8", id_tienda: "Sur", sku: "SNA-BAR-CHO", nombre: "Quest Bar", linea_producto: "Snacks", subcategoria_sabor: "Chocolate Chip", cantidad: 24, fecha_caducidad: daysFromNow(45), proveedor: "Quest" },
  { id: "9", id_tienda: "Sur", sku: "SNA-BAR-COO", nombre: "Quest Bar", linea_producto: "Snacks", subcategoria_sabor: "Cookies & Cream", cantidad: 18, fecha_caducidad: daysFromNow(5), proveedor: "Quest" },
  { id: "10", id_tienda: "Sur", sku: "SNA-PBC-MAN", nombre: "Peanut Butter Cups", linea_producto: "Snacks", subcategoria_sabor: "Mantequilla de Maní", cantidad: 30, fecha_caducidad: daysFromNow(-3), proveedor: "Quest" },

  // Bebidas - Sur
  { id: "11", id_tienda: "Sur", sku: "BEB-BCA-NAR", nombre: "BCAA Energy", linea_producto: "Bebidas", subcategoria_sabor: "Naranja", cantidad: 20, fecha_caducidad: daysFromNow(150), proveedor: "Evlution" },
  { id: "12", id_tienda: "Sur", sku: "BEB-ISO-LIM", nombre: "Isotónica Sport", linea_producto: "Bebidas", subcategoria_sabor: "Limón", cantidad: 36, fecha_caducidad: daysFromNow(60), proveedor: "Gatorade" },

  // Accesorios - Sur
  { id: "13", id_tienda: "Sur", sku: "ACC-SHK-NEG", nombre: "Shaker 600ml", linea_producto: "Accesorios", subcategoria_sabor: "Negro", cantidad: 14, fecha_caducidad: daysFromNow(800), proveedor: "BlenderBottle" },
  { id: "14", id_tienda: "Sur", sku: "ACC-GUA-L", nombre: "Guantes de Gym", linea_producto: "Accesorios", subcategoria_sabor: "Talla L", cantidad: 9, fecha_caducidad: daysFromNow(800), proveedor: "Harbinger" },

  // Norte
  { id: "15", id_tienda: "Norte", sku: "PRO-WHEY-CHO-2LB", nombre: "Whey Protein 2lb", linea_producto: "Proteínas", subcategoria_sabor: "Chocolate", cantidad: 10, fecha_caducidad: daysFromNow(220), proveedor: "MuscleTech" },
  { id: "16", id_tienda: "Norte", sku: "PRO-WHEY-COO-2LB", nombre: "Whey Protein 2lb", linea_producto: "Proteínas", subcategoria_sabor: "Cookies", cantidad: 4, fecha_caducidad: daysFromNow(20), proveedor: "MuscleTech" },
  { id: "17", id_tienda: "Norte", sku: "PRO-ISO-VAN-2LB", nombre: "Iso 100", linea_producto: "Proteínas", subcategoria_sabor: "Vainilla", cantidad: 2, fecha_caducidad: daysFromNow(-20), proveedor: "Dymatize" },
  { id: "18", id_tienda: "Norte", sku: "PRE-C4-CER", nombre: "C4 Original", linea_producto: "Pre-entrenos", subcategoria_sabor: "Cereza", cantidad: 11, fecha_caducidad: daysFromNow(180), proveedor: "Cellucor" },
  { id: "19", id_tienda: "Norte", sku: "PRE-PRE-MAN", nombre: "Pre Jym", linea_producto: "Pre-entrenos", subcategoria_sabor: "Mango", cantidad: 6, fecha_caducidad: daysFromNow(28), proveedor: "JYM" },
  { id: "20", id_tienda: "Norte", sku: "SNA-BAR-BRO", nombre: "Quest Bar", linea_producto: "Snacks", subcategoria_sabor: "Brownie", cantidad: 22, fecha_caducidad: daysFromNow(70), proveedor: "Quest" },
  { id: "21", id_tienda: "Norte", sku: "SNA-NUT-MIX", nombre: "Mix de Nueces", linea_producto: "Snacks", subcategoria_sabor: "Mix Original", cantidad: 16, fecha_caducidad: daysFromNow(10), proveedor: "Nature Valley" },
  { id: "22", id_tienda: "Norte", sku: "SNA-CHI-SAL", nombre: "Chips Proteicos", linea_producto: "Snacks", subcategoria_sabor: "Sal de Mar", cantidad: 28, fecha_caducidad: daysFromNow(-5), proveedor: "Quest" },
  { id: "23", id_tienda: "Norte", sku: "BEB-BCA-FRU", nombre: "BCAA Energy", linea_producto: "Bebidas", subcategoria_sabor: "Frutas Rojas", cantidad: 18, fecha_caducidad: daysFromNow(100), proveedor: "Evlution" },
  { id: "24", id_tienda: "Norte", sku: "BEB-AGU-NAT", nombre: "Agua Coco Natural", linea_producto: "Bebidas", subcategoria_sabor: "Natural", cantidad: 24, fecha_caducidad: daysFromNow(40), proveedor: "Vita Coco" },
  { id: "25", id_tienda: "Norte", sku: "ACC-SHK-AZU", nombre: "Shaker 600ml", linea_producto: "Accesorios", subcategoria_sabor: "Azul", cantidad: 11, fecha_caducidad: daysFromNow(800), proveedor: "BlenderBottle" },
  { id: "26", id_tienda: "Norte", sku: "ACC-CIN-NEG", nombre: "Cinturón Lumbar", linea_producto: "Accesorios", subcategoria_sabor: "Negro M", cantidad: 5, fecha_caducidad: daysFromNow(800), proveedor: "Harbinger" },
];
