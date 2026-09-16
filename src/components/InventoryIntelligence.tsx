import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Boxes,
  Loader2,
  Clock,
  Layers,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Product, HistoricalSalesPoint, ForecastResult } from '../types';
import { calculateTimeSeriesForecast, calculateStockHealth } from '../utils/forecasting';
import { SAMPLE_HISTORICAL_SALES } from '../mockData';

interface InventoryIntelligenceProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  selectedProductId?: string;
}

export const InventoryIntelligence: React.FC<InventoryIntelligenceProps> = ({
  products,
  onUpdateStock,
  selectedProductId
}) => {
  const [activeProductId, setActiveProductId] = useState(selectedProductId || products[0]?.id || 'prod-001');
  const [forecastHorizon, setForecastHorizon] = useState<number>(4);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [isGeneratingAiInsights, setIsGeneratingAiInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState(50);
  const [successToast, setSuccessToast] = useState('');

  const activeProduct = products.find(p => p.id === activeProductId) || products[0];

  // Calculate inventory health for active product
  const stockHealth = activeProduct ? calculateStockHealth(
    activeProduct.stock,
    activeProduct.minThreshold,
    activeProduct.leadTimeDays,
    activeProduct.salesLast30Days
  ) : null;

  // Run ML time-series forecast model whenever product or horizon changes
  useEffect(() => {
    if (!activeProduct) return;
    
    // Get historical sales or synthesize based on velocity
    let history: HistoricalSalesPoint[] = SAMPLE_HISTORICAL_SALES[activeProduct.id];
    if (!history) {
      // Generate synthetic 12-month series based on product price and velocity
      const months = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
      const baseVel = activeProduct.salesLast30Days || 20;
      history = months.map((m, idx) => {
        const factor = idx === 3 || idx === 4 ? 1.4 : (idx === 10 || idx === 11 ? 1.2 : 0.9 + Math.sin(idx) * 0.15);
        const actual = Math.max(5, Math.round(baseVel * factor));
        return {
          date: m,
          actualSales: actual,
          revenue: actual * activeProduct.price,
          stockLevel: Math.max(10, activeProduct.stock + (12 - idx) * 5)
        };
      });
    }

    const forecast = calculateTimeSeriesForecast(
      activeProduct.id,
      activeProduct.name,
      history,
      forecastHorizon
    );
    setForecastResult(forecast);

    // Auto-fetch Gemini supply chain intelligence
    fetchAiForecastInsights(activeProduct, history, forecast.forecastPoints);
  }, [activeProductId, forecastHorizon, activeProduct?.stock]);

  const fetchAiForecastInsights = async (
    product: Product,
    history: HistoricalSalesPoint[],
    forecastPoints: any[]
  ) => {
    setIsGeneratingAiInsights(true);
    try {
      const res = await fetch('/api/ai/forecast-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          currentStock: product.stock,
          minThreshold: product.minThreshold,
          leadTimeDays: product.leadTimeDays,
          historicalSales: history.slice(-4),
          forecastedSales: forecastPoints
        })
      });
      const data = await res.json();
      setAiInsights(data);
    } catch (err) {
      console.error('Error fetching forecast insights:', err);
    } finally {
      setIsGeneratingAiInsights(false);
    }
  };

  const handleExecuteRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    const newStock = activeProduct.stock + Number(restockQuantity);
    onUpdateStock(activeProduct.id, newStock);
    setRestockModalOpen(false);
    setSuccessToast(`Successfully received purchase order! Stock updated to ${newStock} units.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Prepare unified chart data combining Historical Actuals + Predicted + Forecast Horizon
  const chartData = [
    ...(forecastResult?.historicalData.map(h => ({
      date: h.date,
      type: 'historical',
      actualSales: h.actualSales,
      fittedModel: h.predictedSales,
      lowerBound: undefined,
      upperBound: undefined,
      forecastSales: undefined,
      stockLevel: h.stockLevel
    })) || []),
    ...(forecastResult?.forecastPoints.map(f => ({
      date: f.date,
      type: 'forecast',
      actualSales: undefined,
      fittedModel: undefined,
      forecastSales: f.predictedSales,
      lowerBound: f.lowerBound,
      upperBound: f.upperBound,
      stockLevel: undefined
    })) || [])
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Inventory Intelligence & ML Demand Forecasting</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock level monitoring, automated stockout alert triggers, and Holt-Winters / ARIMA time-series ML prediction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRestockModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Product Selector Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase px-2 whitespace-nowrap">
          Target SKU:
        </span>
        {products.map(p => {
          const isSelected = p.id === activeProductId;
          const isLow = p.stock <= p.minThreshold;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProductId(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
              {isLow && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white text-indigo-900' : 'bg-rose-500 text-white'
                }`}>
                  {p.stock} left
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Core Inventory KPI Grid */}
      {stockHealth && activeProduct && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Current Stock Level</span>
              <Boxes className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${
                stockHealth.severity === 'critical' ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {activeProduct.stock}
              </span>
              <span className="text-xs text-slate-500">units in warehouse</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Min. Safety Threshold:</span>
              <span className="font-semibold text-slate-800">{activeProduct.minThreshold} units</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Days of Stock Remaining</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${
                stockHealth.daysRemaining <= 10 ? 'text-rose-600' : (stockHealth.daysRemaining <= 25 ? 'text-amber-600' : 'text-emerald-600')
              }`}>
                {stockHealth.daysRemaining} days
              </span>
              <span className="text-xs text-slate-500">at current run rate</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Daily Run Rate Velocity:</span>
              <span className="font-semibold text-slate-800">{stockHealth.dailyVelocity} units/day</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Projected Stockout Date</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {stockHealth.projectedStockoutDate}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Supplier Lead Time:</span>
              <span className="font-semibold text-slate-800">{activeProduct.leadTimeDays} days</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Recommended Reorder</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-600">
                +{stockHealth.suggestedReorderQuantity}
              </span>
              <span className="text-xs text-slate-500">units recommended</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Calculated Safety Stock:</span>
              <span className="font-semibold text-slate-800">{stockHealth.safetyStock} units buffer</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Section: Time-Series Machine Learning Demand Forecasting */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Machine Learning Demand Forecasting (Holt-Winters / ARIMA Model)
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                95% Confidence Band
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on 12-month historical sales data to predict future inventory demand spikes and prevent stockouts.
            </p>
          </div>

          {/* Forecast Horizon Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Forecast Horizon:</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {[3, 4, 6].map(m => (
                <button
                  key={m}
                  onClick={() => setForecastHorizon(m)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    forecastHorizon === m
                      ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  +{m} Mo
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Accuracy & Statistical Validation Badges */}
        {forecastResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Model Algorithm</span>
              <span className="text-xs font-bold text-slate-800">{forecastResult.modelMetrics.method}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Backtested Accuracy</span>
              <span className="text-xs font-bold text-emerald-600">
                {forecastResult.modelMetrics.accuracyScore}% ({100 - forecastResult.modelMetrics.mape}% match)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Mean Abs. Pct. Error (MAPE)</span>
              <span className="text-xs font-bold text-slate-800">{forecastResult.modelMetrics.mape}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Root Mean Sq. Error (RMSE)</span>
              <span className="text-xs font-bold text-slate-800">±{forecastResult.modelMetrics.rmse} units</span>
            </div>
          </div>
        )}

        {/* Recharts Composite Visualizer */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Historical actuals */}
              <Bar 
                dataKey="actualSales" 
                name="Historical Actual Sales (Units)" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />

              {/* Fitted backtest line */}
              <Line 
                type="monotone" 
                dataKey="fittedModel" 
                name="Model Backtest Fit" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Future Forecast Prediction */}
              <Line 
                type="monotone" 
                dataKey="forecastSales" 
                name="ML Future Predicted Demand" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1' }}
              />

              {/* Confidence Interval Upper/Lower */}
              <Area 
                type="monotone" 
                dataKey="upperBound" 
                name="95% Upper Bound" 
                stroke="#818cf8" 
                fill="url(#forecastBand)" 
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Supply Chain Insights Card */}
      <div className="bg-linear-to-br from-indigo-900 via-slate-900 to-slate-900 p-5 rounded-2xl border border-indigo-800/40 text-white shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-800/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Gemini AI Supply Chain Intelligence</h4>
              <p className="text-[11px] text-indigo-300">Automated reasoning on seasonal spikes and safety stock</p>
            </div>
          </div>
          {isGeneratingAiInsights && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing lead times...</span>
            </div>
          )}
        </div>

        {aiInsights ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <p className="text-xs text-slate-200 leading-relaxed">
                {aiInsights.summary}
              </p>
              
              <div>
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block mb-1.5">
                  Seasonal Drivers & Demand Catalysts:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {aiInsights.seasonalFactors?.map((fac: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-indigo-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Procurement Action Trigger
                </span>
                <p className="text-xs text-indigo-200 font-medium">
                  {aiInsights.reorderRecommendation}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">Risk Assessment:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  aiInsights.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {aiInsights.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Analyzing demand signals...
          </div>
        )}
      </div>

      {/* Restock Purchase Order Modal */}
      {restockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Restock Purchase Order</h3>
            <p className="text-xs text-slate-500 mb-4">
              Send purchase order to {activeProduct.supplier} for {activeProduct.name}.
            </p>

            <form onSubmit={handleExecuteRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Units to Order</label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={e => setRestockQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Est. Cost: ₹{(Number(restockQuantity) * activeProduct.cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                >
                  Confirm & Receive Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
