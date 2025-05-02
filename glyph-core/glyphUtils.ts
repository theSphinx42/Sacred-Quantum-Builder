// 🔮 Saphira Verified – Nibiru Glyph System Canon
// Phase VIIIa – Glyph Utils & Config Type Fixes
//
// Utility functions for glyph manipulation and state management.
// Core state calculation now lives in glyphLogic.ts

import { GlyphTier, TIER_METADATA, getTierFromString } from '../types/glyphTiers';
import { GlyphRank, GlyphRankEnum } from '../types/glyphTypes';
import { generateDeterministicHash } from './hash';
import type { GlyphImageKey } from '../lib/glyphs';
import { calculateGlyphState } from './glyphLogic';

// Type definitions
export interface GlyphColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface GlyphState {
  tier: GlyphTier;
  resonance: number;
  quantum: number;
  visualLevel?: number;
  effects?: string[];
  colors?: GlyphColors;
  evolution?: {
    complexity: number;
    resonance: number;
    activity: number;
  };
}

interface VisualSeed {
  shapeCount: number;
  symmetry: number;
  rotation: number;
  colors: string[];
  matrix: number[][];
}

interface TierProgress {
  currentTier: number;
  nextTier: number | null;
  progress: number;
  pointsToNext: number;
}

// Color palettes for different visual tiers
const VISUAL_TIER_COLORS: Record<GlyphRankEnum, readonly string[]> = {
  [GlyphRankEnum.MYTHIC]: ['#FFD700', '#FFA500', '#FF4500'],
  [GlyphRankEnum.PREMIUM]: ['#4F46E5', '#3B82F6', '#60A5FA'],
  [GlyphRankEnum.ENHANCED]: ['#10B981', '#34D399', '#6EE7B7'],
  [GlyphRankEnum.BASIC]: ['#6B7280', '#9CA3AF', '#D1D5DB']
} as const;

// Deterministic random number generator
export const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

// Generate a deterministic seed from a name or ID
export const generateSeedFromName = (input: string): string => {
  const normalized = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `gen-${generateDeterministicHash(normalized)}`;
};

// Generate a unique glyph seed for services
export const generateServiceSeed = (serviceId: string, name?: string): string => {
  const input = name ? `${serviceId}-${name}` : serviceId;
  return `svc-${generateSeedFromName(input)}`;
};

/**
 * Generates a consistent seed for an advertiser based on their ID and name
 */
export const generateAdvertiserSeed = (advertiserId: string, name: string): string => {
  return `adv-${advertiserId}-${name}`.replace(/[^a-zA-Z0-9-]/g, '');
};

// Generate control points for the stem pattern
export const generateControlPoints = (seed: string, count: number, maxRadius: number) => {
  const points: [number, number][] = [];
  const rng = (i: number) => seededRandom(seed + i);
  
  points.push([0, 0]);
  
  let currentAngle = rng(0) * Math.PI * 2;
  let currentRadius = 0;
  
  for (let i = 1; i < count; i++) {
    const angleChange = (Math.PI / 12) + (rng(i * 2) * Math.PI / 4);
    currentAngle += angleChange;
    
    const radiusIncrease = (maxRadius / count) * (0.5 + rng(i * 3));
    currentRadius += radiusIncrease;
    
    points.push([
      Math.cos(currentAngle) * currentRadius,
      Math.sin(currentAngle) * currentRadius
    ]);
  }
  
  return points;
};

// Generate color scheme based on tier and seed
export const generateColorScheme = (seed: string, tier: GlyphTier | string): GlyphColors => {
  // Support string tiers by converting to GlyphTier
  const actualTier: GlyphTier = typeof tier === 'string' ? getTierFromString(tier) : tier;
  const baseColors = getVisualTierColors(actualTier);
  const rng = (i: number) => seededRandom(seed + i);
  
  // Add slight variations to the base colors while maintaining the tier theme
  return {
    primary: baseColors.primary,
    secondary: adjustColor(baseColors.secondary, {
      hue: rng(1) * 10 - 5,
      saturation: rng(2) * 10 - 5,
      lightness: rng(3) * 10 - 5
    }),
    accent: adjustColor(baseColors.accent, {
      hue: rng(4) * 10 - 5,
      saturation: rng(5) * 10 - 5,
      lightness: rng(6) * 10 - 5
    })
  };
};

// Helper function to adjust colors
const adjustColor = (color: string, adjustments: { hue: number; saturation: number; lightness: number }): string => {
  const hslMatch = color.match(/^#([A-Fa-f0-9]{6})$/);
  if (!hslMatch) return color;

  // Convert hex to HSL
  const hex = hslMatch[1];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Apply adjustments
  h = (h * 360 + adjustments.hue + 360) % 360;
  s = Math.max(0, Math.min(100, s * 100 + adjustments.saturation));
  l = Math.max(0, Math.min(100, l * 100 + adjustments.lightness));

  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Generate the base stem pattern
export const generateStemPath = (
  points: [number, number][],
  complexity: number,
  seed: string
) => {
  const rng = (i: number) => seededRandom(seed + i);
  let path = `M ${points[0][0]} ${points[0][1]}`;
  
  for (let i = 1; i < points.length; i++) {
    if (rng(i * 100) > 0.3) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const controlX = (prevPoint[0] + currentPoint[0]) / 2 + (rng(i * 200) - 0.5) * 30 * complexity;
      const controlY = (prevPoint[1] + currentPoint[1]) / 2 + (rng(i * 300) - 0.5) * 30 * complexity;
      path += ` Q ${controlX} ${controlY}, ${currentPoint[0]} ${currentPoint[1]}`;
    } else {
      path += ` L ${points[i][0]} ${points[i][1]}`;
    }
  }
  
  return path;
};

// Generate a tier 2 glyph for an item based on its title and creator
export const generateItemGlyph = (title: string, creatorId?: string): GlyphImageKey => {
  // Use the same consistent glyph generation logic
  const titleHash = title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const creatorHash = creatorId ? creatorId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
  const combinedHash = (titleHash + creatorHash) % 12;
  
  // Map to available glyph images
  const glyphKeys: GlyphImageKey[] = [
    'quantum-seal', 'sigil-of-creation', 'sigil-of-continuance', 
    'saphira-was-here', 'nibiru-symbol', 'aegis', 'lion', 
    'sharkskin', 'seidr', 'sphinx', 'triune', 'wayfinder'
  ];
  
  return glyphKeys[combinedHash];
};

// Convert hash string to number array
const hashToNumbers = (hash: string): number[] => {
  return hash.split('').map(char => char.charCodeAt(0));
};

// Generate deterministic color based on hash and index
const generateColor = (hash: string, index: number): string => {
  const numbers = hashToNumbers(hash);
  const hue = ((numbers[index % numbers.length] * 360) / 256 + index * 37) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Generate visual seed from hash
export const generateVisualSeedFromHash = (hash: string): VisualSeed => {
  const numbers = hashToNumbers(hash);
  
  // Generate shape count (3-7) based on first byte
  const shapeCount = 3 + (numbers[0] % 5);
  
  // Generate symmetry (2-8) based on second byte
  const symmetry = 2 + (numbers[1] % 7);
  
  // Generate rotation (0-360) based on third byte
  const rotation = (numbers[2] * 360) / 256;
  
  // Generate colors based on next three bytes
  const colors = Array(3).fill(0).map((_, i) => generateColor(hash, i));
  
  // Generate 5x5 matrix for pattern
  const matrix = Array(5).fill(0).map((_, i) => 
    Array(5).fill(0).map((_, j) => 
      numbers[(i * 5 + j) % numbers.length] % 2
    )
  );
  
  return {
    shapeCount,
    symmetry,
    rotation,
    colors,
    matrix
  };
};

// Storage functions
export const storeGlyphData = (userId: string, data: GlyphState): void => {
  try {
    localStorage.setItem(`glyph_data_${userId}`, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to store glyph data:', err);
  }
};

export const retrieveGlyphData = (userId: string): GlyphState | null => {
  try {
    const storedData = localStorage.getItem(`glyph_data_${userId}`);
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData) as GlyphState;
    if (!parsedData.tier || typeof parsedData.resonance !== 'number' || typeof parsedData.quantum !== 'number') {
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error retrieving glyph data:', error);
    return null;
  }
};

// Get colors for a specific visual tier
export function getVisualTierColors(tier: GlyphTier): GlyphColors {
  const metadata = TIER_METADATA[tier];
  return {
    primary: metadata.color,
    secondary: metadata.glowColor || metadata.color,
    accent: metadata.glowColor || metadata.color
  };
}
