import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle, 
  Search, 
  ChevronRight, 
  RefreshCw, 
  DollarSign, 
  Tag, 
  SlidersHorizontal,
  User
} from 'lucide-react';
import { Product, RagShoppingResponse, RagProductCitation } from '../types';

interface AIShoppingAssistantProps {
  products: Product[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  retrievedProducts?: RagProductCitation[];
  comparisonSummary?: string;
  suggestedFollowUps?: string[];
}

const STARTER_PROMPTS = [
  "What's the best laptop or workstation setup for video editing under $1000?",
  "Show me affordable products for gaming with high ratings.",
  "Which audio product has the best overall value and battery life?",
  "Recommend ergonomic items from my catalog for home office under $500."
];

export const AIShoppingAssistant: React.FC<AIShoppingAssistantProps> = ({ products }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content: "👋 Hello! I am your **RAG-Powered AI Shopping Assistant**. I index our live product catalog in real-time to match you with authentic products, accurate prices, and tailored feature comparisons. What are you looking for today?",
      timestamp: 'Just now',
      suggestedFollowUps: [
        "What noise-cancelling headphones do you recommend?",
        "Show me products under $100 with 4.5+ star ratings",
        "Find ergonomic items for a comfortable desk setup"
      ]
    }
  ]);

  const handleSendMessage = async (userPromptText?: string) => {
    const messageToSend = userPromptText || query;
    if (!messageToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Build catalog context for RAG grounding
      const catalogContext = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        description: p.description,
        features: p.features,
        tags: p.tags,
        image: p.image
      }));

      const res = await fetch('/api/ai/rag-shopping-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageToSend,
          catalog: catalogContext,
          userBudget: maxPrice,
          categoryPreference: selectedCategory === 'All' ? undefined : selectedCategory
        })
      });

      const data: RagShoppingResponse = await res.json();

      // Map citations to real products if returned
      let matchedCitations: RagProductCitation[] = [];
      if (data.retrievedProducts && data.retrievedProducts.length > 0) {
        matchedCitations = data.retrievedProducts;
      } else {
        // Fallback keyword retrieval against real products in memory
        const qLower = messageToSend.toLowerCase();
        const fallbackMatches = products
          .filter(p => 
            p.name.toLowerCase().includes(qLower) ||
            p.category.toLowerCase().includes(qLower) ||
            p.tags.some(t => qLower.includes(t.toLowerCase())) ||
            (qLower.includes('headphone') && p.category.toLowerCase().includes('electron')) ||
            (qLower.includes('chair') && p.name.toLowerCase().includes('chair'))
          )
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            rating: p.rating,
            reviewCount: p.reviewCount,
            stock: p.stock,
            image: p.image,
            relevanceScore: 0.92,
            matchHighlights: p.features.slice(0, 3)
          }));
        matchedCitations = fallbackMatches.length > 0 ? fallbackMatches : [];
      }

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || `Based on our verified catalog, here are the best matching items tailored to your criteria.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedProducts: matchedCitations,
        comparisonSummary: data.comparisonSummary,
        suggestedFollowUps: data.suggestedFollowUps || [
          "Compare battery life between options",
          "What is the warranty coverage?",
          "Are there complementary accessories?"
        ]
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I had trouble querying the RAG pipeline. Here is our best matching recommendation based on current stock:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedProducts: products.slice(0, 2).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          rating: p.rating,
          reviewCount: p.reviewCount,
          stock: p.stock,
          image: p.image,
          relevanceScore: 0.85,
          matchHighlights: p.features.slice(0, 2)
        }))
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
                <Bot className="h-6 w-6" />
              </div>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                Milestone 3 Advanced RAG Feature
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              RAG-Powered AI Shopping Assistant
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Conversational buying advisor grounded directly in your authentic store catalog. Answers shopper queries with exact SKU specs, verified pricing, in-stock availability, and intelligent trade-off comparisons.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1 self-start md:self-auto">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Grounded Knowledge Base</span>
            </div>
            <p className="text-slate-400">{products.length} live SKUs indexed for semantic retrieval</p>
          </div>
        </div>
      </div>

      {/* Main Chat & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter & Controls Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <span>Shopping Criteria</span>
            </h3>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Max Budget Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Maximum Budget</span>
                <span className="text-indigo-600 font-bold">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Quick Starter Prompts */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>Recommended Queries</span>
            </h4>
            <div className="space-y-2">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-900/60 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-all flex items-start space-x-2"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Interactive Chat Stream */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {chatHistory.map(msg => (
              <div
                key={msg.id}
                className={`flex space-x-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <span className={`block text-[10px] mt-2 font-mono ${msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Grounded Product Recommendations Cards */}
                  {msg.retrievedProducts && msg.retrievedProducts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Retrieved Grounded Catalog Items ({msg.retrievedProducts.length})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {msg.retrievedProducts.map(prod => (
                          <div
                            key={prod.id}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                          >
                            <div className="flex space-x-3">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="h-16 w-16 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                                  {prod.category}
                                </span>
                                <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{prod.name}</h5>
                                <div className="mt-1 flex items-center space-x-2">
                                  <span className="font-black text-slate-900 text-sm">${prod.price.toFixed(2)}</span>
                                  <div className="flex items-center text-amber-500 text-[11px] font-bold">
                                    <Star className="h-3 w-3 fill-amber-400 mr-0.5" />
                                    <span>{prod.rating}</span>
                                    <span className="text-slate-400 font-normal ml-1">({prod.reviewCount})</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Features Highlights */}
                            {prod.matchHighlights && prod.matchHighlights.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                                {prod.matchHighlights.map((feat, fi) => (
                                  <div key={fi} className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                    <span className="line-clamp-1">{feat}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Stock Indicator */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className={`font-semibold ${prod.stock > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {prod.stock > 0 ? `✓ In Stock (${prod.stock})` : 'Out of Stock'}
                              </span>
                              <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                                View Specs →
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comparison Summary */}
                  {msg.comparisonSummary && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                      <strong>AI Comparison:</strong> {msg.comparisonSummary}
                    </div>
                  )}

                  {/* Suggested Follow-Up Prompts */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedFollowUps.map((followUp, fi) => (
                        <button
                          key={fi}
                          onClick={() => handleSendMessage(followUp)}
                          className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                        >
                          💬 {followUp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-9 w-9 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex space-x-3.5 items-start">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 animate-spin" />
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>Retrieving catalog vectors and synthesizing grounded recommendations...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about products, features, comparisons, or price constraints..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
