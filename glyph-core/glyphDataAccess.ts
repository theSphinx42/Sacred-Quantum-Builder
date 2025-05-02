import { GlyphTier } from '../types/glyphTiers';
import { UnifiedGlyph } from './identityInvocation';
import { SpiritZipManifest } from '../types/spiritZipIntegration';

export interface GlyphData {
  id: string;
  tier: GlyphTier;
  type: 'User' | 'Item' | 'System';
  isPublic: boolean;
  creatorId?: string;
  signature: string;
  resonanceLevel: number;
  quantumState: string;
  lastEvolution: Date;
  spiritZipManifest?: SpiritZipManifest;
}

// Convert database glyph to UnifiedGlyph format
function toUnifiedGlyph(data: GlyphData): UnifiedGlyph {
  return {
    id: data.id,
    tier: data.tier,
    type: data.type,
    signature: data.signature,
    data: {
      resonanceLevel: data.resonanceLevel,
      quantumState: data.quantumState,
      lastEvolution: data.lastEvolution.toISOString()
    }
  };
}

// Fetch glyph data from the database
export async function getGlyphById(id: string): Promise<GlyphData | null> {
  try {
    // TODO: Replace with actual database call
    const response = await fetch(`/api/internal/glyph/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch glyph: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      ...data,
      lastEvolution: new Date(data.lastEvolution)
    };
  } catch (error) {
    console.error('Error fetching glyph:', error);
    return null;
  }
} 