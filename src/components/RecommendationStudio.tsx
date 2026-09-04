import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Cpu, 
  Sliders, 
  Search, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Database,
  ExternalLink,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { Product } from '../types';
import { getRuleBasedRecommendations, getVectorSearchRecommendations } from '../utils/vectorEngine';

interface RecommendationStudioProps {
  products: Product[];
}

const SAMPLE_SEARCH_INTENTS = [
  'ergonomic lumbar comfort for 8-hour desk work',
  'audiophile sound with active noise reduction for air travel',
  'lightweight gear for outdoor hiking and hydration',
  'luxury automatic mechanical timepieces'
];

export const RecommendationStudio: React.FC<RecommendationStudioProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-001');
  const [searchQuery, setSearchQuery] = useState('ergonomic lumbar comfort for 8-hour desk work');

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Rule-Based Recommendations (Milestone 2 Base)
  const ruleRecommendations = activeProduct ? getRuleBasedRecommendations(activeProduct, products, 3) : [];

  // Vector Search Recommendations (Milestone 2 Advanced)
  const vectorRecommendations = getVectorSearchRecommendations(searchQuery || activeProduct, products, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Recommendation Systems: Rule-Based vs. Vector AI</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Milestone 2 Base & Adv
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare category-based rules against high-dimensional dense vector embeddings & pgvector semantic similarity.
          </p>
        </div>
      </div>

      {/* Interactive Semantic Intent Search Explorer */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/50 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              Semantic Vector Embedding Search (pgvector Engine)
            </h3>
          </div>
          <span className="text-[11px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full font-mono">
            Cosine Similarity Metric: cos(θ) = A·B / (||A|| ||B||)
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Type any natural-language customer intent or click a sample query below to test how dense vector embeddings map semantic concepts rather than literal keyword matches:
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g., quiet wireless audio for long flights..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Preset quick test queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-indigo-300 font-semibold uppercase mr-1">Quick Intent Prompts:</span>
          {SAMPLE_SEARCH_INTENTS.map((intent, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(intent)}
              className="text-[11px] bg-slate-800/80 hover:bg-indigo-600/80 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              "{intent}"
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Engine Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Rule-Based System */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">1. Rule-Based Engine (Base Requirement)</h3>
                <p className="text-[11px] text-slate-500">Fixed rules: "Top selling in category" & cross-sell triggers</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              Rule Logic
            </span>
          </div>

          {/* Active Product Pivot */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="h-10 w-10 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] text-slate-400 block">Anchor Product:</span>
                <span className="font-bold text-slate-900">{activeProduct.name}</span>
              </div>
            </div>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name.slice(0, 24)}...</option>
              ))}
            </select>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {ruleRecommendations.map(item => (
              <div key={item.product.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex gap-3 items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate">{item.product.name}</span>
                    <span className="font-bold text-slate-900 ml-2">${item.product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mb-1.5">{item.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.matchAttributes?.map((attr, i) => (
                      <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Vector Search Engine */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">2. Vector Search Engine (Advanced Feature)</h3>
                <p className="text-[11px] text-slate-500">Semantic cosine similarity over dense vector embeddings</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
              pgvector DB
            </span>
          </div>

          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Active User Query Vector:</span>
              <span className="font-mono text-[10px]">8-dimensional normalized embedding</span>
            </div>
            <p className="text-[11px] text-indigo-800 font-mono italic truncate">
              "{searchQuery}"
            </p>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {vectorRecommendations.map(item => (
              <div key={item.product.id} className="p-3.5 bg-white rounded-xl border border-indigo-200/80 shadow-xs flex gap-3 items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate">{item.product.name}</span>
                    <span className="font-bold text-indigo-600 ml-2">{item.score}% Match</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mb-1.5">{item.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.matchAttributes?.map((attr, i) => (
                      <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vector Embeddings Visualizer Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Vector Embedding Index Table (pgvector Simulator)</h3>
          </div>
          <span className="text-xs text-slate-400">Cosine Distance Index (IVFFlat)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Embedding Vector (Dimensions 1-8)</th>
                <th className="py-2.5 px-3">Vector Norm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{p.name}</td>
                  <td className="py-2.5 px-3 font-sans">{p.category}</td>
                  <td className="py-2.5 px-3 text-indigo-600">
                    [{p.vectorEmbedding?.map(v => v.toFixed(2)).join(', ') || '0.50, 0.50, ...'}]
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-bold">1.00 (L2 Norm)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
