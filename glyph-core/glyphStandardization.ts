import { User } from '../types/user';
import { GlyphTier } from '../types/glyphTiers';
import { DEFAULT_TIER_VISUALS } from '../types/visualProperties';

// Standardized user ID fallback
export const getSafeUserId = (user: User | null | undefined): string => {
  if (!user) return 'sphinx-user-42';
  return user.id || user.glyphId || 'sphinx-user-42';
};

// Standardized resonance modifiers for different card types
export const CardResonanceBoosts = {
  quantum: 1.0,    // Base resonance for quantum score
  listings: 0.8,   // Services published
  downloads: 0.6,  // Total downloads
  rating: 0.7,     // Average rating
} as const;

// Type for card types
export type DashboardCardType = keyof typeof CardResonanceBoosts;

// Validate and get tier from number or undefined
export const validateTier = (tier?: number): GlyphTier => {
  if (!tier || tier < 1) return GlyphTier.COMMON;
  if (tier >= 5) return GlyphTier.LEGENDARY;
  return tier as GlyphTier;
};

// SVG Cache for glyph patterns
export class SVGCache {
  private static instance: SVGCache;
  private cache: Map<string, string>;
  private maxSize: number;

  private constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  public static getInstance(): SVGCache {
    if (!SVGCache.instance) {
      SVGCache.instance = new SVGCache();
    }
    return SVGCache.instance;
  }

  public getCacheKey(glyphId: string, tier: GlyphTier, resonance: number): string {
    return `${glyphId}-${tier}-${resonance.toFixed(2)}`;
  }

  public get(key: string): string | undefined {
    return this.cache.get(key);
  }

  public set(key: string, svg: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, svg);
  }

  public clear(): void {
    this.cache.clear();
  }
}

// Get resonance boost based on card type
export const getResonanceBoost = (type: DashboardCardType): number => {
  return CardResonanceBoosts[type];
};

// Get animation mode based on card type
export const getCardAnimationMode = (type: DashboardCardType): 'static' | 'breath' | 'pulse' => {
  switch (type) {
    case 'quantum':
    case 'downloads':
      return 'pulse';
    default:
      return 'breath';
  }
}; 