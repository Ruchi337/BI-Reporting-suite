import React, { useState, useEffect } from 'react';
import { 
  MessageSquareHeart, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  MessageSquare, 
  ShieldAlert, 
  Lightbulb,
  Send
} from 'lucide-react';
import { Product, ReviewItem, SentimentAnalysisResult } from '../types';
import { SAMPLE_REVIEWS } from '../mockData';

interface ReviewSentimentProps {
  products: Product[];
}

export const ReviewSentiment: React.FC<ReviewSentimentProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-001');
  const [reviewsMap, setReviewsMap] = useState<Record<string, ReviewItem[]>>(SAMPLE_REVIEWS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysisResult | null>(null);

  // Custom review test box
  const [customReviewText, setCustomReviewText] = useState('');
  const [customReviewRating, setCustomReviewRating] = useState(5);
  const [customReviewAuthor, setCustomReviewAuthor] = useState('');

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];
  const activeReviews = (activeProduct && reviewsMap[activeProduct.id]) || [];

  useEffect(() => {
    if (activeProduct && activeReviews.length > 0) {
      runSentimentPipeline(activeProduct, activeReviews);
    }
  }, [selectedProductId]);

  const runSentimentPipeline = async (product: Product, reviews: ReviewItem[]) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          reviews: reviews.map(r => ({
            rating: r.rating,
            title: r.title,
            comment: r.comment
          }))
        })
      });
      const data = await res.json();
      setSentimentResult({
        productId: product.id,
        productName: product.name,
        overallScore: data.overallScore ?? 88,
        sentimentLabel: data.sentimentLabel ?? 'Very Positive',
        breakdown: data.breakdown ?? { positivePercentage: 80, neutralPercentage: 15, negativePercentage: 5 },
        topPros: data.topPros ?? [],
        topCons: data.topCons ?? [],
        keyThemes: data.keyThemes ?? [],
        vendorExecutiveSummary: data.vendorExecutiveSummary ?? '',
        actionableImprovements: data.actionableImprovements ?? []
      });
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddCustomReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReviewText.trim() || !activeProduct) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      productId: activeProduct.id,
      customerName: customReviewAuthor.trim() || 'Verified Customer',
      rating: customReviewRating,
      date: new Date().toISOString().split('T')[0],
      title: customReviewText.slice(0, 45) + (customReviewText.length > 45 ? '...' : ''),
      comment: customReviewText,
      verifiedPurchase: true
    };

    const updated = {
      ...reviewsMap,
      [activeProduct.id]: [newRev, ...activeReviews]
    };
    setReviewsMap(updated);
    setCustomReviewText('');
    setCustomReviewAuthor('');
    runSentimentPipeline(activeProduct, updated[activeProduct.id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">LLM Customer Review Sentiment Intelligence</h2>
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Milestone 2 Advanced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gemini NLP pipeline extracting sentiment scores, top pros & cons summaries, and actionable vendor fixes.
          </p>
        </div>

        <button
          onClick={() => activeProduct && runSentimentPipeline(activeProduct, activeReviews)}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Reviews...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Re-run LLM Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Target Product Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase px-2 whitespace-nowrap">
          Select Product:
        </span>
        {products.map(p => {
          const isSelected = p.id === selectedProductId;
          const count = (reviewsMap[p.id] || []).length;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{p.name.split(' ').slice(0, 3).join(' ')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white text-indigo-900' : 'bg-slate-200 text-slate-700'
              }`}>
                {count} reviews
              </span>
            </button>
          );
        })}
      </div>

      {/* Sentiment Overview Score Cards */}
      {sentimentResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment Dial Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Overall Sentiment Index</span>
              <div className="flex items-baseline gap-3 my-2">
                <span className="text-4xl font-extrabold text-indigo-600">
                  {sentimentResult.overallScore}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ 100</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {sentimentResult.sentimentLabel}
                </span>
              </div>
            </div>

            {/* Percentage Bar */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Sentiment Distribution:</span>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${sentimentResult.breakdown.positivePercentage}%` }} 
                  title={`Positive: ${sentimentResult.breakdown.positivePercentage}%`}
                />
                <div 
                  className="bg-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${sentimentResult.breakdown.neutralPercentage}%` }} 
                  title={`Neutral: ${sentimentResult.breakdown.neutralPercentage}%`}
                />
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ width: `${sentimentResult.breakdown.negativePercentage}%` }} 
                  title={`Negative: ${sentimentResult.breakdown.negativePercentage}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="text-emerald-600 font-bold">● {sentimentResult.breakdown.positivePercentage}% Positive</span>
                <span className="text-amber-600 font-bold">● {sentimentResult.breakdown.neutralPercentage}% Neutral</span>
                <span className="text-rose-600 font-bold">● {sentimentResult.breakdown.negativePercentage}% Negative</span>
              </div>
            </div>
          </div>

          {/* Top Pros Card */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <ThumbsUp className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Top Product Pros (LLM Extracted)</h3>
            </div>
            <ul className="space-y-2">
              {sentimentResult.topPros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white/80 p-2 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cons Card */}
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <ThumbsDown className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Top Product Cons (LLM Extracted)</h3>
            </div>
            <ul className="space-y-2">
              {sentimentResult.topCons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white/80 p-2 rounded-xl border border-rose-100">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Vendor Executive Summary & Actionable Recommendations */}
      {sentimentResult && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/50 text-white shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-indigo-800/60">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Vendor Executive Action Plan</h3>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {sentimentResult.vendorExecutiveSummary}
          </p>

          <div>
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">
              Recommended Product Revisions & Interventions:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sentimentResult.actionableImprovements.map((imp, idx) => (
                <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-indigo-500/20 text-xs text-slate-200 flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Feeds & Live Test Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Reviews Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Reviews Feed ({activeReviews.length})</h3>
              <p className="text-xs text-slate-500">Verified purchases analyzed by the LLM pipeline</p>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {activeReviews.map(rev => (
              <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{rev.customerName}</span>
                    {rev.verifiedPurchase && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="font-bold text-slate-800 ml-1 text-xs">{rev.title}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Test: Add & Analyze Custom Review */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Test Custom Review</h3>
            <p className="text-xs text-slate-500">Add feedback to run real-time sentiment scoring</p>
          </div>

          <form onSubmit={handleAddCustomReview} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g., Jane Cooper"
                value={customReviewAuthor}
                onChange={e => setCustomReviewAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCustomReviewRating(star)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                      customReviewRating >= star ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Review Body</label>
              <textarea
                rows={3}
                required
                placeholder="Type customer comments (e.g. 'Loved the battery life, but the mic noise is bad on windy days')..."
                value={customReviewText}
                onChange={e => setCustomReviewText(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !customReviewText.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit & Analyze Review</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
