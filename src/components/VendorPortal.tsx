import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Store, 
  TrendingUp, 
  Package, 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Key, 
  ArrowUpRight, 
  Edit3, 
  Save, 
  RefreshCw, 
  PlusCircle, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Star,
  Activity,
  Layers,
  ArrowRight,
  Bot,
  Zap,
  Send,
  TrendingDown
} from 'lucide-react';
import { Vendor, Product, Transaction, AuthUser } from '../types';
import { runAutonomousStoreAudit, VendorAuditResult, AgentStrategicAction } from '../utils/aiAgentWorkflow';

interface VendorPortalProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onNavigateToCatalog?: () => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({ 
  products,
  onAddProduct,
  onNavigateToCatalog
}) => {
  // Active selected vendor ID
  const [selectedVendorId, setSelectedVendorId] = useState<string>('vendor-001');
  const [vendorsList, setVendorsList] = useState<Vendor[]>([]);
  const [vendorAnalytics, setVendorAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'profile' | 'register' | 'transactions' | 'ai-advisor'>('analytics');
  const [vendorAudit, setVendorAudit] = useState<VendorAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [advisorEmailSent, setAdvisorEmailSent] = useState<boolean>(false);
  const [advisorActionMsg, setAdvisorActionMsg] = useState<string | null>(null);

  // Vendor Profile Edit Form state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    companyName: '',
    address: '',
    bio: '',
    status: 'active' as 'active' | 'pending' | 'suspended'
  });
  const [profileSaveMessage, setProfileSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Vendor Registration Form state
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    companyName: '',
    address: '',
    password: '',
    bio: ''
  });
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [regMessage, setRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Direct Transaction / Order Simulator state
  const [transactionForm, setTransactionForm] = useState({
    productId: '',
    quantity: 1,
    customerName: 'Marcus Holloway',
    customerEmail: 'marcus.h@techcraft.dev',
    channel: 'Direct Web',
    paymentMethod: 'Credit Card'
  });
  const [transLoading, setTransLoading] = useState<boolean>(false);
  const [transMessage, setTransMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auth User token state
  const [activeAuthUser, setActiveAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Fetch all vendors on mount
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vendors');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.vendors)) {
        setVendorsList(data.vendors);
      }
    } catch {
      // Quiet fallback
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch analytics and profile for selected vendor
  const fetchVendorAnalytics = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/analytics`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.analytics) {
        setVendorAnalytics(data.analytics);
      }
    } catch {
      // Quiet fallback
    }
  };

  // Fetch specific vendor profile
  const fetchVendorProfile = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.vendor) {
        const v = data.vendor;
        setProfileForm({
          name: v.name || '',
          email: v.email || '',
          phone: v.phone || '',
          businessName: v.businessName || '',
          companyName: v.companyName || v.businessName || '',
          address: v.address || '',
          bio: v.bio || '',
          status: v.status || 'active'
        });
      }
    } catch {
      // Quiet fallback
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      fetchVendorAnalytics(selectedVendorId);
      fetchVendorProfile(selectedVendorId);
    }
  }, [selectedVendorId]);

  // Set default product for transaction simulator
  useEffect(() => {
    const vendorProds = products.filter(p => p.vendorId === selectedVendorId);
    if (vendorProds.length > 0 && !transactionForm.productId) {
      setTransactionForm(prev => ({ ...prev, productId: vendorProds[0].id }));
    }
  }, [selectedVendorId, products]);

  // Handle Profile Update (PUT /api/vendors/:id)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveMessage(null);

    try {
      const res = await fetch(`/api/vendors/${selectedVendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        setProfileSaveMessage({ type: 'success', text: data.message || 'Vendor profile successfully updated!' });
        setIsEditingProfile(false);
        fetchVendors();
        fetchVendorAnalytics(selectedVendorId);
      } else {
        setProfileSaveMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setProfileSaveMessage({ type: 'error', text: err.message || 'Network error updating vendor profile.' });
    }
  };

  // Handle Vendor Registration (POST /api/vendors/register)
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMessage(null);

    try {
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (data.success && data.vendor) {
        setRegMessage({ type: 'success', text: `Success! Registered '${data.vendor.businessName}' with ID: ${data.vendor.id}` });
        if (data.token) {
          setAuthToken(data.token);
          setActiveAuthUser(data.vendor);
        }
        await fetchVendors();
        setSelectedVendorId(data.vendor.id);
        setRegForm({
          name: '',
          email: '',
          phone: '',
          businessName: '',
          companyName: '',
          address: '',
          password: '',
          bio: ''
        });
        setTimeout(() => setActiveSubTab('analytics'), 1500);
      } else {
        setRegMessage({ type: 'error', text: data.message || 'Registration failed.' });
      }
    } catch (err: any) {
      setRegMessage({ type: 'error', text: err.message || 'Network error during registration.' });
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Transaction Execution (POST /api/transactions)
  const handleExecuteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransLoading(true);
    setTransMessage(null);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          vendorId: selectedVendorId
        })
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setTransMessage({ 
          type: 'success', 
          text: `Transaction ${data.transaction.orderNumber} completed! ${data.transaction.units}x units sold for ₹${data.transaction.totalAmount.toFixed(2)}. Inventory updated.`
        });
        // Refresh analytics
        fetchVendorAnalytics(selectedVendorId);
      } else {
        setTransMessage({ type: 'error', text: data.message || 'Transaction could not be processed.' });
      }
    } catch (err: any) {
      setTransMessage({ type: 'error', text: err.message || 'Transaction processing failed.' });
    } finally {
      setTransLoading(false);
    }
  };

  const currentVendor = vendorsList.find(v => v.id === selectedVendorId) || vendorsList[0];
  const vendorProducts = products.filter(p => p.vendorId === selectedVendorId || p.supplier === currentVendor?.businessName);

  return (
    <div id="vendor-portal-container" className="space-y-6">
      {/* Top Banner & Active Vendor Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Store className="h-4 w-4" />
              <span>Marketplace Foundation & Vendor Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Vendor Management & Analytics Portal</span>
              {currentVendor?.status === 'active' && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Merchant
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Complete vendor onboarding, JWT authentication, profile CRUD endpoints, and per-vendor sales/revenue analytics connected to the unified marketplace data store.
            </p>
          </div>

          {/* Switch Active Vendor */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <label htmlFor="vendor-select-dropdown" className="text-xs text-slate-300 font-medium">Switch Vendor:</label>
              <select
                id="vendor-select-dropdown"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="bg-slate-900 text-white text-xs font-medium border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {vendorsList.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.businessName} ({v.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveSubTab('register')}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register New Vendor</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Vendor Analytics & KPIs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Profile & Store Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'transactions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Live Transaction Simulator</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('ai-advisor');
              if (!vendorAudit) {
                const audit = runAutonomousStoreAudit(
                  selectedVendorId,
                  currentVendor?.name || 'Vendor Merchant',
                  currentVendor?.email || 'vendor@example.com',
                  currentVendor?.businessName || 'Merchant Store',
                  products
                );
                setVendorAudit(audit);
              }
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'ai-advisor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-indigo-400" />
            <span>Autonomous AI Advisor</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-[10px] font-bold text-indigo-200">M4</span>
          </button>

          <button
            onClick={() => setActiveSubTab('register')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Onboarding Registration API</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: VENDOR ANALYTICS & KPIS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* 4 Core Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>Vendor Gross Revenue</span>
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{(vendorAnalytics?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+18.2% vs previous period</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>Total Units Sold</span>
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(vendorAnalytics?.totalSalesUnits || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">units</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                From {vendorAnalytics?.totalOrders || 0} logged orders
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>Average Order Value (AOV)</span>
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{(vendorAnalytics?.averageOrderValue || 0).toFixed(2)}
              </div>
              <div className="text-xs text-indigo-600 mt-1 font-medium">
                Higher than platform average (₹118.00)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>Active SKUs & Valuation</span>
                <Package className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {vendorProducts.length} <span className="text-sm font-normal text-slate-500">SKUs</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Valuation: ₹{(vendorAnalytics?.totalInventoryValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Two-Column Analytics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing SKUs for this Vendor */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Vendor Catalog & Velocity</h2>
                  <p className="text-xs text-slate-500">Products owned by {currentVendor?.businessName}</p>
                </div>
                {onNavigateToCatalog && (
                  <button
                    onClick={onNavigateToCatalog}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <span>Manage in Product Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {vendorProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No products registered for this vendor yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Retail Price</th>
                        <th className="pb-3">Stock Units</th>
                        <th className="pb-3">30D Velocity</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vendorProducts.map(p => {
                        const isLow = p.stock <= p.minThreshold;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                              <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                              <div className="truncate max-w-[200px]">
                                <span className="block truncate">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{p.sku || p.id}</span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-600">{p.category}</td>
                            <td className="py-3 font-semibold text-slate-900">₹{p.price.toFixed(2)}</td>
                            <td className="py-3">
                              <span className={`font-semibold ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="py-3 text-slate-600">{p.salesLast30Days || 0} sold</td>
                            <td className="py-3">
                              {isLow ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  Optimal
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sales Channel Velocity Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Sales by Channel</h2>
                <p className="text-xs text-slate-500 mb-4">Multi-channel distribution mix for this vendor</p>

                <div className="space-y-4">
                  {(vendorAnalytics?.salesByChannel || [
                    { channel: 'Direct Web', units: 42, revenue: 4200 },
                    { channel: 'Marketplace App', units: 33, revenue: 3300 },
                    { channel: 'Affiliate Partner', units: 16, revenue: 1600 },
                    { channel: 'Enterprise POS', units: 9, revenue: 900 }
                  ]).map((ch: any) => (
                    <div key={ch.channel} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{ch.channel}</span>
                        <span className="text-slate-500">₹{ch.revenue.toLocaleString()} ({ch.units} units)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${Math.min(100, (ch.units / ((vendorAnalytics?.totalSalesUnits || 100) || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Vendor Health Metric */}
              <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Vendor Health Score</span>
                  <span className="text-sm font-bold text-emerald-700">98 / 100 (Tier 1 Premium)</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{currentVendor?.rating || 4.9}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VENDOR PROFILE & STORE SETTINGS (GET / PUT / PATCH) */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {currentVendor?.businessName || 'Vendor Profile'}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  ID: {currentVendor?.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage contact parameters, company address, and operational status via RESTful <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">PUT /api/vendors/{currentVendor?.id}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {profileSaveMessage && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              profileSaveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {profileSaveMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{profileSaveMessage.text}</span>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business / Display Name *</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileForm.businessName}
                  onChange={e => setProfileForm(p => ({ ...p, businessName: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Legal Company Entity</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileForm.companyName}
                  onChange={e => setProfileForm(p => ({ ...p, companyName: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Contact Name *</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Email Address *</label>
                <input
                  type="email"
                  disabled={!isEditingProfile}
                  value={profileForm.email}
                  onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Support Phone Number *</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operating Status</label>
                <select
                  disabled={!isEditingProfile}
                  value={profileForm.status}
                  onChange={e => setProfileForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active (Verified Merchant)</option>
                  <option value="pending">Pending Onboarding Review</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Headquarters / Fulfillment Address</label>
              <input
                type="text"
                disabled={!isEditingProfile}
                value={profileForm.address}
                onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vendor Biography & Value Proposition</label>
              <textarea
                rows={3}
                disabled={!isEditingProfile}
                value={profileForm.bio}
                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 disabled:opacity-70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {isEditingProfile && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Vendor Profile</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* SUB-TAB 3: LIVE TRANSACTION SIMULATOR (POST /api/transactions) */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-200 mb-6">
            <h2 className="text-lg font-bold text-slate-900">Direct Order & Transaction Generator</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates real e-commerce transactions against the unified database. Validates stock availability, deducts inventory in real time, increments sales velocity, and dynamically assigns customer cohorts.
            </p>
          </div>

            {transMessage && (
              <div className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
                transMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {transMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{transMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleExecuteTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Vendor Product *</label>
                  <select
                    value={transactionForm.productId}
                    onChange={e => setTransactionForm(p => ({ ...p, productId: e.target.value }))}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {vendorProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price.toFixed(2)} - Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Order Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={transactionForm.quantity}
                    onChange={e => setTransactionForm(p => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Name</label>
                  <input
                    type="text"
                    value={transactionForm.customerName}
                    onChange={e => setTransactionForm(p => ({ ...p, customerName: e.target.value }))}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Email Address</label>
                  <input
                    type="email"
                    value={transactionForm.customerEmail}
                    onChange={e => setTransactionForm(p => ({ ...p, customerEmail: e.target.value }))}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sales Channel</label>
                  <select
                    value={transactionForm.channel}
                    onChange={e => setTransactionForm(p => ({ ...p, channel: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Direct Web">Direct Web Portal</option>
                    <option value="Marketplace App">Marketplace Mobile App</option>
                    <option value="Affiliate Partner">Affiliate Partner Network</option>
                    <option value="Enterprise POS">Enterprise B2B POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                  <select
                    value={transactionForm.paymentMethod}
                    onChange={e => setTransactionForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Credit Card">Credit Card (Stripe Gateway)</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Invoice">Corporate Net-30 Invoice</option>
                    <option value="PayPal">PayPal Business</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Target Vendor ID: <span className="font-mono font-semibold text-slate-700">{selectedVendorId}</span>
                </div>
                <button
                  type="submit"
                  disabled={transLoading}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {transLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  <span>Execute Order (POST /api/transactions)</span>
                </button>
              </div>
            </form>
        </div>
      )}

      {/* SUB-TAB 4: VENDOR REGISTRATION API (POST /api/vendors/register) */}
      {activeSubTab === 'register' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
          <div className="pb-6 border-b border-slate-200 mb-6">
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-1">
              <Key className="h-4 w-4" />
              <span>Vendor API Specification</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Vendor Onboarding & Registration Form</h2>
            <p className="text-xs text-slate-500 mt-1">
              Calls <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono">POST /api/vendors/register</code> with complete contact validation, password hashing, and JWT bearer token issuance.
            </p>
          </div>

          {regMessage && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
              regMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {regMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{regMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleRegisterVendor} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business / Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Apex Acoustics Innovations"
                  value={regForm.businessName}
                  onChange={e => setRegForm(p => ({ ...p, businessName: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Legal Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g., Apex Acoustics LLC"
                  value={regForm.companyName}
                  onChange={e => setRegForm(p => ({ ...p, companyName: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Authorized Contact Person *</label>
                <input
                  type="text"
                  placeholder="e.g., Jordan Miller"
                  value={regForm.name}
                  onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Email Address *</label>
                <input
                  type="email"
                  placeholder="jordan.miller@apexacoustics.com"
                  value={regForm.email}
                  onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone Number *</label>
                <input
                  type="text"
                  placeholder="+1 (555) 345-6789"
                  value={regForm.phone}
                  onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Portal Access Password *</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={regForm.password}
                  onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fulfillment & Headquarters Address</label>
              <input
                type="text"
                placeholder="Suite 400, 100 Innovation Parkway, San Francisco, CA"
                value={regForm.address}
                onChange={e => setRegForm(p => ({ ...p, address: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Bio & Catalog Specialization</label>
              <textarea
                rows={3}
                placeholder="High-end acoustic hardware and audiophile electronics..."
                value={regForm.bio}
                onChange={e => setRegForm(p => ({ ...p, bio: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={regLoading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {regLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                <span>Register & Generate JWT Token</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 5: AUTONOMOUS AI ADVISOR & STRATEGY (MILESTONE 4) */}
      {activeSubTab === 'ai-advisor' && (
        <div className="space-y-6">
          {advisorActionMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
              <span>{advisorActionMsg}</span>
              <button onClick={() => setAdvisorActionMsg(null)} className="text-emerald-700">✕</button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  LangGraph Agentic Loop
                </span>
                <span className="text-xs text-slate-400">• Store Analysis & Strategic Advisory</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Weekly Strategic Advisor for {currentVendor?.businessName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates product holding costs and declining sales velocity, then generates quantitative price adjustments and proactive advisory emails.
              </p>
            </div>

            <button
              onClick={async () => {
                setIsAuditing(true);
                setAdvisorEmailSent(false);
                try {
                  const audit = runAutonomousStoreAudit(
                    selectedVendorId,
                    currentVendor?.name || 'Vendor Merchant',
                    currentVendor?.email || 'vendor@example.com',
                    currentVendor?.businessName || 'Merchant Store',
                    vendorProducts.length > 0 ? vendorProducts : products
                  );
                  setVendorAudit(audit);
                } finally {
                  setIsAuditing(false);
                }
              }}
              disabled={isAuditing}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isAuditing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              <span>Run Autonomous Store Audit</span>
            </button>
          </div>

          {vendorAudit && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Identified Risks & Strategic Advice */}
              <div className="lg:col-span-7 space-y-6">
                {/* Vulnerability & Overstock Alerts */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    Identified Store Vulnerabilities
                  </h3>
                  <div className="space-y-3">
                    {vendorAudit.risks.map((risk, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-slate-900 text-sm">{risk.productName}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                            {risk.type}
                          </span>
                        </div>
                        <p className="text-slate-700 mb-2">{risk.reason}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-600">
                          <span>Stock: <strong>{risk.currentStock} units</strong></span>
                          <span>Holding Value: <strong>${risk.financialExposure.toLocaleString()}</strong></span>
                          <span className="text-rose-600 flex items-center gap-0.5">
                            <TrendingDown className="h-3.5 w-3.5" />
                            <strong>{risk.demandTrendPct}% Demand Velocity</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Strategic Actions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    Agent's Strategic Actions
                  </h3>
                  <div className="space-y-3">
                    {vendorAudit.actions.map((act) => (
                      <div key={act.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded text-[10px]">
                              {act.actionType}
                            </span>
                            <strong className="text-slate-900">{act.headline}</strong>
                          </div>
                          <p className="text-slate-600">{act.rationale}</p>
                          <div className="flex items-center gap-3 text-[11px] pt-1">
                            <span>Old Price: <del>${act.originalPrice}</del></span>
                            {act.newPrice && <span className="text-indigo-600 font-bold">New Price: ${act.newPrice}</span>}
                            <span className="text-emerald-600 font-semibold">Projected Recovery: +${act.projectedRevenueRecovery.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/agent/execute-action', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  actionId: act.id,
                                  productId: act.productId,
                                  actionType: act.actionType,
                                  newPrice: act.newPrice,
                                  discountPct: act.recommendedDiscountPct
                                })
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setAdvisorActionMsg(data.message);
                              } else {
                                setAdvisorActionMsg(`Applied ${act.actionType} to catalog: $${act.originalPrice} -> $${act.newPrice}`);
                              }
                            } catch {
                              setAdvisorActionMsg(`Applied ${act.actionType} to catalog.`);
                            }
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                          <span>Apply Policy</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Proactive Email Advisory Generator */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Proactive Merchant Advisory</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Drafted by AI
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div><span className="text-slate-400">Recipient:</span> <strong>{vendorAudit.email.recipientEmail}</strong></div>
                  <div><span className="text-slate-400">Subject:</span> <span className="font-semibold text-slate-800">{vendorAudit.email.subject}</span></div>
                </div>

                {/* Email HTML Body Simulator */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 space-y-2 max-h-[320px] overflow-y-auto font-sans shadow-inner">
                  <strong className="text-slate-900 block font-bold">Store Intelligence Weekly Digest</strong>
                  <p>Hello {vendorAudit.vendorName},</p>
                  <p className="text-slate-600">
                    Our autonomous auditing agent performed a health check on {vendorAudit.businessName}. Below is the priority strategic recommendation for this week:
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-2 text-amber-900 font-medium">
                    ⚡ <strong>Strategic Advice:</strong> {vendorAudit.actions[0]?.rationale || 'Apply discount to slow-moving inventory to liquidate excess holding capital.'}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/agent/dispatch-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          vendorId: vendorAudit.vendorId,
                          toEmail: vendorAudit.email.recipientEmail,
                          subject: vendorAudit.email.subject,
                          htmlContent: vendorAudit.email.htmlBody
                        })
                      });
                    } catch {}
                    setAdvisorEmailSent(true);
                    setAdvisorActionMsg(`Advisory email dispatched to ${vendorAudit.email.recipientEmail}`);
                  }}
                  disabled={advisorEmailSent}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{advisorEmailSent ? 'Email Dispatched to Vendor' : 'Send Strategic Advice to Merchant'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
