export type Product = { id: string; name: string; category: string; price: number; image: string; description: string; stock: number; featured?: boolean }

export const products: Product[] = [
  { id: 'sillon-alma', name: 'Sillón Alma', category: 'Muebles', price: 589000, image: '/images/products/sillon.png', description: 'Sillón envolvente tapizado en bouclé, diseñado para sumar calma y textura a tus espacios.', stock: 4, featured: true },
  { id: 'lampara-aurora', name: 'Lámpara Aurora', category: 'Iluminación', price: 148500, image: '/images/products/lampara.png', description: 'Luz cálida, base de latón y pantalla de lino natural para crear una atmósfera serena.', stock: 7, featured: true },
  { id: 'mesa-ibera', name: 'Mesa Iberá', category: 'Muebles', price: 764000, image: '/images/products/mesa.png', description: 'Mesa circular de madera maciza terminada a mano. Un punto de encuentro para todos los días.', stock: 2, featured: true },
  { id: 'textiles-calma', name: 'Set Textiles Calma', category: 'Textiles', price: 89500, image: '/images/products/textil.png', description: 'Combinación de mantas y fundas en lino lavado, seleccionadas para vestir tu hogar.', stock: 12 },
]

export const formatARS = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
export const installments = (price: number, count = 12) => Math.round((price * 1.18) / count)
