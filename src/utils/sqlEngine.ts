import { Customer, Product, SqlQueryResult } from '../types';

export const PRESET_SQL_QUERIES = [
  {
    id: 'q1',
    name: 'Customer Segmentation by Total Spend (RFM Tiers)',
    category: 'Customer Intelligence',
    sql: `SELECT 
  CASE 
    WHEN totalSpent >= 2500 THEN 'VIP Champions'
    WHEN totalSpent >= 1200 THEN 'Loyal Customers'
    WHEN totalSpent >= 500  THEN 'Potential Loyalists'
    WHEN daysSinceLastPurchase > 90 THEN 'At Risk / Lapsing'
    ELSE 'New / Low Spend'
  END AS segment_tier,
  COUNT(*) AS customer_count,
  ROUND(SUM(totalSpent), 2) AS total_revenue,
  ROUND(AVG(totalSpent), 2) AS avg_customer_ltv,
  ROUND(AVG(orderCount), 1) AS avg_orders_per_user
FROM customers
GROUP BY segment_tier
ORDER BY total_revenue DESC;`,
    description: 'Segments the customer base into distinct value tiers and computes cohort revenue contribution.'
  },
  {
    id: 'q2',
    name: 'Inventory Health & Stockout Risk Monitor',
    category: 'Inventory Intelligence',
    sql: `SELECT 
  id,
  name,
  sku,
  stock AS current_stock,
  minThreshold AS min_threshold,
  salesLast30Days AS 30d_velocity,
  ROUND(stock / (salesLast30Days / 30.0), 1) AS days_inventory_left,
  CASE 
    WHEN stock <= minThreshold THEN 'CRITICAL: RESTOCK NOW'
    WHEN stock <= (minThreshold * 1.5) THEN 'WARNING: LOW STOCK'
    ELSE 'HEALTHY'
  END AS stock_status
FROM products
ORDER BY days_inventory_left ASC;`,
    description: 'Identifies immediate supply chain bottlenecks, stockout risks, and run-rate projections.'
  },
  {
    id: 'q3',
    name: 'Category Sales Velocity & Gross Margins',
    category: 'BI & Financials',
    sql: `SELECT 
  category,
  COUNT(id) AS total_skus,
  SUM(stock) AS total_units_in_stock,
  ROUND(SUM(price * stock), 2) AS total_inventory_valuation,
  ROUND(AVG(((price - cost) / price) * 100), 1) AS avg_gross_margin_pct,
  SUM(salesLast30Days) AS total_units_sold_30d
FROM products
GROUP BY category
ORDER BY total_inventory_valuation DESC;`,
    description: 'Calculates inventory valuation, unit economics, and profit margin health across all product categories.'
  },
  {
    id: 'q4',
    name: 'At-Risk High Value Customers (Churn Prevention)',
    category: 'Customer Intelligence',
    sql: `SELECT 
  id,
  name,
  email,
  totalSpent,
  orderCount,
  daysSinceLastPurchase,
  favoriteCategory
FROM customers
WHERE totalSpent >= 800 AND daysSinceLastPurchase > 60
ORDER BY totalSpent DESC;`,
    description: 'Identifies high-value customers who have not placed an order in over 60 days for win-back campaigns.'
  }
];

export function executeAnalyticalQuery(
  sqlQuery: string,
  dataContext: { products: Product[]; customers: Customer[] }
): SqlQueryResult {
  const startTime = performance.now();
  const trimmed = sqlQuery.trim();

  // Query 1: Customer Segmentation
  if (trimmed.includes('FROM customers') && trimmed.includes('segment_tier') || trimmed.includes('GROUP BY segment_tier') || trimmed.includes('VIP Champions')) {
    const segments: Record<string, { count: number; totalRev: number; totalOrders: number }> = {
      'VIP Champions': { count: 0, totalRev: 0, totalOrders: 0 },
      'Loyal Customers': { count: 0, totalRev: 0, totalOrders: 0 },
      'Potential Loyalists': { count: 0, totalRev: 0, totalOrders: 0 },
      'At Risk / Lapsing': { count: 0, totalRev: 0, totalOrders: 0 },
      'New / Low Spend': { count: 0, totalRev: 0, totalOrders: 0 }
    };

    dataContext.customers.forEach(c => {
      let tier = 'New / Low Spend';
      if (c.totalSpent >= 2500) tier = 'VIP Champions';
      else if (c.totalSpent >= 1200) tier = 'Loyal Customers';
      else if (c.totalSpent >= 500) tier = 'Potential Loyalists';
      else if (c.daysSinceLastPurchase > 90) tier = 'At Risk / Lapsing';

      if (!segments[tier]) segments[tier] = { count: 0, totalRev: 0, totalOrders: 0 };
      segments[tier].count++;
      segments[tier].totalRev += c.totalSpent;
      segments[tier].totalOrders += c.orderCount;
    });

    const rows = Object.entries(segments)
      .map(([tier, data]) => ({
        segment_tier: tier,
        customer_count: data.count,
        total_revenue: `$${data.totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        avg_customer_ltv: `$${(data.count > 0 ? data.totalRev / data.count : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        avg_orders_per_user: data.count > 0 ? (data.totalOrders / data.count).toFixed(1) : '0.0'
      }))
      .sort((a, b) => parseFloat(b.total_revenue.replace(/[^0-9.]/g, '')) - parseFloat(a.total_revenue.replace(/[^0-9.]/g, '')));

    return {
      query: sqlQuery,
      columns: ['segment_tier', 'customer_count', 'total_revenue', 'avg_customer_ltv', 'avg_orders_per_user'],
      rows,
      rowCount: rows.length,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2))
    };
  }

  // Query 2: Inventory Health & Stockout Risk
  if (trimmed.includes('FROM products') && (trimmed.includes('days_inventory_left') || trimmed.includes('stock_status') || trimmed.includes('minThreshold'))) {
    const rows = dataContext.products.map(p => {
      const daily = p.salesLast30Days / 30.0;
      const daysLeft = daily > 0 ? Number((p.stock / daily).toFixed(1)) : 999;
      let status = 'HEALTHY';
      if (p.stock <= p.minThreshold) status = 'CRITICAL: RESTOCK NOW';
      else if (p.stock <= p.minThreshold * 1.5) status = 'WARNING: LOW STOCK';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        current_stock: p.stock,
        min_threshold: p.minThreshold,
        '30d_velocity': p.salesLast30Days,
        days_inventory_left: daysLeft,
        stock_status: status
      };
    }).sort((a, b) => a.days_inventory_left - b.days_inventory_left);

    return {
      query: sqlQuery,
      columns: ['id', 'name', 'sku', 'current_stock', 'min_threshold', '30d_velocity', 'days_inventory_left', 'stock_status'],
      rows,
      rowCount: rows.length,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2))
    };
  }

  // Query 3: Category Velocity & Margins
  if (trimmed.includes('FROM products') && (trimmed.includes('GROUP BY category') || trimmed.includes('avg_gross_margin_pct'))) {
    const cats: Record<string, { skus: number; stock: number; valuation: number; marginSum: number; sales30d: number }> = {};
    dataContext.products.forEach(p => {
      if (!cats[p.category]) cats[p.category] = { skus: 0, stock: 0, valuation: 0, marginSum: 0, sales30d: 0 };
      cats[p.category].skus++;
      cats[p.category].stock += p.stock;
      cats[p.category].valuation += p.price * p.stock;
      const margin = ((p.price - p.cost) / p.price) * 100;
      cats[p.category].marginSum += margin;
      cats[p.category].sales30d += p.salesLast30Days;
    });

    const rows = Object.entries(cats).map(([cat, d]) => ({
      category: cat,
      total_skus: d.skus,
      total_units_in_stock: d.stock,
      total_inventory_valuation: `$${d.valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      avg_gross_margin_pct: `${(d.marginSum / d.skus).toFixed(1)}%`,
      total_units_sold_30d: d.sales30d
    })).sort((a, b) => parseFloat(b.total_inventory_valuation.replace(/[^0-9.]/g, '')) - parseFloat(a.total_inventory_valuation.replace(/[^0-9.]/g, '')));

    return {
      query: sqlQuery,
      columns: ['category', 'total_skus', 'total_units_in_stock', 'total_inventory_valuation', 'avg_gross_margin_pct', 'total_units_sold_30d'],
      rows,
      rowCount: rows.length,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2))
    };
  }

  // Query 4: At-Risk High Value Customers
  if (trimmed.includes('WHERE') && (trimmed.includes('daysSinceLastPurchase >') || trimmed.includes('favoriteCategory'))) {
    const filtered = dataContext.customers.filter(c => c.totalSpent >= 800 && c.daysSinceLastPurchase > 60);
    const rows = filtered.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      totalSpent: `$${c.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      orderCount: c.orderCount,
      daysSinceLastPurchase: `${c.daysSinceLastPurchase} days ago`,
      favoriteCategory: c.favoriteCategory
    }));

    return {
      query: sqlQuery,
      columns: ['id', 'name', 'email', 'totalSpent', 'orderCount', 'daysSinceLastPurchase', 'favoriteCategory'],
      rows,
      rowCount: rows.length,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2))
    };
  }

  // Fallback generic scan
  const rows = dataContext.products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: `$${p.price.toFixed(2)}`,
    stock: p.stock
  }));

  return {
    query: sqlQuery,
    columns: ['id', 'name', 'sku', 'category', 'price', 'stock'],
    rows,
    rowCount: rows.length,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2))
  };
}
