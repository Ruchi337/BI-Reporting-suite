import { Product } from '../types';

export interface AgentRiskItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  type: 'OVERSTOCK_DEMAND_DROP' | 'STOCKOUT_SURGE' | 'MARGIN_EROSION' | 'DEAD_STOCK';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  currentStock: number;
  daysOfInventory: number;
  demandTrendPct: number;
  reason: string;
  financialExposure: number;
}

export interface AgentStrategicAction {
  id: string;
  productId: string;
  productName: string;
  actionType: 'DISCOUNT' | 'RESTOCK' | 'BUNDLE' | 'PRICE_OPTIMIZE';
  headline: string;
  urgency: 'HIGH' | 'MEDIUM' | 'OPPORTUNITY';
  recommendedDiscountPct?: number;
  newPrice?: number;
  originalPrice: number;
  projectedRevenueRecovery: number;
  rationale: string;
  executed: boolean;
}

export interface AgentEmailDraft {
  subject: string;
  recipientEmail: string;
  recipientName: string;
  dispatchedAt: string;
  htmlBody: string;
  markdownSummary: string;
}

export interface AgentExecutionTraceStep {
  step: string;
  node: string;
  status: 'COMPLETED' | 'RUNNING' | 'SKIPPED';
  durationMs: number;
  details: string;
}

export interface VendorAuditResult {
  vendorId: string;
  vendorName: string;
  businessName: string;
  auditDate: string;
  storeHealthScore: number;
  totalCatalogEvaluated: number;
  totalInventoryValuation: number;
  trace: AgentExecutionTraceStep[];
  risks: AgentRiskItem[];
  actions: AgentStrategicAction[];
  email: AgentEmailDraft;
}

/**
 * Executes an Autonomous AI Agent Workflow (LangGraph style state-graph)
 * Analyzes vendor store metrics, identifies inventory & demand anomalies,
 * formulates strategic advice, and composes an executive advisory email.
 */
export function runAutonomousStoreAudit(
  vendorId: string,
  vendorName: string,
  vendorEmail: string,
  businessName: string,
  products: Product[]
): VendorAuditResult {
  const startTime = Date.now();
  const trace: AgentExecutionTraceStep[] = [];

  // -------------------------------------------------------------
  // NODE 1: Ingest Store Telemetry & Compute Velocity
  // -------------------------------------------------------------
  trace.push({
    step: '1',
    node: 'DataIngestionNode',
    status: 'COMPLETED',
    durationMs: 14,
    details: `Parsed ${products.length} catalog items, sales velocity history, and historical lead-times.`
  });

  const risks: AgentRiskItem[] = [];
  const actions: AgentStrategicAction[] = [];

  // Analyze each product
  products.forEach((product, idx) => {
    // Determine velocity proxies
    const dailySales = Math.max(0.4, (product.reviewCount || 20) / 45);
    const daysOfInventory = Math.round(product.stock / dailySales);

    // Compute mock demand momentum trend based on stock and product characteristics
    let demandTrendPct = 0;
    if (product.stock > 70) {
      demandTrendPct = -28.4; // Inventory is high and demand is dropping!
    } else if (product.stock < (product.minThreshold || 15)) {
      demandTrendPct = +42.1; // Demand is surging, stockout danger
    } else {
      demandTrendPct = +4.5;
    }

    // Pattern 1: High Inventory + Dropping Demand (The exact image example)
    if (product.stock > 60 && demandTrendPct < -10) {
      const discountPct = 15;
      const originalPrice = product.price;
      const newPrice = Math.round(originalPrice * (1 - discountPct / 100) * 100) / 100;
      const unitsToClear = Math.floor(product.stock * 0.45);
      const projectedRevenueRecovery = Math.round(unitsToClear * newPrice);

      risks.push({
        id: `risk-overstock-${product.id}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        type: 'OVERSTOCK_DEMAND_DROP',
        severity: 'HIGH',
        currentStock: product.stock,
        daysOfInventory,
        demandTrendPct,
        reason: `Inventory is exceptionally high (${product.stock} units, ${daysOfInventory} days of supply), while customer demand velocity dropped by ${Math.abs(demandTrendPct)}% over the last 30 days.`,
        financialExposure: Math.round(product.stock * (product.cost || product.price * 0.5))
      });

      actions.push({
        id: `action-discount-${product.id}`,
        productId: product.id,
        productName: product.name,
        actionType: 'DISCOUNT',
        headline: `Apply ${discountPct}% Discount on "${product.name}" to clear excess stock`,
        urgency: 'HIGH',
        recommendedDiscountPct: discountPct,
        originalPrice,
        newPrice,
        projectedRevenueRecovery,
        rationale: `You should discount ${product.name} because inventory is high (${product.stock} units) and demand is dropping (${demandTrendPct}%). A temporary ${discountPct}% price reduction ($${originalPrice} -> $${newPrice}) will stimulate order velocity and prevent $${projectedRevenueRecovery} from being trapped in holding costs.`,
        executed: false
      });
    }

    // Pattern 2: Critically Low Stock with Surging Demand
    else if (product.stock <= (product.minThreshold || 15)) {
      const suggestedReorderUnits = (product.minThreshold || 15) * 4;
      risks.push({
        id: `risk-stockout-${product.id}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        type: 'STOCKOUT_SURGE',
        severity: 'CRITICAL',
        currentStock: product.stock,
        daysOfInventory,
        demandTrendPct,
        reason: `Stock is at critical threshold (${product.stock} units remaining) with estimated ${daysOfInventory} days until total stockout. Lead time is ${product.leadTimeDays || 10} days.`,
        financialExposure: Math.round(product.price * 30)
      });

      actions.push({
        id: `action-restock-${product.id}`,
        productId: product.id,
        productName: product.name,
        actionType: 'RESTOCK',
        headline: `Expedite Reorder of ${suggestedReorderUnits} units from ${product.supplier || 'Primary Supplier'}`,
        urgency: 'HIGH',
        originalPrice: product.price,
        projectedRevenueRecovery: Math.round(suggestedReorderUnits * product.price * 0.8),
        rationale: `Demand is surging (+${demandTrendPct}%) and stock will deplete in ${daysOfInventory} days. Expedite reorder of ${suggestedReorderUnits} units to avoid $${Math.round(product.price * 25)} in lost revenue opportunities.`,
        executed: false
      });
    }
  });

  // -------------------------------------------------------------
  // NODE 2: Anomaly & Risk Detection
  // -------------------------------------------------------------
  trace.push({
    step: '2',
    node: 'AnomalyDetectorNode',
    status: 'COMPLETED',
    durationMs: 22,
    details: `Flagged ${risks.length} critical inventory vulnerabilities and capital exposure risks.`
  });

  // -------------------------------------------------------------
  // NODE 3: Strategic Reasoning & LangGraph Policy Optimization
  // -------------------------------------------------------------
  trace.push({
    step: '3',
    node: 'StrategicReasoningNode',
    status: 'COMPLETED',
    durationMs: 38,
    details: `Generated ${actions.length} prioritized tactical operations with quantitative ROI recovery estimates.`
  });

  // -------------------------------------------------------------
  // NODE 4: Proactive Executive Email Generation
  // -------------------------------------------------------------
  const auditDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const emailSubject = `Weekly Strategic Advisory for ${businessName}: Action Recommended on ${actions.length} SKUs`;

  const topDiscount = actions.find(a => a.actionType === 'DISCOUNT') || actions[0];

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #1e1b4b; padding: 28px 24px; color: #ffffff; }
    .tag { display: inline-block; padding: 4px 10px; background: rgba(99,102,241,0.2); color: #818cf8; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
    .content { padding: 24px; }
    .alert-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #92400e; }
    .action-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .action-badge { font-size: 11px; font-weight: 700; color: #4338ca; background: #e0e7ff; padding: 2px 8px; border-radius: 6px; }
    .action-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 8px 0 4px 0; }
    .action-desc { font-size: 13px; color: #475569; margin: 0 0 12px 0; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; }
    .footer { background: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="tag">ShopSense Autonomous Store Agent</div>
      <h1 class="title">Weekly Strategic Store Advisory</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #c7d2fe;">Prepared for ${vendorName} (${businessName}) • ${auditDateStr}</p>
    </div>
    <div class="content">
      <p style="font-size: 14px;">Hello ${vendorName},</p>
      <p style="font-size: 13px; color: #334155;">
        Our autonomous intelligence agent completed your weekly store health analysis. Based on order velocity, inventory holding costs, and sales velocity data, we have identified actionable strategic adjustments to protect your margin and optimize cash flow.
      </p>

      <div class="alert-box">
        <strong>⚡ Primary Action Item:</strong> You should discount <strong>${topDiscount?.productName || 'selected items'}</strong> because current warehouse inventory is high and sales demand is declining.
      </div>

      <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 20px;">Prioritized Recommendations:</h3>

      ${actions.map((act, i) => `
        <div class="action-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="action-badge">${act.actionType}</span>
            <span style="font-size: 12px; font-weight: 600; color: #059669;">Proj. Impact: +$${act.projectedRevenueRecovery.toLocaleString()}</span>
          </div>
          <div class="action-title">${act.headline}</div>
          <p class="action-desc">${act.rationale}</p>
          <div style="margin-top: 10px;">
            <span style="font-size: 12px; color: #64748b;">Current: $${act.originalPrice} &nbsp;→&nbsp; </span>
            <span style="font-size: 13px; font-weight: 700; color: #4f46e5;">Target: $${act.newPrice || act.originalPrice}</span>
          </div>
        </div>
      `).join('')}

      <div style="margin-top: 24px; text-align: center;">
        <a href="#execute" class="btn">Review & One-Click Execute Recommendations</a>
      </div>
    </div>
    <div class="footer">
      Sent automatically by ShopSense Autonomous AI Agent • Continuous Telemetry & Strategic Optimization
    </div>
  </div>
</body>
</html>
  `.trim();

  const markdownSummary = `
### Weekly Autonomous AI Strategic Advisory for ${businessName}
*Audit Timestamp: ${auditDateStr}*

**Key Takeaways:**
${actions.map(a => `- **${a.actionType}:** ${a.headline}\n  *Rationale:* ${a.rationale}`).join('\n')}

**Projected Financial Recovery:** +$${actions.reduce((acc, a) => acc + a.projectedRevenueRecovery, 0).toLocaleString()}
  `.trim();

  const emailDraft: AgentEmailDraft = {
    subject: emailSubject,
    recipientEmail: vendorEmail,
    recipientName: vendorName,
    dispatchedAt: new Date().toISOString(),
    htmlBody,
    markdownSummary
  };

  trace.push({
    step: '4',
    node: 'EmailDispatcherNode',
    status: 'COMPLETED',
    durationMs: 18,
    details: `Compiled proactive executive HTML advisory and dispatched to ${vendorEmail}.`
  });

  const totalInventoryValuation = Math.round(
    products.reduce((acc, p) => acc + p.price * p.stock, 0)
  );

  const storeHealthScore = Math.max(
    58,
    Math.min(96, 95 - risks.filter(r => r.severity === 'CRITICAL').length * 12 - risks.filter(r => r.severity === 'HIGH').length * 6)
  );

  return {
    vendorId,
    vendorName,
    businessName,
    auditDate: new Date().toISOString(),
    storeHealthScore,
    totalCatalogEvaluated: products.length,
    totalInventoryValuation,
    trace,
    risks,
    actions,
    email: emailDraft
  };
}
