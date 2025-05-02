import { GlyphTier, getTierFromNumber } from '../types/glyphTiers';
import { GlyphState } from '../types/glyphTypes';
import { calculateVisualState } from '../types/glyphVisuals';
import { generateDeterministicHash } from './hash';

/**
 * Calculate the complete glyph state based on a hash
 */
export const calculateGlyphState = (hash: string): GlyphState => {
  const hashNum = parseInt(hash.slice(0, 8), 16);
  const resonance = Math.min(100, (hashNum % 100));
  const quantum = Math.min(100, ((hashNum >> 8) % 100));
  const tier = getTierFromNumber(Math.floor(resonance / 20));

  return {
    tier,
    resonance,
    quantum,
    visual: calculateVisualState(tier, 1, {
      resonance,
      activity: quantum
    })
  };
};

/**
 * Check if a glyph meets the required tier threshold
 */
export const meetsTierThreshold = (
  requiredTier: GlyphTier,
  currentTier: GlyphTier
): boolean => {
  // NONE tier never meets any threshold
  if (currentTier === GlyphTier.NONE) return false;
  
  // SYSTEM tier overrides all requirements
  if (currentTier === GlyphTier.SYSTEM) return true;

  return currentTier >= requiredTier;
};

/**
 * Generate a deterministic seed from a name or ID
 */
export const generateGlyphSeed = (input: string): string => {
  const normalized = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return generateDeterministicHash(normalized);
}; 