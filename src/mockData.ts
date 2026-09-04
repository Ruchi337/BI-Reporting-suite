import { Product, Customer, ReviewItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'AeroPulse Pro Active Noise-Canceling Headphones',
    sku: 'AUDIO-AP-900',
    category: 'Electronics',
    price: 249.99,
    cost: 110.00,
    stock: 14,
    minThreshold: 30,
    leadTimeDays: 7,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Flagship wireless over-ear headphones featuring dual-chamber acoustic drivers, adaptive ANC 2.0, transparency mode, and 40-hour battery life with ultra-plush memory foam earcups.',
    tags: ['wireless', 'noise-canceling', 'bluetooth-5.3', 'audiophile', 'travel'],
    features: ['Hybrid Active Noise Canceling', '40-Hour Playtime with USB-C Quick Charge', 'Multipoint Bluetooth 5.3 Pairing', 'Hi-Res Audio LDAC Certified'],
    rating: 4.8,
    reviewCount: 142,
    salesLast30Days: 88,
    supplier: 'AeroAcoustics Global',
    vectorEmbedding: [0.82, 0.15, 0.67, 0.91, 0.44, 0.73, 0.88, 0.22]
  },
  {
    id: 'prod-002',
    name: 'ErgoDynamic Matrix Mesh Task Chair',
    sku: 'OFFICE-EDM-40',
    category: 'Office & Furniture',
    price: 429.00,
    cost: 195.00,
    stock: 8,
    minThreshold: 25,
    leadTimeDays: 14,
    image: 'https://images.unsplash.com/photo-1580481077198-c847ad4360a0?w=600&auto=format&fit=crop&q=80',
    description: 'Engineered ergonomic office chair featuring dynamic 3D lumbar matrix support, 4D adjustable armrests, breathable elastomeric mesh, and 135-degree synchronous tilt mechanism.',
    tags: ['ergonomic', 'office-chair', 'lumbar-support', 'breathable-mesh', 'work-from-home'],
    features: ['Self-Adjusting Dynamic Lumbar Support', 'Korean Elastomeric Breathable Mesh', 'Class-4 Heavy Duty Gas Cylinder', '10-Year Structural Frame Warranty'],
    rating: 4.6,
    reviewCount: 98,
    salesLast30Days: 52,
    supplier: 'Kinetic Works Ltd.',
    vectorEmbedding: [0.31, 0.89, 0.12, 0.45, 0.78, 0.35, 0.91, 0.64]
  },
  {
    id: 'prod-003',
    name: 'HydroFlow Smart Thermal Hydration Flask 32oz',
    sku: 'OUTDOOR-HF-32',
    category: 'Sports & Outdoors',
    price: 49.50,
    cost: 18.00,
    stock: 145,
    minThreshold: 50,
    leadTimeDays: 5,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    description: 'Double-wall vacuum insulated stainless steel water bottle with digital LED temperature cap, UV self-purification cycle, and leak-proof sports lid.',
    tags: ['smart-bottle', 'stainless-steel', 'hydration', 'fitness', 'insulated'],
    features: ['24-Hour Cold / 12-Hour Hot Insulation', 'OLED Touch Cap with Hydration Reminder', 'UV-C Built-in Water Sanitization', 'Food Grade 18/8 Stainless Steel'],
    rating: 4.4,
    reviewCount: 230,
    salesLast30Days: 210,
    supplier: 'HydroTech Supply',
    vectorEmbedding: [0.18, 0.22, 0.85, 0.33, 0.62, 0.81, 0.40, 0.75]
  },
  {
    id: 'prod-004',
    name: 'ChronoTitan Sapphire Automatic Diver Watch',
    sku: 'LUX-CT-500',
    category: 'Watches & Jewelry',
    price: 580.00,
    cost: 260.00,
    stock: 5,
    minThreshold: 15,
    leadTimeDays: 21,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Precision Japanese automatic timepiece crafted in grade-2 titanium with scratch-resistant AR-coated sapphire crystal, ceramic bezel, and 300m water resistance.',
    tags: ['luxury-watch', 'automatic', 'titanium', 'diver-watch', 'sapphire-crystal'],
    features: ['NH35 Automatic 24-Jewel Movement', 'Grade 2 Lightweight Titanium Case', 'Super-LumiNova BGW9 Dial Markings', 'Solid Link Bracelet with Quick Micro-adjust'],
    rating: 4.9,
    reviewCount: 64,
    salesLast30Days: 28,
    supplier: 'Chrono Horology Labs',
    vectorEmbedding: [0.95, 0.42, 0.31, 0.88, 0.15, 0.62, 0.70, 0.83]
  },
  {
    id: 'prod-005',
    name: 'Artisan Pour-Over Precision Gooseneck Kettle',
    sku: 'KITCH-GK-100',
    category: 'Home & Kitchen',
    price: 89.95,
    cost: 38.50,
    stock: 62,
    minThreshold: 35,
    leadTimeDays: 7,
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    description: 'Variable temperature electric kettle with precision fluted spout for laminar pour flow, LCD temperature holding mode, and matte volcanic black finish.',
    tags: ['specialty-coffee', 'electric-kettle', 'pour-over', 'barista', 'kitchen-gadget'],
    features: ['1-Degree F Exact Temperature Control', '60-Minute Keep Warm Mode', 'Built-in Brew Stopwatch Timer', '1200W Rapid Boil Heating Element'],
    rating: 4.7,
    reviewCount: 185,
    salesLast30Days: 95,
    supplier: 'CraftBrew Hardware',
    vectorEmbedding: [0.45, 0.30, 0.71, 0.52, 0.86, 0.40, 0.65, 0.90]
  },
  {
    id: 'prod-006',
    name: 'Nomad Ultralight Carbon Fiber Travel Tripod',
    sku: 'PHOTO-CF-70',
    category: 'Electronics',
    price: 199.00,
    cost: 85.00,
    stock: 22,
    minThreshold: 20,
    leadTimeDays: 10,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    description: 'Compact 8-layer carbon fiber tripod with Arca-Swiss dual panoramic ball head, integrated monopod conversion, and low-angle macro shooting capability.',
    tags: ['photography', 'tripod', 'carbon-fiber', 'travel-gear', 'dslr-accessories'],
    features: ['Weighs only 2.4 lbs with 22 lbs Payload Capacity', '8-Layer Toray Carbon Fiber Legs', '360° Panoramic Fluid Damped Ball Head', 'Folds down to 14.2 inches for carry-on'],
    rating: 4.5,
    reviewCount: 76,
    salesLast30Days: 44,
    supplier: 'Apex Optical Labs',
    vectorEmbedding: [0.77, 0.38, 0.55, 0.81, 0.60, 0.69, 0.82, 0.39]
  }
];

export const SAMPLE_HISTORICAL_SALES: Record<string, { date: string; actualSales: number; revenue: number; stockLevel: number }[]> = {
  'prod-001': [
    { date: '2025-08', actualSales: 45, revenue: 11249, stockLevel: 120 },
    { date: '2025-09', actualSales: 52, revenue: 12999, stockLevel: 98 },
    { date: '2025-10', actualSales: 58, revenue: 14499, stockLevel: 75 },
    { date: '2025-11', actualSales: 95, revenue: 23749, stockLevel: 50 }, // Holiday surge
    { date: '2025-12', actualSales: 120, revenue: 29998, stockLevel: 25 }, // Christmas surge
    { date: '2026-01', actualSales: 65, revenue: 16249, stockLevel: 90 },
    { date: '2026-02', actualSales: 60, revenue: 14999, stockLevel: 80 },
    { date: '2026-03', actualSales: 70, revenue: 17499, stockLevel: 65 },
    { date: '2026-04', actualSales: 75, revenue: 18749, stockLevel: 55 },
    { date: '2026-05', actualSales: 82, revenue: 20499, stockLevel: 45 },
    { date: '2026-06', actualSales: 80, revenue: 19999, stockLevel: 32 },
    { date: '2026-07', actualSales: 88, revenue: 21999, stockLevel: 14 }
  ],
  'prod-002': [
    { date: '2025-08', actualSales: 30, revenue: 12870, stockLevel: 85 },
    { date: '2025-09', actualSales: 42, revenue: 18018, stockLevel: 70 },
    { date: '2025-10', actualSales: 45, revenue: 19305, stockLevel: 60 },
    { date: '2025-11', actualSales: 60, revenue: 25740, stockLevel: 45 },
    { date: '2025-12', actualSales: 68, revenue: 29172, stockLevel: 30 },
    { date: '2026-01', actualSales: 55, revenue: 23595, stockLevel: 65 }, // New year home office surge
    { date: '2026-02', actualSales: 48, revenue: 20592, stockLevel: 50 },
    { date: '2026-03', actualSales: 50, revenue: 21450, stockLevel: 40 },
    { date: '2026-04', actualSales: 46, revenue: 19734, stockLevel: 30 },
    { date: '2026-05', actualSales: 51, revenue: 21879, stockLevel: 25 },
    { date: '2026-06', actualSales: 49, revenue: 21021, stockLevel: 18 },
    { date: '2026-07', actualSales: 52, revenue: 22308, stockLevel: 8 }
  ],
  'prod-003': [
    { date: '2025-08', actualSales: 180, revenue: 8910, stockLevel: 350 },
    { date: '2025-09', actualSales: 160, revenue: 7920, stockLevel: 300 },
    { date: '2025-10', actualSales: 140, revenue: 6930, stockLevel: 270 },
    { date: '2025-11', actualSales: 175, revenue: 8662, stockLevel: 220 },
    { date: '2025-12', actualSales: 240, revenue: 11880, stockLevel: 180 },
    { date: '2026-01', actualSales: 220, revenue: 10890, stockLevel: 250 },
    { date: '2026-02', actualSales: 185, revenue: 9157, stockLevel: 220 },
    { date: '2026-03', actualSales: 190, revenue: 9405, stockLevel: 200 },
    { date: '2026-04', actualSales: 205, revenue: 10147, stockLevel: 180 },
    { date: '2026-05', actualSales: 230, revenue: 11385, stockLevel: 160 },
    { date: '2026-06', actualSales: 250, revenue: 12375, stockLevel: 145 }, // Summer hydration spike
    { date: '2026-07', actualSales: 210, revenue: 10395, stockLevel: 145 }
  ]
};

export const SAMPLE_REVIEWS: Record<string, ReviewItem[]> = {
  'prod-001': [
    {
      id: 'rev-101',
      productId: 'prod-001',
      customerName: 'Marcus Vance',
      rating: 5,
      date: '2026-07-28',
      title: 'Spectacular soundstage & noise isolation on flights',
      comment: 'I take 4 cross-country flights a month. The active noise canceling shuts out engine hum instantly. The memory foam padding is super comfortable for 6+ hours without any ear fatigue. Battery actually lasted 38 hours before needing juice.',
      verifiedPurchase: true
    },
    {
      id: 'rev-102',
      productId: 'prod-001',
      customerName: 'Elena Rostova',
      rating: 5,
      date: '2026-07-15',
      title: 'Best LDAC audiophile Bluetooth cans under $300',
      comment: 'Crisp highs, punchy sub-bass without muddiness, and the mobile companion app has a genuine 10-band parametric EQ. Multipoint bluetooth connects to both my MacBook and iPhone seamlessly.',
      verifiedPurchase: true
    },
    {
      id: 'rev-103',
      productId: 'prod-001',
      customerName: 'David Chen',
      rating: 4,
      date: '2026-06-30',
      title: 'Amazing audio quality, slight bulk in gym bag',
      comment: 'Audio performance is 10/10. The hard shell case is a bit bulky if you are traveling light with just a backpack, but the build quality is durable metal and premium composite.',
      verifiedPurchase: true
    },
    {
      id: 'rev-104',
      productId: 'prod-001',
      customerName: 'Sarah Jenkins',
      rating: 2,
      date: '2026-06-12',
      title: 'Mic quality on zoom calls could be better in wind',
      comment: 'Great for music listening, but when I took a client call walking outside on a windy street, the caller complained of background wind whooshing noise. Firmware update helped a little but still needs mic noise suppression improvement.',
      verifiedPurchase: true
    }
  ],
  'prod-002': [
    {
      id: 'rev-201',
      productId: 'prod-002',
      customerName: 'Dr. Katherine Wu',
      rating: 5,
      date: '2026-07-20',
      title: 'Cured my chronic lower back strain in 2 weeks',
      comment: 'As a radiologist sitting 10 hours a day, the 3D lumbar support naturally moves with my spine. The mesh stays cool during warm afternoons. Worth every penny of the investment.',
      verifiedPurchase: true
    },
    {
      id: 'rev-202',
      productId: 'prod-002',
      customerName: 'Brandon Taylor',
      rating: 4,
      date: '2026-07-04',
      title: 'Top tier build, heavy package to carry upstairs',
      comment: 'Assembly took about 15 minutes with the included hex tool. The armrest adjustments are super fluid. The shipping box is 55 lbs though so grab a friend when delivering upstairs.',
      verifiedPurchase: true
    },
    {
      id: 'rev-203',
      productId: 'prod-002',
      customerName: 'Liam O\'Connor',
      rating: 3,
      date: '2026-05-18',
      title: 'Great back support, headrest feels stiff for taller people',
      comment: 'I am 6 foot 3 inches. The lumbar support aligns nicely, but the optional headrest hits my upper shoulder blades unless adjusted to its maximum highest notch.',
      verifiedPurchase: true
    }
  ]
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    name: 'Alexander Wright',
    email: 'a.wright@nexuscapital.io',
    totalSpent: 3450.00,
    orderCount: 9,
    lastOrderDate: '2026-08-10',
    daysSinceLastPurchase: 8,
    segment: 'VIP Champions',
    favoriteCategory: 'Electronics',
    avgOrderValue: 383.33
  },
  {
    id: 'cust-02',
    name: 'Sophia Patel',
    email: 'sophia.patel@designstudio.co',
    totalSpent: 2890.50,
    orderCount: 7,
    lastOrderDate: '2026-08-04',
    daysSinceLastPurchase: 14,
    segment: 'VIP Champions',
    favoriteCategory: 'Office & Furniture',
    avgOrderValue: 412.92
  },
  {
    id: 'cust-03',
    name: 'Harrison Reed',
    email: 'harrison.r@architects.net',
    totalSpent: 1650.00,
    orderCount: 5,
    lastOrderDate: '2026-07-20',
    daysSinceLastPurchase: 29,
    segment: 'Loyal Customers',
    favoriteCategory: 'Watches & Jewelry',
    avgOrderValue: 330.00
  },
  {
    id: 'cust-04',
    name: 'Maya Lin',
    email: 'maya.lin@biotech.org',
    totalSpent: 1220.00,
    orderCount: 4,
    lastOrderDate: '2026-07-12',
    daysSinceLastPurchase: 37,
    segment: 'Loyal Customers',
    favoriteCategory: 'Home & Kitchen',
    avgOrderValue: 305.00
  },
  {
    id: 'cust-05',
    name: 'Chloe Bennett',
    email: 'chloe.b@creativeagency.com',
    totalSpent: 780.00,
    orderCount: 3,
    lastOrderDate: '2026-08-14',
    daysSinceLastPurchase: 4,
    segment: 'Potential Loyalists',
    favoriteCategory: 'Electronics',
    avgOrderValue: 260.00
  },
  {
    id: 'cust-06',
    name: 'Derek Foster',
    email: 'dfoster@precisionlogistics.com',
    totalSpent: 620.00,
    orderCount: 2,
    lastOrderDate: '2026-08-01',
    daysSinceLastPurchase: 17,
    segment: 'Potential Loyalists',
    favoriteCategory: 'Sports & Outdoors',
    avgOrderValue: 310.00
  },
  {
    id: 'cust-07',
    name: 'Jonathan Miller',
    email: 'j.miller@fintech.co',
    totalSpent: 1420.00,
    orderCount: 4,
    lastOrderDate: '2026-04-10',
    daysSinceLastPurchase: 130,
    segment: 'At Risk / Lapsing',
    favoriteCategory: 'Office & Furniture',
    avgOrderValue: 355.00
  },
  {
    id: 'cust-08',
    name: 'Rachel Kim',
    email: 'rachel.kim@wanderlust.travel',
    totalSpent: 990.00,
    orderCount: 3,
    lastOrderDate: '2026-03-25',
    daysSinceLastPurchase: 146,
    segment: 'At Risk / Lapsing',
    favoriteCategory: 'Sports & Outdoors',
    avgOrderValue: 330.00
  },
  {
    id: 'cust-09',
    name: 'Tyler Ross',
    email: 'tyler.ross@startup.io',
    totalSpent: 249.99,
    orderCount: 1,
    lastOrderDate: '2026-08-16',
    daysSinceLastPurchase: 2,
    segment: 'New / Low Spend',
    favoriteCategory: 'Electronics',
    avgOrderValue: 249.99
  },
  {
    id: 'cust-10',
    name: 'Emma Watson-Lee',
    email: 'emma.wl@studio.design',
    totalSpent: 89.95,
    orderCount: 1,
    lastOrderDate: '2026-08-12',
    daysSinceLastPurchase: 6,
    segment: 'New / Low Spend',
    favoriteCategory: 'Home & Kitchen',
    avgOrderValue: 89.95
  }
];
