import { GlyphTier, TIER_METADATA } from '../types/glyphTiers';
import { GlyphColorScheme } from '../types/glyphColors';
import { SpiritGlyph, GlyphMetadata } from '../types/spiritGlyph';

/**
 * Type guard to validate if an object is a valid GlyphMetadata
 */
export const isValidGlyphMetadata = (obj: unknown): obj is GlyphMetadata => {
  if (!obj || typeof obj !== 'object') return false;
  
  const metadata = obj as GlyphMetadata;
  return (
    typeof metadata.complexity === 'number' &&
    typeof metadata.harmony === 'number' &&
    typeof metadata.stability === 'number' &&
    metadata.complexity >= 0 && metadata.complexity <= 1 &&
    metadata.harmony >= 0 && metadata.harmony <= 1 &&
    metadata.stability >= 0 && metadata.stability <= 1
  );
};

/**
 * Type guard to validate if an object is a valid SpiritGlyph
 */
export const isValidSpiritGlyph = (obj: unknown): obj is SpiritGlyph => {
  if (!obj || typeof obj !== 'object') return false;
  
  const glyph = obj as SpiritGlyph;
  return (
    typeof glyph.id === 'string' &&
    typeof glyph.seed === 'string' &&
    typeof glyph.tier === 'number' &&
    Object.values(GlyphTier).includes(glyph.tier) &&
    typeof glyph.resonance === 'number' &&
    typeof glyph.timestamp === 'string' &&
    (!glyph.pattern || typeof glyph.pattern === 'string') &&
    (!glyph.metadata || isValidGlyphMetadata(glyph.metadata)) &&
    typeof glyph.colors === 'object' &&
    typeof glyph.colors.primary === 'string' &&
    typeof glyph.colors.secondary === 'string' &&
    typeof glyph.colors.accent === 'string' &&
    (!glyph.spiritZipHash || typeof glyph.spiritZipHash === 'string') &&
    (!glyph.userId || typeof glyph.userId === 'string')
  );
};

/**
 * Get the default color scheme for a given tier
 */
export const getColorByTier = (tier: GlyphTier): GlyphColorScheme => {
  const tierData = TIER_METADATA[tier];
  return {
    primary: tierData.color,
    secondary: tierData.glowColor,
    accent: tierData.color,
    glow: tierData.glowColor
  };
};

/**
 * Validate and sanitize a tier value
 * Returns GlyphTier.COMMON if invalid
 */
export const validateTier = (tier: unknown): GlyphTier => {
  if (typeof tier === 'number' && Object.values(GlyphTier).includes(tier)) {
    return tier;
  }
  if (typeof tier === 'string') {
    const normalizedTier = tier.toLowerCase();
    switch (normalizedTier) {
      case 'legendary': return GlyphTier.LEGENDARY;
      case 'mythic': return GlyphTier.MYTHIC;
      case 'rare': return GlyphTier.RARE;
      case 'enhanced': return GlyphTier.ENHANCED;
      default: return GlyphTier.COMMON;
    }
  }
  return GlyphTier.COMMON;
};

/**
 * Validate and repair a potentially corrupted SpiritGlyph
 * Returns a valid glyph with default values for corrupted fields
 */
export const repairSpiritGlyph = (glyph: Partial<SpiritGlyph>): SpiritGlyph => {
  const now = new Date().toISOString();
  const tier = validateTier(glyph.tier);
  
  return {
    id: glyph.id || `glyph-${Date.now()}`,
    seed: glyph.seed || `seed-${Date.now()}`,
    tier: tier,
    resonance: typeof glyph.resonance === 'number' ? Math.max(0, Math.min(1, glyph.resonance)) : 0,
    timestamp: glyph.timestamp || now,
    pattern: glyph.pattern,
    metadata: isValidGlyphMetadata(glyph.metadata) ? glyph.metadata : {
      complexity: 0,
      harmony: 0,
      stability: 0
    },
    colors: glyph.colors || getColorByTier(tier),
    spiritZipHash: glyph.spiritZipHash,
    userId: glyph.userId
  };
}; 