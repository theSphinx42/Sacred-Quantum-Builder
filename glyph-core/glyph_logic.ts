// 🔮 Saphira Verified – Nibiru Glyph System Canon
// Phase III – SpiritZip Vault Sync Completed
// 
// 🧬 Identity structure validated
// 🔐 Manifest system locked
// 🧪 Cross-language testing complete
// 🛠️ CLI + UX tools deployed
//
// This file represents a sanctified element of the Nibiru project.
// Do not overwrite without passing new validation pipelines.
//
// 🌐 Created by: Sphinx + Saphira
// 🗓️ Canonized: 2024-03-20
// 🔏 Signature: GSPH-VAULT-003

import { GlyphTier } from '../types/glyphTiers';
import { GlyphColorScheme } from '../types/glyphColors';
import { SpiritGlyph, GlyphMetadata } from '../types/spiritGlyph';
import { isValidGlyphMetadata, isValidSpiritGlyph } from './glyphValidation';
import { User } from '../types/user';

// Core Glyph System Types
export interface GlyphState {
  resonance: number;
  stability: number;
  evolution: number;
  lastUpdate: string;
}

// User-Specific Glyph Data
export interface UserGlyphData extends GlyphMetadata {
  userId: string;
  progression: {
    xp: number;
    level: number;
    achievements: string[];
  };
  state: GlyphState;
}

// Item-Specific Glyph Data
export interface ItemGlyphData extends GlyphMetadata {
  itemId: string;
  marketData?: {
    listed: boolean;
    price?: number;
    currency?: string;
  };
  state: GlyphState;
}

// System-Level Glyph Data
export interface SystemGlyphData extends GlyphMetadata {
  systemId: string;
  permissions: string[];
  state: GlyphState;
}

// Unified Glyph Type
export type UnifiedGlyph = SpiritGlyph & {
  data: UserGlyphData | ItemGlyphData | SystemGlyphData;
};

// Tier-Specific Interfaces
export interface UserGlyph extends GlyphMetadata {
  tier: 'USER';
  userId: string;
  progression: {
    xp: number;
    level: number;
    achievements: string[];
  };
}

export interface ItemGlyph extends GlyphMetadata {
  tier: 'ITEM';
  itemId: string;
  creatorId: string;
  spiritZipHash?: string;
}

export interface SystemGlyph extends GlyphMetadata {
  tier: 'SYSTEM';
  purpose: 'TRANSACTION' | 'EVENT' | 'ACHIEVEMENT';
  parentIds: string[]; // References to User/Item glyphs
}

// Tier Type Definition
export type GlyphTierType = 'USER' | 'ITEM' | 'SYSTEM';

// Access Control Interface
export interface GlyphAccess {
  canView: boolean;
  canModify: boolean;
  canTransfer: boolean;
  requiredTier?: GlyphTier;
}

// Core Validation Functions
export const validateGlyphAccess = (glyph: GlyphMetadata, user?: User): GlyphAccess => {
  // Default to view-only for unauthed
  if (!user) {
    return {
      canView: true,
      canModify: false,
      canTransfer: false
    };
  }

  switch (glyph.tier) {
    case 'USER':
      return {
        canView: true,
        canModify: (glyph as UserGlyph).userId === user.id,
        canTransfer: false
      };
    case 'ITEM':
      return {
        canView: true,
        canModify: (glyph as ItemGlyph).creatorId === user.id,
        canTransfer: (glyph as ItemGlyph).creatorId === user.id
      };
    case 'SYSTEM':
      return {
        canView: true,
        canModify: false,
        canTransfer: false
      };
    default:
      return {
        canView: false,
        canModify: false,
        canTransfer: false
      };
  }
};

// SpiritZip Integration
export const validateSpiritZipGlyph = (glyph: UnifiedGlyph): boolean => {
  if (!isValidSpiritGlyph(glyph)) return false;
  
  // Additional validation for specific glyph types
  if ('userId' in glyph.data) {
    return validateUserGlyph(glyph as UnifiedGlyph & { data: UserGlyphData });
  }
  if ('itemId' in glyph.data) {
    return validateItemGlyph(glyph as UnifiedGlyph & { data: ItemGlyphData });
  }
  if ('systemId' in glyph.data) {
    return validateSystemGlyph(glyph as UnifiedGlyph & { data: SystemGlyphData });
  }
  
  return false;
};

// Type-specific validation functions
const validateUserGlyph = (glyph: UnifiedGlyph & { data: UserGlyphData }): boolean => {
  return (
    glyph.tier >= GlyphTier.COMMON &&
    glyph.tier <= GlyphTier.MYTHIC &&
    typeof glyph.data.userId === 'string' &&
    typeof glyph.data.progression.xp === 'number' &&
    typeof glyph.data.progression.level === 'number' &&
    Array.isArray(glyph.data.progression.achievements)
  );
};

const validateItemGlyph = (glyph: UnifiedGlyph & { data: ItemGlyphData }): boolean => {
  return (
    glyph.tier >= GlyphTier.ENHANCED &&
    glyph.tier <= GlyphTier.LEGENDARY &&
    typeof glyph.data.itemId === 'string' &&
    (!glyph.data.marketData || (
      typeof glyph.data.marketData.listed === 'boolean' &&
      (!glyph.data.marketData.price || typeof glyph.data.marketData.price === 'number') &&
      (!glyph.data.marketData.currency || typeof glyph.data.marketData.currency === 'string')
    ))
  );
};

const validateSystemGlyph = (glyph: UnifiedGlyph & { data: SystemGlyphData }): boolean => {
  return (
    glyph.tier >= GlyphTier.RARE &&
    glyph.tier <= GlyphTier.LEGENDARY &&
    typeof glyph.data.systemId === 'string' &&
    Array.isArray(glyph.data.permissions)
  );
};

// Visual Evolution (Separated from Access Logic)
export interface VisualEvolutionParams {
  baseLevel: number;
  achievements: string[];
  activity: number;
  resonance: number;
}

export const calculateVisualLevel = (params: VisualEvolutionParams): number => {
  const achievementBonus = params.achievements.length * 2;
  const activityMultiplier = Math.min(2, 1 + (params.activity / 100));
  const resonanceBonus = params.resonance * 0.5;

  return Math.min(100, Math.floor(
    (params.baseLevel + achievementBonus) * activityMultiplier + resonanceBonus
  ));
};

// Export Constants
export const GLYPH_CONSTANTS = {
  MAX_VISUAL_LEVEL: 100,
  MIN_RESONANCE: 0,
  MAX_RESONANCE: 100,
  TIER_REQUIREMENTS: {
    USER: { minLevel: 0 },
    ITEM: { minLevel: 0 },
    SYSTEM: { minLevel: 50 }
  }
} as const; 