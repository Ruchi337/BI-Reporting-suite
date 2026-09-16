import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Eye, 
  Tag, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  Loader2, 
  Layers, 
  Boxes,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onSelectProductForForecasting?: (product: Product) => void;
}

const PRESET_SAMPLE_IMAGES = [
  {
    name: 'Smart Ergonomic Keyboard',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Minimalist Leather Desk Pad',
    category: 'Office & Furniture',
    url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Titanium Thermal Coffee Tumbler',
    category: 'Home & Kitchen',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  }
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddProduct,
  onDeleteProduct,
  onSelectProductForForecasting
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState(129.99);
  const [cost, setCost] = useState(55.00);
  const [stock, setStock] = useState(45);
  const [minThreshold, setMinThreshold] = useState(20);
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [tone, setTone] = useState<'compelling' | 'luxury' | 'technical' | 'concise'>('compelling');

  // AI Loading States
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [visionDetectionResult, setVisionDetectionResult] = useState<any>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle local image file upload & convert to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageBase64(result);
        setImageUrl(result);
        triggerVisionAnalysis(result, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  // Milestone 1: Image Recognition / Vision API
  const triggerVisionAnalysis = async (imgData: string, mimeType: string = 'image/jpeg') => {
    setIsAnalyzingVision(true);
    setVisionDetectionResult(null);
    try {
      const res = await fetch('/api/ai/vision-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData.startsWith('data:') ? imgData : undefined,
          imageUrl: !imgData.startsWith('data:') ? imgData : undefined,
          mimeType
        })
      });
      const data = await res.json();
      setVisionDetectionResult(data);

      if (data.detectedCategory) setCategory(data.detectedCategory);
      if (data.detectedName && !productName) setProductName(data.detectedName);
      if (data.suggestedTags && data.suggestedTags.length > 0) {
        setTags(Array.from(new Set([...tags, ...data.suggestedTags])));
      }
      setFeedbackSuccess('Image recognized! Category and visual tags extracted automatically.');
      setTimeout(() => setFeedbackSuccess(''), 4000);
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // Milestone 1: GenAI Product Descriptions
  const triggerCopyGeneration = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch('/api/ai/describe-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          category,
          keyPoints: features.length > 0 ? features.join(', ') : 'High durability, premium ergonomics, top customer rating',
          tone
        })
      });
      const data = await res.json();
      if (data.description) setDescription(data.description);
      if (data.features) setFeatures(data.features);
      if (data.tags) setTags(Array.from(new Set([...tags, ...data.tags])));
      if (data.suggestedTitle && !productName) setProductName(data.suggestedTitle);

      setFeedbackSuccess('Generated compelling AI description and feature highlights!');
      setTimeout(() => setFeedbackSuccess(''), 4000);
    } catch (err) {
      console.error('Copy generation error:', err);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: productName,
      sku: `${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      category,
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      minThreshold: Number(minThreshold),
      leadTimeDays: Number(leadTimeDays),
      image: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      description: description || 'High-performance commercial product with full warranty.',
      tags: tags.length > 0 ? tags : [category.toLowerCase(), 'new-arrival'],
      features: features.length > 0 ? features : ['Precision engineered quality', 'Manufacturer 1-year guarantee'],
      rating: 5.0,
      reviewCount: 1,
      salesLast30Days: 15,
      supplier: 'Direct Vendor Supply',
      vectorEmbedding: [0.75, 0.45, 0.60, 0.80, 0.50, 0.65, 0.70, 0.55]
    };

    onAddProduct(newProd);
    setIsModalOpen(false);
    // Reset form
    setProductName('');
    setDescription('');
    setTags([]);
    setFeatures([]);
    setImageUrl('');
    setImageBase64('');
    setVisionDetectionResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action & banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Product Catalog & Vision Lab</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Vendor catalog with Vision Model auto-categorization and Gemini GenAI marketing descriptions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Product with AI</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, SKU, or tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-1 mr-1 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const isLowStock = product.stock <= product.minThreshold;
          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    {isLowStock && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Low Stock ({product.stock})
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    ₹{product.price.toFixed(2)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-mono">{product.sku}</span>
                    <span>⭐ {product.rating} ({product.reviewCount})</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1.5" title={product.name}>
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Current Stock</span>
                      <span className={`font-semibold ${isLowStock ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                        {product.stock} units
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monthly Velocity</span>
                      <span className="font-semibold text-slate-800">
                        {product.salesLast30Days} units / mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => onSelectProductForForecasting && onSelectProductForForecasting(product)}
                  className="flex-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Forecast Demand</span>
                </button>
                {onDeleteProduct && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    title="Delete Product"
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Product with AI Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Product with Vision & GenAI</h3>
                  <p className="text-xs text-slate-500">Auto-tag and generate optimized listing copy in seconds</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackSuccess && (
              <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{feedbackSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
              {/* Step 1: Image Recognition & Upload */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                    <span>1. Product Image & Vision Recognition</span>
                  </span>
                  {isAnalyzingVision && (
                    <span className="text-xs text-indigo-600 flex items-center gap-1 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Vision AI Scanning...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload box */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-white transition-colors">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Choose Image File</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Preset quick samples */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Or Choose Sample:</span>
                    <div className="flex flex-col gap-1">
                      {PRESET_SAMPLE_IMAGES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setImageUrl(sample.url);
                            setProductName(sample.name);
                            setCategory(sample.category);
                            triggerVisionAnalysis(sample.url);
                          }}
                          className="text-left text-xs p-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 flex items-center justify-between"
                        >
                          <span className="truncate">{sample.name}</span>
                          <span className="text-[10px] text-indigo-600 font-mono">Scan</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview & Vision Extraction Badge */}
                {imageUrl && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover border border-slate-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-slate-800">
                        {visionDetectionResult?.detectedName || 'Image Attached'}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Detected Category: <strong className="text-indigo-600">{category}</strong>
                      </div>
                      {visionDetectionResult?.detectedMaterial && (
                        <div className="text-[10px] text-slate-400">
                          Material: {visionDetectionResult.detectedMaterial}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Product Basics & AI Copy Generation */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ultra-Ergonomic Mechanical Keyboard"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Office & Furniture">Office & Furniture</option>
                      <option value="Sports & Outdoors">Sports & Outdoors</option>
                      <option value="Watches & Jewelry">Watches & Jewelry</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={e => setCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={e => setStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* GenAI Description Trigger */}
                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>GenAI Description & Marketing Copy</span>
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={tone}
                        onChange={e => setTone(e.target.value as any)}
                        className="text-[11px] bg-white border border-indigo-200 rounded-md px-2 py-1 text-slate-700"
                      >
                        <option value="compelling">Tone: Compelling</option>
                        <option value="luxury">Tone: Luxury & Premium</option>
                        <option value="technical">Tone: Technical & Spec-focused</option>
                        <option value="concise">Tone: Concise & Punchy</option>
                      </select>

                      <button
                        type="button"
                        onClick={triggerCopyGeneration}
                        disabled={isGeneratingCopy}
                        className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                      >
                        {isGeneratingCopy ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Generate AI Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Click 'Generate AI Copy' above or enter custom description..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Features & Tags */}
                {features.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Bullet Points</label>
                    <ul className="space-y-1">
                      {features.map((feat, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-1.5 px-2.5 rounded-lg">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Generated SEO & Marketplace Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                >
                  Save & Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
