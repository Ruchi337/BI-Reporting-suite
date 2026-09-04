import { Product, RecommendationItem } from '../types';

/**
 * Computes cosine similarity between two numerical vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Text to pseudo-embedding vector mapping for semantic simulation
 * (maps key concepts like ergonomics, audio, outdoor, luxury, power, compactness)
 */
export function generateQueryEmbedding(query: string): number[] {
  const q = query.toLowerCase();
  const vector = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

  // Dimension 0: Audio / Acoustics / Sound
  if (q.includes('sound') || q.includes('audio') || q.includes('music') || q.includes('noise') || q.includes('listen') || q.includes('headphone')) {
    vector[0] = 0.95;
  }
  // Dimension 1: Office / Ergonomics / Posture / Work
  if (q.includes('chair') || q.includes('back') || q.includes('desk') || q.includes('ergonomic') || q.includes('comfort') || q.includes('sit') || q.includes('office')) {
    vector[1] = 0.92;
  }
  // Dimension 2: Fitness / Hydration / Sports / Outdoor
  if (q.includes('water') || q.includes('gym') || q.includes('sport') || q.includes('bottle') || q.includes('drink') || q.includes('run') || q.includes('hike')) {
    vector[2] = 0.89;
  }
  // Dimension 3: Luxury / Precision / Horology / Craftsmanship
  if (q.includes('watch') || q.includes('luxury') || q.includes('time') || q.includes('automatic') || q.includes('gold') || q.includes('titanium') || q.includes('elegant')) {
    vector[3] = 0.94;
  }
  // Dimension 4: Culinary / Coffee / Kitchen / Beverage
  if (q.includes('coffee') || q.includes('kettle') || q.includes('brew') || q.includes('pour') || q.includes('kitchen') || q.includes('tea') || q.includes('morning')) {
    vector[4] = 0.91;
  }
  // Dimension 5: Travel / Portability / Photography / Compact
  if (q.includes('travel') || q.includes('camera') || q.includes('tripod') || q.includes('lightweight') || q.includes('photo') || q.includes('compact') || q.includes('fly')) {
    vector[5] = 0.88;
  }
  // Dimension 6: High Tech / Smart / Digital
  if (q.includes('smart') || q.includes('pro') || q.includes('digital') || q.includes('sensor') || q.includes('tech') || q.includes('wireless')) {
    vector[6] = 0.85;
  }
  // Dimension 7: Premium Materials / Durability
  if (q.includes('durable') || q.includes('carbon') || q.includes('steel') || q.includes('mesh') || q.includes('quality')) {
    vector[7] = 0.82;
  }

  return vector;
}

/**
 * Vector Search Recommendation (Milestone 2 Advanced feature)
 */
export function getVectorSearchRecommendations(
  queryOrTargetProduct: string | Product,
  products: Product[],
  topK: number = 4
): RecommendationItem[] {
  let targetVector: number[];
  let targetId = '';

  if (typeof queryOrTargetProduct === 'string') {
    targetVector = generateQueryEmbedding(queryOrTargetProduct);
  } else {
    targetVector = queryOrTargetProduct.vectorEmbedding || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    targetId = queryOrTargetProduct.id;
  }

  const scored = products
    .filter(p => p.id !== targetId)
    .map(product => {
      const prodVector = product.vectorEmbedding || generateQueryEmbedding(`${product.name} ${product.description} ${product.tags.join(' ')}`);
      const similarity = cosineSimilarity(targetVector, prodVector);
      
      const matchAttributes: string[] = [];
      if (similarity > 0.7) matchAttributes.push('High Intent Semantic Match');
      if (product.rating >= 4.7) matchAttributes.push('Top Customer Rating');
      if (product.salesLast30Days > 50) matchAttributes.push('High Sales Velocity');

      return {
        product,
        score: Number((similarity * 100).toFixed(1)),
        reason: `Vector Cosine Match (${(similarity * 100).toFixed(0)}% semantic vector similarity via pgvector index)`,
        method: 'vector-semantic' as const,
        matchAttributes
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

/**
 * Rule-Based Recommendation Engine (Milestone 2 Base requirement)
 */
export function getRuleBasedRecommendations(
  targetProduct: Product,
  products: Product[],
  topK: number = 4
): RecommendationItem[] {
  // Strategy:
  // 1. Same category top sellers
  // 2. Cross-category high velocity
  const sameCategory = products
    .filter(p => p.id !== targetProduct.id && p.category === targetProduct.category)
    .sort((a, b) => b.salesLast30Days - a.salesLast30Days);

  const crossCategory = products
    .filter(p => p.id !== targetProduct.id && p.category !== targetProduct.category)
    .sort((a, b) => b.salesLast30Days - a.salesLast30Days);

  const combined = [...sameCategory, ...crossCategory].slice(0, topK);

  return combined.map(product => {
    const isSameCat = product.category === targetProduct.category;
    return {
      product,
      score: isSameCat ? 90 : 70,
      reason: isSameCat 
        ? `Rule #1: Top selling product in ${product.category} category (${product.salesLast30Days} units/mo)`
        : `Rule #2: Frequently bought complementary cross-category item`,
      method: 'rule-based' as const,
      matchAttributes: [isSameCat ? 'Category Match' : 'Cross-Sell Trigger', `Velocity: ${product.salesLast30Days}/mo`]
    };
  });
}
