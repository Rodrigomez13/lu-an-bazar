export type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  price?: number;
  previousPrice?: number;
  image: string;
  description: string;
  stock?: number;
  featured?: boolean;
  offer?: boolean;
  isNew?: boolean;
  color: string;
  material: string;
  dimensions: string;
  features: string[];
  keywords: string[];
};

export const categories = [
  "Cocina y bebidas",
  "Electrodomésticos",
  "Cuidado personal",
  "Salud y bienestar",
  "Tecnología",
  "Hogar",
];

export const products: Product[] = [
  {
    id: "balanza-digital-40kg",
    code: "NEG-040",
    name: "Balanza digital comercial 40 kg",
    category: "Hogar",
    brand: "Hengda",
    price: 30500,
    image: "/images/products/balanza-digital-40kg.png",
    description:
      "Balanza electrónica con cálculo de precio, pantalla triple y capacidad de hasta 40 kg.",
    featured: true,
    isNew: true,
    color: "Blanco y azul",
    material: "Acero inoxidable y plástico",
    dimensions: "Bandeja de 33,3 × 47,3 cm",
    features: [
      "Capacidad máxima de 40 kg",
      "División de 2 g",
      "Cálculo de peso y precio",
    ],
    keywords: ["balanza", "comercio", "peso", "digital"],
  },
  {
    id: "clipper-waer-pro",
    code: "CUI-160",
    name: "Máquina de cortar pelo Waer Pro",
    category: "Cuidado personal",
    brand: "Waer",
    image: "/images/products/clipper-waer-pro.png",
    description:
      "Cortadora profesional recargable con pantalla digital y peines para distintas alturas.",
    featured: true,
    color: "Dorado",
    material: "Metal y plástico",
    dimensions: "Kit con 8 peines guía",
    features: [
      "Cuchilla de titanio cerámico",
      "Pantalla digital",
      "Diseño recargable USB",
    ],
    keywords: ["clipper", "cortadora", "barbería", "cabello"],
  },
  {
    id: "foco-camara-wifi",
    code: "TEC-165",
    name: "Foco cámara Wi-Fi",
    category: "Tecnología",
    brand: "Smart Camera",
    price: 16500,
    image: "/images/products/foco-cámara.png",
    description:
      "Cámara de seguridad Wi-Fi con formato de foco para supervisar ambientes desde el celular.",
    featured: true,
    isNew: true,
    color: "Blanco",
    material: "Plástico",
    dimensions: "Rosca tipo foco",
    features: [
      "Conexión Wi-Fi",
      "Visualización desde el celular",
      "Formato de instalación simple",
    ],
    keywords: ["cámara", "seguridad", "wifi", "foco"],
  },
  {
    id: "medidor-glucosa-kit",
    code: "SAL-175",
    name: "Kit medidor de glucosa",
    category: "Salud y bienestar",
    brand: "Ecopower",
    price: 17500,
    image: "/images/products/medidor-glucosa.png",
    description:
      "Kit doméstico para medición de glucosa con medidor, lanceta y 50 tiras reactivas.",
    isNew: true,
    color: "Blanco",
    material: "Plástico",
    dimensions: "Kit compacto",
    features: [
      "Incluye 50 tiras",
      "Lanceta incluida",
      "Expulsión automática de tiras",
    ],
    keywords: ["glucosa", "salud", "medidor", "tiras"],
  },
  {
    id: "mixer-raf-5-en-1",
    code: "ELE-280",
    name: "Mixer RAF 5 en 1",
    category: "Electrodomésticos",
    brand: "RAF",
    price: 28000,
    image: "/images/products/mixer-5en1.png",
    description:
      "Mixer multifunción con accesorios para mezclar, batir, triturar y procesar alimentos.",
    featured: true,
    isNew: true,
    color: "Negro",
    material: "Acero y plástico",
    dimensions: "Set de 5 piezas",
    features: ["Set 5 en 1", "Vaso medidor", "Batidor y procesador incluidos"],
    keywords: ["mixer", "licuadora", "batidor", "cocina"],
  },
  {
    id: "pava-electrica-raf-1500w",
    code: "ELE-150",
    name: "Pava eléctrica RAF 1500 W",
    category: "Electrodomésticos",
    brand: "RAF",
    price: 14500,
    image: "/images/products/pava-eléctrica-1500W.png",
    description:
      "Pava eléctrica de 2 litros con base giratoria, indicador luminoso y apagado automático.",
    color: "Colores surtidos",
    material: "Acero inoxidable y plástico",
    dimensions: "Capacidad 2 L",
    features: [
      "Potencia de 1500 W",
      "Base giratoria 360°",
      "Apagado automático",
    ],
    keywords: ["pava", "hervidor", "agua", "mate"],
  },
  {
    id: "pava-electrica-raf-2000w",
    code: "ELE-200",
    name: "Pava eléctrica RAF 2000 W",
    category: "Electrodomésticos",
    brand: "RAF",
    price: 14500,
    image: "/images/products/pava-eléctrica-2000W.png",
    description:
      "Hervidor eléctrico de 2 litros, libre de BPA y disponible en diferentes colores.",
    color: "Colores surtidos",
    material: "Plástico libre de BPA",
    dimensions: "Capacidad 2 L",
    features: [
      "Potencia de 2000 W",
      "Apagado automático",
      "Indicador luminoso LED",
    ],
    keywords: ["pava", "hervidor", "eléctrica", "cocina"],
  },
  {
    id: "plancha-vapor-raf-1400w",
    code: "ELE-140",
    name: "Plancha a vapor RAF 1400 W",
    category: "Electrodomésticos",
    brand: "RAF",
    image: "/images/products/plancha-vapor-1400W.png",
    description:
      "Plancha eléctrica con vapor continuo, rociador y control de temperatura.",
    isNew: true,
    color: "Colores surtidos",
    material: "Plástico y base cerámica",
    dimensions: "Tamaño estándar",
    features: [
      "Potencia de 1400 W",
      "Vapor continuo",
      "Control de temperatura",
    ],
    keywords: ["plancha", "vapor", "ropa", "hogar"],
  },
  {
    id: "planchita-cabello-raf",
    code: "CUI-426",
    name: "Planchita de cabello RAF 2 en 1",
    category: "Cuidado personal",
    brand: "RAF",
    price: 9500,
    image: "/images/products/planchita-cabello.png",
    description:
      "Alisador y rizador 2 en 1 con placas de aluminio y revestimiento cerámico.",
    color: "Gris y naranja",
    material: "Plástico y cerámica",
    dimensions: "Placas de 25 × 95 mm",
    features: ["Función 2 en 1", "Cable giratorio 360°", "Traba de seguridad"],
    keywords: ["planchita", "alisador", "cabello", "rulos"],
  },
  {
    id: "secador-cabello-luo-5en1",
    code: "CUI-4818",
    name: "Secador de cabello LUO 5 en 1",
    category: "Cuidado personal",
    brand: "LUO",
    image: "/images/products/secador-cabello.png",
    description:
      "Secador profesional de alta potencia con cinco accesorios para distintos estilos.",
    featured: true,
    color: "Negro",
    material: "Plástico",
    dimensions: "Kit con 5 accesorios",
    features: [
      "Potencia anunciada de 4000 W",
      "Aire frío y caliente",
      "Incluye difusor y concentradores",
    ],
    keywords: ["secador", "cabello", "peluquería", "difusor"],
  },
  {
    id: "set-jarra-vasos-frutilla",
    code: "COC-104",
    name: "Set de jarra y vasos Frutilla",
    category: "Cocina y bebidas",
    brand: "Genérica",
    image: "/images/products/set-vasos-jarra.png",
    description:
      "Juego de vidrio con una jarra y cuatro vasos decorados con diseño de frutillas.",
    isNew: true,
    color: "Transparente y rojo",
    material: "Vidrio",
    dimensions: "Jarra + 4 vasos",
    features: [
      "Set de 5 piezas",
      "Diseño estampado",
      "Ideal para bebidas frías",
    ],
    keywords: ["jarra", "vasos", "vidrio", "frutilla"],
  },
  {
    id: "tensiometro-digital-ecopower",
    code: "SAL-2740",
    name: "Tensiómetro digital Ecopower",
    category: "Salud y bienestar",
    brand: "Ecopower",
    price: 17500,
    image: "/images/products/tensiómetro-digital.png",
    description:
      "Tensiómetro electrónico de brazo con pantalla digital y memoria de mediciones.",
    color: "Blanco",
    material: "Plástico y brazalete textil",
    dimensions: "Equipo de brazo",
    features: ["Pantalla digital", "Memoria de mediciones", "Alimentación USB"],
    keywords: ["tensiómetro", "presión", "salud", "digital"],
  },
  {
    id: "termo-luo-650ml",
    code: "COC-650",
    name: "Termo LUO 650 ml",
    category: "Cocina y bebidas",
    brand: "LUO",
    price: 11500,
    image: "/images/products/termolar-chico.png",
    description:
      "Termo compacto con manija rebatible, pico cebador y variedad de colores.",
    isNew: true,
    color: "Colores surtidos",
    material: "Acero inoxidable y plástico",
    dimensions: "Capacidad 650 ml",
    features: ["Pico cebador", "Manija rebatible", "Base de acero inoxidable"],
    keywords: ["termo", "mate", "bebidas", "650ml"],
  },
  {
    id: "termo-grande-frio-caliente",
    code: "COC-1900",
    name: "Termo grande frío/caliente",
    category: "Cocina y bebidas",
    brand: "Marca a confirmar",
    price: 27900,
    image: "/images/products/termolar-grande-frio-caliente.png",
    description:
      "Termo de gran capacidad con manija, pico vertedor y vaso térmico incluido.",
    featured: true,
    color: "Rosa o rojo",
    material: "Acero inoxidable y plástico",
    dimensions: "Gran capacidad",
    features: [
      "Conserva frío y calor",
      "Incluye vaso",
      "Manija para transporte",
    ],
    keywords: ["termo", "grande", "frío", "caliente"],
  },
];

export const formatARS = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

export const bazarStats = [
  {
    label: "Productos publicados",
    value: products.length,
    note: "Catálogo actual",
  },
  {
    label: "Categorías activas",
    value: categories.length,
    note: "Organizadas por rubro",
  },
  {
    label: "Precios cargados",
    value: products.filter((product) => product.price).length,
    note: "El resto se consulta",
  },
  {
    label: "Productos destacados",
    value: products.filter((product) => product.featured).length,
    note: "Visibles en Inicio",
  },
];
export const loanStats = [
  {
    label: "Cartera activa",
    value: 6840000,
    note: "32 préstamos · datos demo",
  },
  {
    label: "Cobros del mes",
    value: 1260000,
    note: "91% de cumplimiento · demo",
  },
  { label: "Cuotas vencidas", value: 8, note: "3 requieren contacto · demo" },
  { label: "Clientes privados", value: 47, note: "Datos de demostración" },
];
export const loanClients = [
  {
    id: "PR-DEMO-01",
    name: "Cliente de ejemplo",
    dni: "••.•••.482",
    balance: 420000,
    status: "Al día",
  },
  {
    id: "PR-DEMO-02",
    name: "Cliente de ejemplo",
    dni: "••.•••.127",
    balance: 285000,
    status: "Pendiente",
  },
  {
    id: "PR-DEMO-03",
    name: "Cliente de ejemplo",
    dni: "••.•••.903",
    balance: 610000,
    status: "En mora",
  },
];
export const salesData = [
  { month: "Feb", total: 18 },
  { month: "Mar", total: 24 },
  { month: "Abr", total: 21 },
  { month: "May", total: 29 },
  { month: "Jun", total: 34 },
  { month: "Jul", total: 38 },
];
