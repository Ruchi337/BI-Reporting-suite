import { 
  AdminSystemOverview, 
  ApiEndpointMetadata, 
  AdminSystemLog, 
  AdminOrder, 
  Vendor 
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from '../mockData';

export const DEFAULT_ADMIN_OVERVIEW: AdminSystemOverview = {
  serverStatus: 'healthy',
  uptimeSeconds: 7200,
  uptimeFormatted: '2h 00m 00s',
  nodeVersion: 'v22.17.0',
  platform: 'linux',
  memoryUsage: {
    heapUsedMb: 48.2,
    heapTotalMb: 85.0,
    rssMb: 118.6
  },
  gemini: {
    activeModel: 'gemini-3.7-flash',
    isConfigured: true,
    provider: 'Google Cloud GenAI',
    multimodalSupported: true
  },
  databaseStats: {
    totalProducts: INITIAL_PRODUCTS.length,
    totalCustomers: INITIAL_CUSTOMERS.length,
    totalOrders: 6,
    totalInventoryValuation: Math.round(INITIAL_PRODUCTS.reduce((acc, p) => acc + p.price * p.stock, 0) * 100) / 100,
    totalGMV: 4890.50,
    lowStockAlerts: INITIAL_PRODUCTS.filter(p => p.stock <= (p.minThreshold || 15)).length
  },
  apiPerformance: {
    avgLatencyMs: 14,
    totalRequests: 218,
    successRatePct: 99.8,
    activeEndpointsCount: 25
  }
};

export const DEFAULT_ADMIN_ENDPOINTS: ApiEndpointMetadata[] = [
  {
    id: 'ep-1',
    name: 'System Health Check',
    method: 'GET',
    path: '/api/health',
    category: 'Admin & System',
    description: 'Checks server runtime health and Gemini API key availability.',
    exampleResponse: { status: 'ok', hasGeminiKey: true, timestamp: '2026-08-27T11:47:00Z' }
  },
  {
    id: 'ep-2',
    name: 'Admin Overview & Metrics',
    method: 'GET',
    path: '/api/admin/overview',
    category: 'Admin & System',
    description: 'Fetches real-time server runtime status, memory consumption, Gemini status, and database entity statistics.',
    exampleResponse: { success: true, serverStatus: 'healthy', uptimeSeconds: 120 }
  },
  {
    id: 'ep-3',
    name: 'Fetch All Products (CRUD)',
    method: 'GET',
    path: '/api/products',
    category: 'Inventory & Catalog',
    description: 'Retrieves all catalog inventory items stored in backend memory with stock levels, costs, and pricing.',
    exampleResponse: { success: true, count: 5, data: [] }
  },
  {
    id: 'ep-4',
    name: 'Create Product (CRUD)',
    method: 'POST',
    path: '/api/products',
    category: 'Inventory & Catalog',
    description: 'Creates a new product record in backend storage with validation.',
    defaultPayload: {
      name: 'Aerolite Carbon Fiber Wireless Mouse',
      category: 'Electronics',
      price: 79.99,
      cost: 32.00,
      stock: 50,
      minThreshold: 15,
      leadTimeDays: 7,
      supplier: 'Aerolite Hardware Ltd'
    }
  },
  {
    id: 'ep-5',
    name: 'GenAI Product Copywriter',
    method: 'POST',
    path: '/api/ai/describe-product',
    category: 'AI & GenAI',
    description: 'Generates high-converting marketing descriptions, bullets, tags, and audience persona via Gemini 3.7 Flash.',
    defaultPayload: {
      name: 'Quantum Lumbar Ergonomic Pillow',
      category: 'Office & Furniture',
      keyPoints: 'High-density memory foam, cooling gel infused, adjustable strap',
      tone: 'compelling'
    }
  },
  {
    id: 'ep-6',
    name: 'Vision AI Categorizer & Tagger',
    method: 'POST',
    path: '/api/ai/vision-categorize',
    category: 'AI & GenAI',
    description: 'Multimodal vision model parses product photo Base64 or URL to detect category, materials, attributes, and tags.',
    defaultPayload: {
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
    }
  },
  {
    id: 'ep-7',
    name: 'LLM Customer Review Sentiment',
    method: 'POST',
    path: '/api/ai/sentiment-analysis',
    category: 'AI & GenAI',
    description: 'Analyzes customer review corpora for pros, cons, sentiment scores, and vendor improvements.',
    defaultPayload: {
      productName: 'AeroPulse Pro Headphones',
      reviews: [
        { rating: 5, title: 'Outstanding sound', comment: 'Battery lasts for 40+ hours and noise cancelling is elite.' },
        { rating: 4, title: 'Comfortable', comment: 'Great ear cups, though the case is slightly bulky for small bags.' }
      ]
    }
  },
  {
    id: 'ep-8',
    name: 'Supply Chain Forecast Insights',
    method: 'POST',
    path: '/api/ai/forecast-insights',
    category: 'AI & GenAI',
    description: 'Evaluates seasonal velocity, supplier lead times, and current stock to generate strategic replenishment orders.',
    defaultPayload: {
      productName: 'ErgoDynamic Matrix Mesh Task Chair',
      currentStock: 8,
      minThreshold: 25,
      leadTimeDays: 14,
      historicalSales: [45, 52, 60, 58, 64, 70],
      forecastedSales: [75, 82, 90]
    }
  },
  {
    id: 'ep-9',
    name: 'Text-to-SQL AI Data Analyst',
    method: 'POST',
    path: '/api/ai/text-to-sql',
    category: 'Analytics & BI',
    description: 'Translates natural language questions into ANSI SQL queries with explanations and structured result tables.',
    defaultPayload: {
      question: 'Which product categories generated the highest profit margins over the last 30 days?'
    }
  },
  {
    id: 'ep-10',
    name: 'Semantic Vector Search (2D/ND)',
    method: 'POST',
    path: '/api/ai/vector-search',
    category: 'AI & GenAI',
    description: 'Performs cosine similarity search against vectorized product catalogue embeddings.',
    defaultPayload: {
      query: 'Ergonomic comfortable seating for long working hours',
      limit: 3
    }
  },
  {
    id: 'ep-11',
    name: 'BI Summary Metrics',
    method: 'GET',
    path: '/api/analytics/summary',
    category: 'Analytics & BI',
    description: 'Calculates high-level enterprise metrics: Total Revenue, Orders, AOV, Gross Margin, and Stock Value.'
  },
  {
    id: 'ep-12',
    name: 'Real-Time Sales Feed Stream',
    method: 'GET',
    path: '/api/realtime/sales-feed',
    category: 'Real-Time',
    description: 'Returns continuous telemetry of incoming customer checkout events across global channels.'
  }
];

export const DEFAULT_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-548291',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@vancetech.io',
    productId: 'prod-001',
    productName: 'AeroPulse Pro Active Noise-Canceling Headphones',
    category: 'Electronics',
    amount: 249.99,
    units: 1,
    channel: 'Direct Web',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-841920',
    customerName: 'Sophia Lin',
    customerEmail: 'sophia.lin@designworks.co',
    productId: 'prod-002',
    productName: 'ErgoDynamic Matrix Mesh Task Chair',
    category: 'Office & Furniture',
    amount: 858.00,
    units: 2,
    channel: 'Enterprise POS',
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    paymentMethod: 'Invoice'
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-129482',
    customerName: 'David Chen',
    customerEmail: 'd.chen@apexmedia.net',
    productId: 'prod-003',
    productName: 'HydroFlow Smart Thermal Hydration Flask 32oz',
    category: 'Sports & Outdoors',
    amount: 99.00,
    units: 2,
    channel: 'Marketplace App',
    status: 'SHIPPED',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    paymentMethod: 'Apple Pay'
  },
  {
    id: 'ord-1004',
    orderNumber: 'ORD-984213',
    customerName: 'Julian Sterling',
    customerEmail: 'j.sterling@sterlingops.com',
    productId: 'prod-004',
    productName: 'ApexCraft Damascus Steel 8-Inch Chef Knife',
    category: 'Home & Kitchen',
    amount: 139.00,
    units: 1,
    channel: 'Affiliate Partner',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    paymentMethod: 'Stripe'
  }
];

export const DEFAULT_ADMIN_LOGS: AdminSystemLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'success',
    method: 'GET',
    endpoint: '/api/admin/overview',
    statusCode: 200,
    latencyMs: 14,
    message: 'System telemetry heartbeat checked and synchronized'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'info',
    method: 'GET',
    endpoint: '/api/products',
    statusCode: 200,
    latencyMs: 18,
    message: 'Catalog database query returned full active inventory'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'success',
    method: 'POST',
    endpoint: '/api/ai/forecast-insights',
    statusCode: 200,
    latencyMs: 24,
    message: 'Demand prediction engine generated replenishment strategy'
  }
];

export const DEFAULT_ADMIN_VENDORS: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'Alexander Thorne',
    email: 'alex.thorne@aeroacoustics.com',
    phone: '+1 (555) 234-8901',
    businessName: 'AeroAcoustics Global',
    companyName: 'AeroAcoustics Global LLC',
    address: '742 Audio Boulevard, Suite 300, San Francisco, CA 94107',
    role: 'vendor',
    status: 'active',
    bio: 'Pioneering audiophile sound equipment and acoustic noise-canceling hardware for audio engineers and travel enthusiasts.',
    rating: 4.9,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
  },
  {
    id: 'vendor-002',
    name: 'Elena Rostova',
    email: 'elena.r@kineticworks.com',
    phone: '+1 (555) 876-5432',
    businessName: 'Kinetic Works Ltd.',
    companyName: 'Kinetic Ergonomics International',
    address: '1288 Industrial Way, Building B, Austin, TX 78701',
    role: 'vendor',
    status: 'active',
    bio: 'Precision posture engineering and dynamic mesh seating systems for modern corporate workspaces.',
    rating: 4.8,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];
