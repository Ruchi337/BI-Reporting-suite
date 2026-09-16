import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Crown, 
  HeartHandshake, 
  Sparkles, 
  AlertCircle, 
  UserPlus, 
  Search, 
  Code2, 
  Filter, 
  CheckCircle2, 
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Customer, CustomerSegmentSummary } from '../types';

interface CustomerAnalyticsProps {
  customers: Customer[];
}

const SEGMENT_COLORS: Record<string, string> = {
  'VIP Champions': '#6366f1', // Indigo
  'Loyal Customers': '#3b82f6', // Blue
  'Potential Loyalists': '#10b981', // Emerald
  'At Risk / Lapsing': '#f59e0b', // Amber
  'New / Low Spend': '#94a3b8'  // Slate
};

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ customers }) => {
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSqlLogic, setShowSqlLogic] = useState(false);
  const [campaignToast, setCampaignToast] = useState('');

  // Calculate SQL Segment Summaries
  const segments: Record<string, { count: number; totalRevenue: number; totalOrders: number; description: string; campaign: string }> = {
    'VIP Champions': {
      count: 0,
      totalRevenue: 0,
      totalOrders: 0,
      description: 'Top 10% spenders (₹2,500+ LTV) with highest repeat order frequency and brand affinity.',
      campaign: 'Exclusive VIP early-access product drops and dedicated concierge perks.'
    },
    'Loyal Customers': {
      count: 0,
      totalRevenue: 0,
      totalOrders: 0,
      description: 'Consistent buyers (₹1,200 - ₹2,499) who purchase across multiple categories.',
      campaign: 'Loyalty milestone rewards & personalized bundle cross-sell discounts.'
    },
    'Potential Loyalists': {
      count: 0,
      totalRevenue: 0,
      totalOrders: 0,
      description: 'Recent purchasers (₹500 - ₹1,199) with high velocity and upside potential.',
      campaign: 'Category discovery email drips & limited-time upgrade incentives.'
    },
    'At Risk / Lapsing': {
      count: 0,
      totalRevenue: 0,
      totalOrders: 0,
      description: 'High historical spenders who have not ordered in >90 days (churn risk).',
      campaign: 'Personalized win-back campaign with 15% incentive code & feedback survey.'
    },
    'New / Low Spend': {
      count: 0,
      totalRevenue: 0,
      totalOrders: 0,
      description: 'First-time buyers (<₹500) who completed an initial order in the last 30 days.',
      campaign: 'Welcome onboarding sequence with usage guides & next-order voucher.'
    }
  };

  customers.forEach(c => {
    if (segments[c.segment]) {
      segments[c.segment].count++;
      segments[c.segment].totalRevenue += c.totalSpent;
      segments[c.segment].totalOrders += c.orderCount;
    }
  });

  const totalRevenueAll = Object.values(segments).reduce((acc, curr) => acc + curr.totalRevenue, 0);

  const segmentSummaries: CustomerSegmentSummary[] = Object.entries(segments).map(([name, data]) => ({
    segment: name,
    count: data.count,
    percentage: Number(((data.count / (customers.length || 1)) * 100).toFixed(1)),
    totalRevenue: data.totalRevenue,
    avgLTV: data.count > 0 ? Number((data.totalRevenue / data.count).toFixed(2)) : 0,
    description: data.description,
    recommendedCampaign: data.campaign
  }));

  const filteredCustomers = customers.filter(c => {
    const matchesSeg = selectedSegmentFilter === 'All' || c.segment === selectedSegmentFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.favoriteCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeg && matchesSearch;
  });

  const chartData = segmentSummaries.map(s => ({
    name: s.segment,
    revenue: s.totalRevenue,
    customers: s.count,
    avgLTV: s.avgLTV
  }));

  const pieData = segmentSummaries.map(s => ({
    name: s.segment,
    value: s.count
  }));

  const handleTriggerCampaign = (segmentName: string) => {
    setCampaignToast(`Automated campaign dispatched to all customers in "${segmentName}"!`);
    setTimeout(() => setCampaignToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">SQL Customer Segmentation & Analytics</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cohort segmentation using SQL spend and recency criteria, RFM analysis, and automated retention playbooks.
          </p>
        </div>

        <button
          onClick={() => setShowSqlLogic(!showSqlLogic)}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
        >
          <Code2 className="h-4 w-4 text-indigo-600" />
          <span>{showSqlLogic ? 'Hide SQL Logic' : 'View SQL Query Logic'}</span>
        </button>
      </div>

      {campaignToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{campaignToast}</span>
        </div>
      )}

      {/* SQL Logic Drawer */}
      {showSqlLogic && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Code2 className="h-4 w-4" />
              <span>SQL Segmentation Engine (PostgreSQL / BigQuery Schema)</span>
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded">Execution time: 1.4ms</span>
          </div>
          <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
{`-- Customer Spend & Recency RFM Cohort Segmentation Query
SELECT 
  id,
  name,
  email,
  totalSpent,
  orderCount,
  daysSinceLastPurchase,
  CASE 
    WHEN totalSpent >= 2500 THEN 'VIP Champions'
    WHEN totalSpent >= 1200 THEN 'Loyal Customers'
    WHEN totalSpent >= 500  THEN 'Potential Loyalists'
    WHEN daysSinceLastPurchase > 90 THEN 'At Risk / Lapsing'
    ELSE 'New / Low Spend'
  END AS customer_segment,
  ROUND(totalSpent / orderCount, 2) AS average_order_value
FROM customers
ORDER BY totalSpent DESC;`}
          </pre>
        </div>
      )}

      {/* Segment Cards Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {segmentSummaries.map(s => {
          const isSelected = selectedSegmentFilter === s.segment;
          return (
            <div
              key={s.segment}
              onClick={() => setSelectedSegmentFilter(isSelected ? 'All' : s.segment)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 truncate" title={s.segment}>
                  {s.segment}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: SEGMENT_COLORS[s.segment] }}
                />
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-xl font-bold text-slate-900">{s.count}</span>
                <span className="text-[11px] text-slate-500">users ({s.percentage}%)</span>
              </div>

              <div className="text-xs text-slate-600 font-semibold mb-3">
                ₹{s.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerCampaign(s.segment);
                }}
                className="w-full text-center text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1 px-2 rounded-lg border border-indigo-100 transition-colors flex items-center justify-center gap-1"
              >
                <Mail className="h-3 w-3" />
                <span>Trigger Playbook</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Cohort Visualizer Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Revenue Generated by Customer Segment (₹)</h3>
            <span className="text-xs text-slate-400">Total GMV: ₹{totalRevenueAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Total Spend']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Cohort User Share</h3>
            <p className="text-xs text-slate-500">Distribution across spend segments</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            {segmentSummaries.map(s => (
              <div key={s.segment} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[s.segment] }} />
                  <span className="truncate">{s.segment}</span>
                </span>
                <span className="font-semibold text-slate-800">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Customer Records</h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {filteredCustomers.length} Records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedSegmentFilter}
              onChange={e => setSelectedSegmentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Segments</option>
              {Object.keys(segments).map(seg => (
                <option key={seg} value={seg}>{seg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Segment Tier</th>
                <th className="py-3 px-4">Total Spent (LTV)</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Avg Order</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Category Affinity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{cust.name}</div>
                    <div className="text-[11px] text-slate-400">{cust.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: SEGMENT_COLORS[cust.segment] || '#6366f1' }}
                    >
                      {cust.segment}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{cust.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {cust.orderCount} orders
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    ₹{cust.avgOrderValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cust.daysSinceLastPurchase > 90 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                      {cust.daysSinceLastPurchase} days ago
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      {cust.favoriteCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
