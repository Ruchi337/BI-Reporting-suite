import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  Activity, 
  Database, 
  Cpu, 
  Zap, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Code2, 
  FileText, 
  RotateCcw,
  Send,
  Eye,
  Radio,
  BarChart3,
  Store
} from 'lucide-react';
import { 
  AdminSystemOverview, 
  AdminSystemLog, 
  AdminOrder, 
  ApiEndpointMetadata,
  Product,
  Customer,
  Vendor
} from '../types';

interface AdminDashboardProps {
  onSyncProducts?: (products: Product[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSyncProducts }) => {
  // Navigation inside Admin Panel
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'api-tester' | 'database' | 'orders' | 'logs' | 'realtime'>('overview');

  // Backend state
  const [overview, setOverview] = useState<AdminSystemOverview | null>(null);
  const [endpoints, setEndpoints] = useState<ApiEndpointMetadata[]>([]);
  const [logs, setLogs] = useState<AdminSystemLog[]>([]);
  const [backendProducts, setBackendProducts] = useState<Product[]>([]);
  const [backendOrders, setBackendOrders] = useState<AdminOrder[]>([]);
  const [backendCustomers, setBackendCustomers] = useState<Customer[]>([]);
  const [backendVendors, setBackendVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // API Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointMetadata | null>(null);
  const [requestPayload, setRequestPayload] = useState<string>('{}');
  const [testResult, setTestResult] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    response: any;
    timestamp: string;
  } | null>(null);
  const [executingApi, setExecutingApi] = useState<boolean>(false);

  // Database manager state
  const [dbSearch, setDbSearch] = useState<string>('');
  const [dbCategoryFilter, setDbCategoryFilter] = useState<string>('all');
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Electronics',
    price: 99.99,
    cost: 45.00,
    stock: 25,
    minThreshold: 15,
    leadTimeDays: 7,
    supplier: 'Global Supply Logistics',
    description: ''
  });

  // Order manager state
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Real-time stream state
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamEvents, setStreamEvents] = useState<any[]>([]);

  // Show temporary toast message
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Fetch all backend data simultaneously
  const fetchAllBackendData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [
        overviewRes, 
        endpointsRes, 
        logsRes, 
        productsRes, 
        ordersRes, 
        customersRes,
        vendorsRes
      ] = await Promise.all([
        fetch('/api/admin/overview').then(r => r.json()),
        fetch('/api/admin/endpoints').then(r => r.json()),
        fetch('/api/admin/system-logs').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/customers').then(r => r.json()),
        fetch('/api/vendors').then(r => r.json())
      ]);

      if (overviewRes) setOverview(overviewRes);
      if (endpointsRes?.endpoints) {
        setEndpoints(endpointsRes.endpoints);
        if (!selectedEndpoint && endpointsRes.endpoints.length > 0) {
          setSelectedEndpoint(endpointsRes.endpoints[0]);
          setRequestPayload(JSON.stringify(endpointsRes.endpoints[0].defaultPayload || {}, null, 2));
        }
      }
      if (logsRes?.logs) setLogs(logsRes.logs);
      if (productsRes?.data) {
        setBackendProducts(productsRes.data);
        if (onSyncProducts) {
          onSyncProducts(productsRes.data);
        }
      }
      if (ordersRes?.orders) setBackendOrders(ordersRes.orders);
      if (customersRes?.customers) setBackendCustomers(customersRes.customers);
      if (vendorsRes?.vendors) setBackendVendors(vendorsRes.vendors);
    } catch (err: any) {
      console.error('Error fetching backend data in admin dashboard:', err);
      showToast('Failed to fetch some backend services. Ensure server is running.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onSyncProducts, selectedEndpoint]);

  // Initial load
  useEffect(() => {
    fetchAllBackendData();
    const interval = setInterval(() => {
      fetchAllBackendData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchAllBackendData]);

  // Real-time live poll
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/realtime/sales-feed');
        const json = await res.json();
        if (json?.event) {
          setStreamEvents(prev => [json.event, ...prev.slice(0, 19)]);
        }
      } catch (e) {
        // silent fail in background
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Execute selected API in the playground
  const handleExecuteApiTest = async () => {
    if (!selectedEndpoint) return;
    setExecutingApi(true);
    const start = performance.now();

    try {
      let options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') {
        try {
          options.body = requestPayload ? JSON.stringify(JSON.parse(requestPayload)) : '{}';
        } catch (e) {
          showToast('Invalid JSON in request payload', 'error');
          setExecutingApi(false);
          return;
        }
      }

      const res = await fetch(selectedEndpoint.path, options);
      const durationMs = Math.round(performance.now() - start);
      let responseBody: any;
      try {
        responseBody = await res.json();
      } catch {
        responseBody = { text: await res.text() };
      }

      setTestResult({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        durationMs,
        response: responseBody,
        timestamp: new Date().toLocaleTimeString()
      });

      // Refresh overview and logs after test execution
      fetchAllBackendData(true);
      showToast(`Executed ${selectedEndpoint.method} ${selectedEndpoint.path} in ${durationMs}ms`, res.ok ? 'success' : 'error');
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      setTestResult({
        status: 500,
        statusText: 'Network / Client Error',
        durationMs,
        response: { error: err.message || 'Request failed' },
        timestamp: new Date().toLocaleTimeString()
      });
      showToast(`Execution failed: ${err.message}`, 'error');
    } finally {
      setExecutingApi(false);
    }
  };

  // Select endpoint for testing
  const handleSelectEndpoint = (ep: ApiEndpointMetadata) => {
    setSelectedEndpoint(ep);
    setRequestPayload(JSON.stringify(ep.defaultPayload || {}, null, 2));
    setTestResult(null);
  };

  // Re-seed Database from Admin
  const handleReseedDatabase = async () => {
    if (!window.confirm('Reset all in-memory database collections to default factory records?')) return;
    try {
      const res = await fetch('/api/admin/database/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Database reset and factory records re-seeded successfully!', 'success');
        fetchAllBackendData();
      }
    } catch (e: any) {
      showToast(`Error seeding database: ${e.message}`, 'error');
    }
  };

  // Clear system logs
  const handleClearLogs = async () => {
    try {
      await fetch('/api/admin/system-logs', { method: 'DELETE' });
      setLogs([]);
      showToast('System audit logs cleared.', 'info');
    } catch (e: any) {
      showToast('Failed to clear logs.', 'error');
    }
  };

  // Create new product in backend
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductForm)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Product '${newProductForm.name}' created in backend!`, 'success');
        setShowAddProductModal(false);
        setNewProductForm({
          name: '',
          category: 'Electronics',
          price: 99.99,
          cost: 45.00,
          stock: 25,
          minThreshold: 15,
          leadTimeDays: 7,
          supplier: 'Global Supply Logistics',
          description: ''
        });
        fetchAllBackendData();
      } else {
        showToast(json.error || 'Failed to create product', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Delete product from backend
  const handleDeleteBackendProduct = async (id: string, name: string) => {
    if (!window.confirm(`Delete '${name}' (${id}) from backend database?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Product ${id} deleted successfully.`, 'success');
        fetchAllBackendData();
      }
    } catch (e: any) {
      showToast(`Error deleting product: ${e.message}`, 'error');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Order status updated to ${status}`, 'success');
        fetchAllBackendData(true);
      }
    } catch (e: any) {
      showToast(`Error updating order: ${e.message}`, 'error');
    }
  };

  // Filtered products
  const filteredProducts = backendProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(dbSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(dbSearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(dbSearch.toLowerCase()) ||
                          p.sku?.toLowerCase().includes(dbSearch.toLowerCase());
    const matchesCategory = dbCategoryFilter === 'all' || p.category === dbCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered orders
  const filteredOrders = backendOrders.filter(o => {
    return orderFilterStatus === 'all' || o.status === orderFilterStatus;
  });

  // Categories list
  const categories = Array.from(new Set(backendProducts.map(p => p.category)));

  if (loading && !overview) {
    return (
      <div id="admin-dashboard-loading" className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Connecting to ShopSense Intelligence backend server...</p>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-400">
                <Server className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  ShopSense Admin Control Center
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-normal">
                    LIVE SYSTEM
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time backend telemetry, API endpoint runner, database collections, and GenAI services
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats & Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="admin-btn-refresh"
              onClick={() => fetchAllBackendData()}
              disabled={refreshing}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh All'}</span>
            </button>

            <button
              id="admin-btn-reseed"
              onClick={handleReseedDatabase}
              className="flex items-center space-x-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs px-3.5 py-2 rounded-lg border border-amber-500/30 transition shadow-sm"
              title="Reset backend in-memory database to initial state"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Factory Seed DB</span>
            </button>
          </div>
        </div>


      </div>

      {/* Toast Alert */}
      {actionMessage && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : actionMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
        }`}>
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            {actionMessage.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-600" />}
            {actionMessage.type === 'info' && <Activity className="h-4 w-4 text-indigo-600" />}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Admin Sub-Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-sm p-1.5 flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'System Overview & Routes', icon: Server, badge: `${endpoints.length} APIs` },
          { id: 'api-tester', label: 'Interactive API Runner', icon: Play, badge: 'Live Test' },
          { id: 'database', label: 'Products Collection (CRUD)', icon: Database, badge: `${backendProducts.length}` },
          { id: 'orders', label: 'Orders & Transactions', icon: ShoppingBag, badge: `${backendOrders.length}` },
          { id: 'logs', label: 'Server Audit Logs', icon: Terminal, badge: `${logs.length}` },
          { id: 'realtime', label: 'Live Stream Telemetry', icon: Radio, badge: isStreaming ? 'Streaming' : 'Paused' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setAdminSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SYSTEM OVERVIEW & BACKEND ROUTES LIST */}
      {/* ========================================================================= */}
      {adminSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Backend Endpoints Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  All Registered Backend API Endpoints ({endpoints.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Complete registry of all live microservices, GenAI routes, analytics feeds, and CRUD endpoints
                </p>
              </div>
              <button
                onClick={() => setAdminSubTab('api-tester')}
                className="inline-flex items-center space-x-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Open API Playground</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3">Service Name & Description</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {endpoints.map((ep) => (
                    <tr key={ep.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          ep.category === 'AI & GenAI' 
                            ? 'bg-purple-100 text-purple-700' 
                            : ep.category === 'Analytics & BI'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.category === 'Inventory & Catalog'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ep.category === 'Real-Time'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ep.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          ep.method === 'GET' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : ep.method === 'POST'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : ep.method === 'PUT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {ep.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-900 font-semibold">
                        {ep.path}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{ep.name}</div>
                        <div className="text-[11px] text-slate-500">{ep.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            handleSelectEndpoint(ep);
                            setAdminSubTab('api-tester');
                          }}
                          className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded transition border border-indigo-100"
                        >
                          <Play className="h-3 w-3" />
                          <span>Test Endpoint</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: INTERACTIVE API RUNNER / PLAYGROUND */}
      {/* ========================================================================= */}
      {adminSubTab === 'api-tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Endpoint Selector */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-600" />
              Select Backend Endpoint
            </h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {endpoints.map(ep => {
                const isSelected = selectedEndpoint?.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition border flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                        ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800' :
                        ep.method === 'POST' ? 'bg-indigo-100 text-indigo-800' :
                        ep.method === 'PUT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-[10px] text-slate-400">{ep.category}</span>
                    </div>
                    <span className="font-semibold text-slate-900 truncate">{ep.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate">{ep.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Request & Response Inspector */}
          <div className="lg:col-span-8 space-y-4">
            {selectedEndpoint ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        selectedEndpoint.method === 'GET' ? 'bg-emerald-100 text-emerald-800' :
                        selectedEndpoint.method === 'POST' ? 'bg-indigo-100 text-indigo-800' :
                        selectedEndpoint.method === 'PUT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedEndpoint.method}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {selectedEndpoint.path}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{selectedEndpoint.description}</p>
                  </div>

                  <button
                    id="admin-btn-execute-api"
                    onClick={handleExecuteApiTest}
                    disabled={executingApi}
                    className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow transition disabled:opacity-50"
                  >
                    {executingApi ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{executingApi ? 'Executing Request...' : 'Send Request'}</span>
                  </button>
                </div>

                {/* Request Payload Area (for POST/PUT) */}
                {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                      <span>Request JSON Body:</span>
                      <button
                        onClick={() => setRequestPayload(JSON.stringify(selectedEndpoint.defaultPayload || {}, null, 2))}
                        className="text-[11px] text-indigo-600 hover:underline"
                      >
                        Reset Sample Payload
                      </button>
                    </div>
                    <textarea
                      value={requestPayload}
                      onChange={(e) => setRequestPayload(e.target.value)}
                      rows={7}
                      className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="{}"
                    />
                  </div>
                )}

                {/* Live Response Panel */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-slate-600" />
                      Live Response Inspector
                    </span>
                    {testResult && (
                      <div className="flex items-center space-x-3 text-xs">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          testResult.status >= 200 && testResult.status < 300 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          HTTP {testResult.status} {testResult.statusText}
                        </span>
                        <span className="text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {testResult.durationMs} ms
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {testResult.timestamp}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800">
                    {testResult ? (
                      <pre>{JSON.stringify(testResult.response, null, 2)}</pre>
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center justify-center py-10 space-y-2">
                        <Play className="h-6 w-6 text-slate-600" />
                        <p>Click "Send Request" to trigger this backend endpoint and inspect the live JSON payload.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                Select an endpoint from the left column to test.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: DATABASE PRODUCTS MANAGER (CRUD) */}
      {/* ========================================================================= */}
      {adminSubTab === 'database' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by SKU, Name, or Category..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={dbCategoryFilter}
                onChange={(e) => setDbCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories ({backendProducts.length})</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center space-x-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product Record</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price / Cost</th>
                    <th className="px-4 py-3">Stock & Threshold</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock <= (p.minThreshold || 15);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60'} 
                              alt={p.name} 
                              className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{p.name}</div>
                              <div className="text-[10px] font-mono text-slate-500">ID: {p.id} • SKU: {p.sku || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">${p.price.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">Cost: ${p.cost?.toFixed(2) || (p.price * 0.45).toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                              {p.stock} units
                            </span>
                            {isLow && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                                LOW
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">Min: {p.minThreshold} • Lead: {p.leadTimeDays || 7}d</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {p.supplier || 'Direct Supply'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                const newStock = prompt(`Update stock quantity for ${p.name}:`, String(p.stock));
                                if (newStock !== null && !isNaN(Number(newStock))) {
                                  fetch(`/api/products/${p.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ stock: Number(newStock) })
                                  }).then(() => {
                                    showToast(`Stock updated to ${newStock}`, 'success');
                                    fetchAllBackendData(true);
                                  });
                                }
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100"
                              title="Quick Stock Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteBackendProduct(p.id, p.name)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Insert Product into Backend Database</h3>
                  <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4 mt-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      placeholder="e.g. Aerolite Wireless Mechanical Keyboard"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={newProductForm.category}
                        onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Retail Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProductForm.price}
                        onChange={(e) => setNewProductForm({ ...newProductForm, price: parseFloat(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Unit Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProductForm.cost}
                        onChange={(e) => setNewProductForm({ ...newProductForm, cost: parseFloat(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={newProductForm.stock}
                        onChange={(e) => setNewProductForm({ ...newProductForm, stock: parseInt(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Min Threshold</label>
                      <input
                        type="number"
                        value={newProductForm.minThreshold}
                        onChange={(e) => setNewProductForm({ ...newProductForm, minThreshold: parseInt(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Supplier Name</label>
                    <input
                      type="text"
                      value={newProductForm.supplier}
                      onChange={(e) => setNewProductForm({ ...newProductForm, supplier: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow"
                    >
                      Insert Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: ORDERS & TRANSACTIONS */}
      {/* ========================================================================= */}
      {adminSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend Order Records & Transaction Hub</h3>
              <p className="text-xs text-slate-500">Live order state management across all enterprise channels</p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses ({backendOrders.length})</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={async () => {
                  const randomPrice = (Math.random() * 200 + 40).toFixed(2);
                  await fetch('/api/admin/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      customerName: 'Enterprise VIP Client',
                      customerEmail: 'vip.client@enterprise.com',
                      productName: 'AeroPulse Pro Headphones',
                      amount: Number(randomPrice),
                      units: 1,
                      channel: 'Direct Web',
                      paymentMethod: 'Credit Card'
                    })
                  });
                  showToast('New test order created in backend!', 'success');
                  fetchAllBackendData(true);
                }}
                className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Simulate Order</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Order Number</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product / Items</th>
                    <th className="px-4 py-3">Amount / Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                        <div className="text-[10px] text-slate-400 font-normal font-sans">
                          {new Date(ord.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-500">{ord.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{ord.productName}</div>
                        <div className="text-[10px] text-slate-400">{ord.units} unit(s) • {ord.category}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">${ord.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">{ord.channel} • {ord.paymentMethod}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: SYSTEM AUDIT LOGS */}
      {/* ========================================================================= */}
      {adminSubTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-600" />
                Backend Request & System Audit Trail ({logs.length})
              </h3>
              <p className="text-xs text-slate-500">Live inspection of all HTTP API requests, status codes, and execution latencies</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchAllBackendData(true)}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                title="Refresh Logs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleClearLogs}
                className="text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded border border-rose-200 transition"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="bg-slate-950 text-slate-200 font-mono text-xs rounded-xl p-4 overflow-x-auto max-h-[500px] divide-y divide-slate-800/60 space-y-2">
              {logs.length > 0 ? (
                logs.map(l => (
                  <div key={l.id} className="pt-2 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        l.level === 'error' ? 'bg-rose-900 text-rose-300' :
                        l.level === 'warn' ? 'bg-amber-900 text-amber-300' :
                        l.level === 'success' ? 'bg-emerald-900 text-emerald-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {l.method}
                      </span>
                      <span className="text-slate-400 text-[11px]">{l.endpoint}</span>
                      <span className="text-slate-200">{l.message}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 whitespace-nowrap">
                      <span className={l.statusCode >= 400 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {l.statusCode}
                      </span>
                      <span>{l.latencyMs}ms</span>
                      <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-center py-6">No logs in current session.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: LIVE REAL-TIME TELEMETRY STREAM */}
      {/* ========================================================================= */}
      {adminSubTab === 'realtime' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`h-3 w-3 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Backend WebSocket / Event Poller</h3>
                <p className="text-xs text-slate-500">Continuous feed of transactions generated by the backend engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                isStreaming ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-emerald-600 text-white'
              }`}
            >
              {isStreaming ? 'Pause Stream' : 'Resume Stream'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {streamEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-indigo-600">{evt.orderNumber}</span>
                  <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>
                <div className="font-semibold text-slate-900 text-sm truncate">{evt.productName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{evt.customerName} • {evt.channel}</div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">${evt.amount.toFixed(2)}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {evt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
