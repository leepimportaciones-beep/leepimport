export const demoCategorias = [
  { id_categoria: 1, nombre: 'Goma Eva', descripcion: 'Planchas de goma eva para manualidades', activo: true },
  { id_categoria: 2, nombre: 'Papelería', descripcion: 'Cartulinas, afiches y papeles', activo: true },
  { id_categoria: 3, nombre: 'Librería Escolar', descripcion: 'Útiles escolares', activo: true },
  { id_categoria: 4, nombre: 'Manualidades', descripcion: 'Materiales creativos', activo: true }
]
export const demoSubcategorias = [
  { id_subcategoria: 1, id_categoria: 1, nombre: 'Lisa', activo: true },
  { id_subcategoria: 2, id_categoria: 1, nombre: 'Glitter', activo: true },
  { id_subcategoria: 3, id_categoria: 1, nombre: 'Toalla', activo: true },
  { id_subcategoria: 4, id_categoria: 2, nombre: 'Cartulinas', activo: true },
  { id_subcategoria: 5, id_categoria: 2, nombre: 'Afiches', activo: true },
  { id_subcategoria: 6, id_categoria: 3, nombre: 'Escritura', activo: true },
  { id_subcategoria: 7, id_categoria: 3, nombre: 'Pegamentos', activo: true },
  { id_subcategoria: 8, id_categoria: 4, nombre: 'Pintura', activo: true }
]
export const demoColores = [
  { id_color: 1, nombre: 'Blanco', codigo_hex: '#ffffff' },
  { id_color: 2, nombre: 'Negro', codigo_hex: '#111111' },
  { id_color: 3, nombre: 'Rojo', codigo_hex: '#ef4444' },
  { id_color: 4, nombre: 'Azul', codigo_hex: '#2563eb' },
  { id_color: 5, nombre: 'Verde', codigo_hex: '#22c55e' },
  { id_color: 6, nombre: 'Dorado', codigo_hex: '#d4af37' },
  { id_color: 7, nombre: 'Plateado', codigo_hex: '#c0c0c0' },
  { id_color: 8, nombre: 'Rosa', codigo_hex: '#fb7185' },
  { id_color: 9, nombre: 'Violeta', codigo_hex: '#8b5cf6' }
]
export const demoProductos = [
  { id_producto: 1, id_categoria: 1, id_subcategoria: 1, nombre: 'Goma Eva Lisa A4', descripcion: 'Plancha de goma eva lisa tamaño A4.', detalle_manual: 'Se vende por unidad o caja x10 del mismo color.', foto_url: 'https://placehold.co/700x500/fff1f2/e11d48?text=Goma+Eva+Lisa+A4', usa_colores: true, precio_base: 450, producto_destacado: true, activo: true },
  { id_producto: 2, id_categoria: 1, id_subcategoria: 2, nombre: 'Goma Eva Glitter 40x60', descripcion: 'Plancha grande con brillo premium.', detalle_manual: 'Ideal para carteles, souvenirs y decoración.', foto_url: 'https://placehold.co/700x500/f5f3ff/7c3aed?text=Goma+Eva+Glitter', usa_colores: true, precio_base: 1700, producto_destacado: true, activo: true },
  { id_producto: 3, id_categoria: 1, id_subcategoria: 3, nombre: 'Goma Eva Toalla', descripcion: 'Textura toalla para trabajos creativos.', detalle_manual: 'Venta por unidad. Consultar disponibilidad.', foto_url: 'https://placehold.co/700x500/ecfeff/0891b2?text=Goma+Eva+Toalla', usa_colores: true, precio_base: 1850, producto_destacado: false, activo: true },
  { id_producto: 4, id_categoria: 2, id_subcategoria: 4, nombre: 'Cartulina Escolar', descripcion: 'Cartulina tradicional para trabajos escolares.', detalle_manual: 'Venta por unidad y pack.', foto_url: 'https://placehold.co/700x500/fef3c7/d97706?text=Cartulina', usa_colores: true, precio_base: 350, producto_destacado: true, activo: true },
  { id_producto: 5, id_categoria: 2, id_subcategoria: 5, nombre: 'Afiche Color', descripcion: 'Afiche grande para cartelería.', detalle_manual: 'Venta por unidad.', foto_url: 'https://placehold.co/700x500/dbeafe/1d4ed8?text=Afiche', usa_colores: true, precio_base: 400, producto_destacado: false, activo: true },
  { id_producto: 6, id_categoria: 3, id_subcategoria: 6, nombre: 'Lapicera Azul Pack x10', descripcion: 'Pack cerrado de lapiceras.', detalle_manual: 'Producto sin selección de color.', foto_url: 'https://placehold.co/700x500/e0f2fe/0369a1?text=Lapiceras', usa_colores: false, precio_base: 2500, producto_destacado: true, activo: true },
  { id_producto: 7, id_categoria: 3, id_subcategoria: 7, nombre: 'Plasticola Escolar 250g', descripcion: 'Adhesivo escolar blanco.', detalle_manual: 'Venta por unidad.', foto_url: 'https://placehold.co/700x500/f8fafc/334155?text=Plasticola', usa_colores: false, precio_base: 1800, producto_destacado: false, activo: true },
  { id_producto: 8, id_categoria: 4, id_subcategoria: 8, nombre: 'Témpera Escolar 250ml', descripcion: 'Témpera para arte escolar.', detalle_manual: 'Disponible por color.', foto_url: 'https://placehold.co/700x500/f0fdf4/16a34a?text=Tempera', usa_colores: true, precio_base: 1900, producto_destacado: true, activo: true }
]
export const demoProductoColores = [
  ...[1,2,3,4,5,8,9].map(id_color => ({ id_producto: 1, id_color, precio_base_color: 450, stock_referencial: 20 })),
  ...[3,4,5,6,7,8,9].map(id_color => ({ id_producto: 2, id_color, precio_base_color: 1700, stock_referencial: 18 })),
  ...[1,2,3,4,5].map(id_color => ({ id_producto: 3, id_color, precio_base_color: 1850, stock_referencial: 10 })),
  ...[1,2,3,4,5,8,9].map(id_color => ({ id_producto: 4, id_color, precio_base_color: 350, stock_referencial: 24 })),
  ...[3,4,5,8,9].map(id_color => ({ id_producto: 5, id_color, precio_base_color: 400, stock_referencial: 16 })),
  ...[3,4,5,8,9].map(id_color => ({ id_producto: 8, id_color, precio_base_color: 1900, stock_referencial: 22 }))
]
export const demoProductoCaracteristicas = [
  { id_caracteristica: 1, id_producto: 1, nombre: 'Grosor', valor: '2 mm', orden_visual: 1, activo: true },
  { id_caracteristica: 2, id_producto: 2, nombre: 'Brillo', valor: 'Alto', orden_visual: 1, activo: true },
  { id_caracteristica: 3, id_producto: 4, nombre: 'Tamaño', valor: '70x100 cm', orden_visual: 1, activo: true },
  { id_caracteristica: 4, id_producto: 6, nombre: 'Pack', valor: '10 unidades', orden_visual: 1, activo: true }
]
export const demoDetallePedidos = [
  { id_detalle_pedido: 1, id_pedido: 1, id_producto: 2, id_color: 3, nombre_categoria: 'Goma Eva', nombre_subcategoria: 'Glitter', nombre_producto: 'Goma Eva Glitter 40x60', nombre_color: 'Rojo', cantidad: 4, detalle_producto: 'Propuesta de cartel', precio_base_original: 1700, precio_unitario_presupuestado: 1700, subtotal_bruto: 6800, subtotal_final: 6800, activo: true, fecha_alta: new Date().toISOString() },
  { id_detalle_pedido: 2, id_pedido: 2, id_producto: 8, id_color: 4, nombre_categoria: 'Manualidades', nombre_subcategoria: 'Pintura', nombre_producto: 'Témpera Escolar 250ml', nombre_color: 'Azul', cantidad: 10, detalle_producto: 'Pack escolar', precio_base_original: 1900, precio_unitario_presupuestado: 1900, subtotal_bruto: 19000, subtotal_final: 19000, activo: true, fecha_alta: new Date().toISOString() },
  { id_detalle_pedido: 3, id_pedido: 3, id_producto: 6, id_color: null, nombre_categoria: 'Librería Escolar', nombre_subcategoria: 'Escritura', nombre_producto: 'Lapicera Azul Pack x10', nombre_color: null, cantidad: 2, detalle_producto: 'Pack promoción', precio_base_original: 2500, precio_unitario_presupuestado: 2500, subtotal_bruto: 5000, subtotal_final: 5000, activo: true, fecha_alta: new Date().toISOString() }
]
export const demoPedidos = [
  { id_pedido: 1, codigo_pedido: 'PED-000001', nombre_cliente: 'María González', telefono_cliente: '3815551111', email_cliente: 'maria@genericas.com', direccion_cliente: 'Av. Rivadavia 123', provincia_cliente: 'Tucumán', localidad_cliente: 'San Miguel de Tucumán', estado: 'PENDIENTE_PRESUPUESTAR', total_final: 0, fecha_alta: new Date().toISOString() },
  { id_pedido: 2, codigo_pedido: 'PED-000002', nombre_cliente: 'Carlos Medina', telefono_cliente: '3815552222', email_cliente: 'carlos@negocio.com', direccion_cliente: 'Calle 9 de Julio 456', provincia_cliente: 'Tucumán', localidad_cliente: 'Yerba Buena', estado: 'PRESUPUESTADO', total_final: 23000, fecha_alta: new Date().toISOString() },
  { id_pedido: 3, codigo_pedido: 'PED-000003', nombre_cliente: 'Laura Fernández', telefono_cliente: '3815553333', email_cliente: 'laura@fiestas.com', direccion_cliente: 'Boulevard Roca 789', provincia_cliente: 'Tucumán', localidad_cliente: 'Tafí Viejo', estado: 'VENTA_CONCRETADA', total_final: 16000, fecha_alta: new Date().toISOString() }
]
