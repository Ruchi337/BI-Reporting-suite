import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/AdminDashboard';
import { MilestoneTracker } from './components/MilestoneTracker';
import { VendorPortal } from './components/VendorPortal';
import { ProductCatalog } from './components/ProductCatalog';
import { InventoryIntelligence } from './components/InventoryIntelligence';
import { CustomerAnalytics } from './components/CustomerAnalytics';
import { ReviewSentiment } from './components/ReviewSentiment';
import { RecommendationStudio } from './components/RecommendationStudio';
import { BiReporting } from './components/BiReporting';
import { AIShoppingAssistant } from './components/AIShoppingAssistant';
import { AIDataAnalyst } from './components/AIDataAnalyst';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from './mockData';
import { Product } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('admin');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [selectedProductIdForForecast, setSelectedProductIdForForecast] = useState<string>('prod-001');

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const handleSelectProductForForecasting = (product: Product) => {
    setSelectedProductIdForForecast(product.id);
    setActiveTab('inventory');
  };

  const lowStockCount = products.filter(p => p.stock <= p.minThreshold).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
      />

      {/* Main Content & Page Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'admin' && (
            <AdminDashboard onSyncProducts={setProducts} />
          )}

        {activeTab === 'roadmap' && (
          <MilestoneTracker onNavigate={tab => setActiveTab(tab)} />
        )}

        {activeTab === 'vendors' && (
          <VendorPortal 
            products={products}
            onAddProduct={handleAddProduct}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onSelectProductForForecasting={handleSelectProductForForecasting}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryIntelligence
            products={products}
            onUpdateStock={handleUpdateStock}
            selectedProductId={selectedProductIdForForecast}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerAnalytics customers={customers} />
        )}

        {activeTab === 'sentiment' && (
          <ReviewSentiment products={products} />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationStudio products={products} />
        )}

        {activeTab === 'bi' && (
          <BiReporting products={products} customers={customers} />
        )}

        {activeTab === 'shopping-assistant' && (
          <AIShoppingAssistant products={products} />
        )}

        {activeTab === 'data-analyst' && (
          <AIDataAnalyst />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">ShopSense Intelligence Suite</span>
            <span>•</span>
            <span>Milestone 1, 2 & 3 Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Gemini 3.7 Flash</span>
            <span>Vision API</span>
            <span>pgvector Simulator</span>
            <span>Holt-Winters ML</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
