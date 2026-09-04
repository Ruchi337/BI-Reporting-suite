import React, { useState } from 'react';
import { 
  Sparkles, 
  Package, 
  TrendingUp, 
  Users, 
  MessageSquareHeart, 
  Compass, 
  Database,
  Layers,
  Server,
  Bot,
  BarChart3,
  Store,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
}

interface NavSection {
  title?: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    alert?: string;
    isHighlight?: boolean;
    description?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      items: [
        { 
          id: 'admin', 
          label: 'Admin Hub', 
          icon: Server, 
          badge: 'Live Stack', 
          isHighlight: true,
          description: 'API telemetry & system health'
        },
        { 
          id: 'roadmap', 
          label: 'Milestones Map', 
          icon: Layers, 
          badge: 'Roadmap',
          description: 'Architecture & deliverables'
        },
      ]
    },
    {
      items: [
        { 
          id: 'vendors', 
          label: 'Vendor Hub & Portal', 
          icon: Store, 
          badge: 'Portal',
          description: 'Merchant onboarding & KPIs'
        },
        { 
          id: 'catalog', 
          label: 'Product & Vision AI', 
          icon: Package, 
          badge: 'Vision AI',
          description: 'Image recognition & copy generation'
        },
        { 
          id: 'inventory', 
          label: 'Inventory & Forecast', 
          icon: TrendingUp, 
          badge: 'Forecasting', 
          alert: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          description: 'Holt-Winters demand forecasting'
        },
        { 
          id: 'customers', 
          label: 'Customer Segments', 
          icon: Users, 
          badge: 'RFM',
          description: 'RFM customer segmentation'
        },
        { 
          id: 'sentiment', 
          label: 'Review Sentiment', 
          icon: MessageSquareHeart, 
          badge: 'NLP',
          description: 'NLP sentiment & aspect analysis'
        },
        { 
          id: 'recommendations', 
          label: 'Vector AI Engine', 
          icon: Compass, 
          badge: 'pgvector',
          description: 'Semantic pgvector recommendations'
        },
      ]
    },
    {
      items: [
        { 
          id: 'bi', 
          label: 'BI Reporting Suite', 
          icon: Database, 
          badge: 'Reporting',
          description: 'Executive GMV, RFC-4180 CSV export'
        },
        { 
          id: 'shopping-assistant', 
          label: 'RAG Shopping AI', 
          icon: Bot, 
          badge: 'RAG',
          description: 'Grounded product recommendation assistant'
        },
        { 
          id: 'data-analyst', 
          label: 'AI Data Analyst', 
          icon: BarChart3, 
          badge: 'Text-to-SQL',
          description: 'Read-only text-to-SQL business agent'
        },
      ]
    }
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight truncate">
                ShopSense
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">
                v3.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Intelligence & BI Suite
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections & Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section, idx) => (
          <div key={idx} className={`space-y-1 ${idx > 0 ? 'pt-3 border-t border-slate-800/60' : ''}`}>
            {section.title && (
              <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
            )}

            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {item.alert ? (
                      <span className="bg-amber-400 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                        {item.alert}
                      </span>
                    ) : item.badge ? (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isActive 
                          ? 'bg-indigo-700/80 text-indigo-100' 
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}

                    <ChevronRight className={`h-3 w-3 opacity-0 -translate-x-1 transition-all ${
                      isActive ? 'opacity-100 translate-x-0 text-white' : 'group-hover:opacity-60 group-hover:translate-x-0'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar (visible on screens < lg) */}
      <div className="lg:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">ShopSense</div>
            <div className="text-[10px] text-slate-400">Intelligence Suite</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 shadow-2xl z-10">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Close Navigation Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar (visible on lg: screens) */}
      <aside 
        id="desktop-left-sidebar" 
        className="hidden lg:flex lg:flex-col w-64 xl:w-72 bg-slate-900 border-r border-slate-800 min-h-screen sticky top-0 h-screen shrink-0 z-30 select-none"
      >
        {renderNavContent()}
      </aside>
    </>
  );
};
