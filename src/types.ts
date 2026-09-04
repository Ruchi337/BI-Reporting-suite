export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  companyName?: string;
  address: string;
  role: 'vendor' | 'admin';
  passwordHash?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'pending' | 'suspended';
  bio?: string;
  rating?: number;
  totalProductsCount?: number;
  totalRevenue?: number;
}

export interface VendorAnalytics {
  vendorId: string;
  vendorName: string;
  businessName: string;
  totalProducts: number;
  totalSalesUnits: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalInventoryUnits: number;
  totalInventoryValuation: number;
  lowStockCount: number;
  topProducts: {
    id: string;
    name: string;
    sku: string;
    price: number;
    unitsSold: number;
    revenue: number;
    stock: number;
  }[];
  recentTransactions: Transaction[];
  salesByChannel: {
    channel: string;
    units: number;
    revenue: number;
  }[];
}

export interface Transaction {
  id: string;
  orderNumber: string;
  vendorId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  totalAmount: number;
  transactionDate: string;
  status: 'COMPLETED' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  channel: 'Direct Web' | 'Marketplace App' | 'Affiliate Partner' | 'Enterprise POS';
  paymentMethod: 'Credit Card' | 'Stripe' | 'Apple Pay' | 'Invoice';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor';
  businessName?: string;
  vendorId?: string;
}

export interface Product {
  id: string;
  vendorId?: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minThreshold: number;
  leadTimeDays: number;
  image: string;
  description: string;
  tags: string[];
  features: string[];
  rating: number;
  reviewCount: number;
  salesLast30Days: number;
  vectorEmbedding?: number[];
  supplier: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minThreshold: number;
  daysOfInventoryLeft: number;
  severity: 'critical' | 'warning' | 'optimal' | 'overstock';
  suggestedReorderQuantity: number;
  projectedStockoutDate: string;
}

export interface HistoricalSalesPoint {
  date: string;
  actualSales: number;
  predictedSales?: number;
  revenue: number;
  stockLevel: number;
}

export interface ForecastResult {
  productId: string;
  productName: string;
  historicalData: HistoricalSalesPoint[];
  forecastPoints: {
    date: string;
    predictedSales: number;
    lowerBound: number;
    upperBound: number;
  }[];
  modelMetrics: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    accuracyScore: number;
    method: 'ARIMA (Auto-Regressive)' | 'Holt-Winters (Trend + Seasonality)' | 'Prophet-Style Additive';
  };
  aiAnalysis?: {
    summary: string;
    seasonalFactors: string[];
    reorderRecommendation: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
    recommendedSafetyStock: number;
  };
}

export interface ReviewItem {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface SentimentAnalysisResult {
  productId: string;
  productName: string;
  overallScore: number; // 0 - 100
  sentimentLabel: 'Very Positive' | 'Positive' | 'Mixed/Neutral' | 'Negative';
  breakdown: {
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
  };
  topPros: string[];
  topCons: string[];
  keyThemes: { theme: string; sentiment: 'positive' | 'negative' | 'neutral'; mentions: number }[];
  vendorExecutiveSummary: string;
  actionableImprovements: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  daysSinceLastPurchase: number;
  segment: 'VIP Champions' | 'Loyal Customers' | 'Potential Loyalists' | 'At Risk / Lapsing' | 'New / Low Spend';
  favoriteCategory: string;
  avgOrderValue: number;
}

export interface CustomerSegmentSummary {
  segment: string;
  count: number;
  percentage: number;
  totalRevenue: number;
  avgLTV: number;
  description: string;
  recommendedCampaign: string;
}

export interface RecommendationItem {
  product: Product;
  score: number;
  reason: string;
  method: 'rule-based' | 'vector-semantic';
  matchAttributes?: string[];
}

export interface SqlQueryResult {
  query: string;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface AnalyticsSummary {
  totalSalesUnits: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  blendedMarginPct: number;
  totalInventoryValuation: number;
  conversionRate: number;
  repeatCustomerRate: number;
  inventoryTurnoverRate: number;
  topCategory: string;
}

export interface AnalyticsTimeSeriesPoint {
  period: string;
  date?: string;
  salesUnits: number;
  revenue: number;
  profit: number;
  orders: number;
  benchmarkRevenue?: number;
  aov?: number;
}

export interface CategoryAnalyticsItem {
  category: string;
  gmv: number;
  units: number;
  orderCount: number;
  marginPct: number;
  turnoverDays: number;
  skuCount: number;
}

export interface ProductAnalyticsItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minThreshold: number;
  salesUnits30d: number;
  revenue30d: number;
  marginPct: number;
  stockVelocity: number;
  daysOfInventoryLeft: number;
  status: 'Top Performer' | 'Optimal' | 'Low Stock' | 'Critical' | 'Overstock' | 'Slow Mover';
}

export interface CustomerSegmentAnalyticsItem {
  segment: string;
  customerCount: number;
  percentage: number;
  totalSpend: number;
  avgOrderValue: number;
  avgOrdersPerCustomer: number;
  retentionRate: number;
}

export interface BenchmarkMetric {
  id: string;
  name: string;
  category: string;
  vendorValue: number;
  marketplaceAverage: number;
  unit: string;
  format: 'currency' | 'percentage' | 'rating' | 'days' | 'number';
  status: 'superior' | 'average' | 'lagging';
  diffPercentage: number;
  insight: string;
  recommendation: string;
}


export interface TextToSqlResponse {
  question: string;
  generatedSql: string;
  explanation: string;
  keyInsights: string[];
  suggestedAction: string;
  resultTable: {
    columns: string[];
    rows: Record<string, any>[];
  };
}

export interface RagProductCitation {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  relevanceScore: number;
  matchHighlights: string[];
}

export interface RagShoppingResponse {
  userQuery: string;
  answer: string;
  retrievedProducts: RagProductCitation[];
  comparisonSummary?: string;
  suggestedFollowUps: string[];
}

export interface RealTimeSaleEvent {
  id: string;
  orderNumber: string;
  timestamp: string;
  customerName: string;
  productName: string;
  productId: string;
  category: string;
  amount: number;
  units: number;
  channel: 'Direct Web' | 'Marketplace App' | 'Affiliate Partner' | 'Enterprise POS';
  status: 'COMPLETED' | 'PROCESSING' | 'SHIPPED';
}

export interface AdminSystemOverview {
  serverStatus: 'healthy' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  uptimeFormatted: string;
  nodeVersion: string;
  platform: string;
  memoryUsage: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  gemini: {
    activeModel: string;
    isConfigured: boolean;
    provider: string;
    multimodalSupported: boolean;
  };
  databaseStats: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalInventoryValuation: number;
    totalGMV: number;
    lowStockAlerts: number;
  };
  apiPerformance: {
    avgLatencyMs: number;
    totalRequests: number;
    successRatePct: number;
    activeEndpointsCount: number;
  };
}

export interface AdminSystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  message: string;
  details?: any;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  category: string;
  amount: number;
  units: number;
  channel: 'Direct Web' | 'Marketplace App' | 'Affiliate Partner' | 'Enterprise POS';
  status: 'COMPLETED' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  paymentMethod: 'Credit Card' | 'Stripe' | 'Apple Pay' | 'Invoice';
}

export interface ApiEndpointMetadata {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'AI & GenAI' | 'Analytics & BI' | 'Inventory & Catalog' | 'Admin & System' | 'Real-Time';
  description: string;
  defaultPayload?: any;
  exampleResponse?: any;
}

