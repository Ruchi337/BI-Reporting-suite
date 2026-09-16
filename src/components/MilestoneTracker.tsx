import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  MessageSquareHeart, 
  Database, 
  ArrowRight,
  Eye,
  Brain,
  Sliders,
  Cpu,
  Radio,
  Bot,
  Container,
  GitBranch,
  FileText,
  TestTube2
} from 'lucide-react';

interface MilestoneTrackerProps {
  onNavigate: (tab: string) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Milestone Overview Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Project Specification Matrix</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              E-Commerce Intelligence & AI Architecture
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Complete end-to-end implementation across all 4 Milestones: GenAI & Vision (W1-2), Forecasting & Segmentation (W3-4), BI Reporting (W5-6), and Optimization, Testing & Deployment (W7-8).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-center">
              <span className="text-xs text-emerald-400 font-medium block">All 4 Milestones</span>
              <span className="text-lg font-bold text-emerald-300">100% Implemented</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Milestone 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Milestone 1
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Implemented
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Marketplace Foundation & Vendor Analytics</h2>
            <p className="text-xs text-slate-500 mb-4">Weeks 1-2 • Unified DB, Vendors, Auth & GenAI Engine</p>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Marketplace Schema & Vendors DB:</strong> Unified relational in-memory schema connecting Vendors, Products, Orders, and Customers with foreign key integrity.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Vendor Management & JWT Auth:</strong> Complete CRUD (<code className="bg-slate-100 px-1 rounded text-indigo-700">/api/vendors</code>), Registration, password hashing, and role-based access control.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Vendor Analytics & KPIs:</strong> Sales, revenue trends, inventory valuation, and multi-channel velocity breakdown per merchant.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">GenAI & Vision Studio:</strong> Gemini 3.7 Flash automated product descriptions and image recognition categorization.
                </span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              onClick={() => onNavigate('vendors')}
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors"
            >
              <span>Vendor Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors"
            >
              <span>Vision Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Milestone 2 */}
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
            Core Target
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Milestone 2
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Base & Adv Active
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Inventory Intelligence & Customer Analytics</h2>
            <p className="text-xs text-slate-500 mb-4">Weeks 3-4 • Analytics, Forecasting & Behavior</p>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  ✅ Base Requirements:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Inventory tracking APIs & low-stock alerts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>SQL-based customer segmentation (Spend/RFM)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Rule-based recommendation system</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Analytical validation against historical data</span>
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                  🚀 Advanced / Optional Features:
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-950">
                  <li className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span><strong>ML Forecasting:</strong> Time-series Holt-Winters/ARIMA predictions</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MessageSquareHeart className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                    <span><strong>LLM Review Sentiment:</strong> Pros/cons & vendor score</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                    <span><strong>Vector Search:</strong> Dense embeddings & pgvector semantic matches</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              onClick={() => onNavigate('inventory')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors text-center"
            >
              Inventory & ML
            </button>
            <button
              onClick={() => onNavigate('customers')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors text-center"
            >
              Customer SQL
            </button>
          </div>
        </div>

        {/* Milestone 3 */}
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
            Completed
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Milestone 3
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Base & Adv 100%
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Advanced APIs & BI Reporting</h2>
            <p className="text-xs text-slate-500 mb-4">Weeks 5-6 • Reporting Infrastructure & BI</p>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  ✅ Base Requirements:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Analytics endpoints formatted for frontend charts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Marketplace benchmarking (Vendor vs Market Avg)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Multi-dataset CSV & JSON data export</span>
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                  🚀 Advanced / Optional Features:
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-950">
                  <li className="flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Real-Time Dashboards:</strong> WebSockets / Push sales stream</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                    <span><strong>RAG AI Shopping Assistant:</strong> Grounded catalog chatbot</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span><strong>AI Data Analyst:</strong> Text-to-SQL query generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <button
              onClick={() => onNavigate('bi')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-2 rounded-xl transition-colors text-center"
            >
              BI Dashboard
            </button>
            <button
              onClick={() => onNavigate('shopping-assistant')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-2 rounded-xl transition-colors text-center"
            >
              RAG Shopping
            </button>
            <button
              onClick={() => onNavigate('data-analyst')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-2 rounded-xl transition-colors text-center"
            >
              AI Analyst
            </button>
          </div>
        </div>

        {/* Milestone 4: Optimization, Testing & Deployment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Milestone 4
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Base & Adv 100%
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Testing & Deployment</h2>
            <p className="text-xs text-slate-500 mb-4">Weeks 7-8 • Production & AI Agent</p>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  ✅ Base Requirements:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <Container className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span><strong>Docker Packaging:</strong> Multi-stage Dockerfile & compose</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span><strong>OpenAPI & Swagger:</strong> Schema specs & interactive docs</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <TestTube2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span><strong>API Unit Tests:</strong> Node test suite with assertions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                  🚀 Advanced / Optional Features:
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-950">
                  <li className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Autonomous AI Agent:</strong> Weekly audit & strategic email</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Cloud Deployment:</strong> AWS RDS, Render, Heroku</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                    <span><strong>CI/CD Pipelines:</strong> GitHub Actions lint, test & build</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              onClick={() => onNavigate('milestone4')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-2 rounded-xl transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI Agent Hub</span>
            </button>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-2 rounded-xl transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Swagger UI</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
