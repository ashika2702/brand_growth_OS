/**
 * BUSINESS BRAIN TYPES
 * Aligned with Prisma schema for Module 1
 */

export interface Client {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  primaryColor?: string;
  brand24ProjectId?: string;
  canvaBrandKitId?: string;
  elevenlabsVoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
  brain?: BusinessBrain;
}

export interface BusinessBrain {
  id: string;
  clientId: string;
  personas: Persona[];
  offers: Offer[];
  salesJourney?: any;
  onlineChannels: string[];
  offlineChannels: string[];
  proofAssets?: any;
  constraints: string[];
  messagingAngles?: any;
  competitorIntel?: any;
  updatedAt: Date;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  painPoints: string[];
  desires: string[];
  blueprint?: {
    name?: string;
    universalGoal?: string;
    steps: {
      name?: string;
      delayDays: number;
      strategy: string;
      goal?: string;
      offerId?: string;
    }[];
  };
}

export interface Offer {
  id: string;
  name: string;
  valueProposition: string;
  price?: string;
  guarantee?: string;
}

/**
 * CONTENT & LEADS (Future Phases)
 */

export interface ContentRequest {
  id: string;
  clientId: string;
  type: string;
  platform: string;
  status: 'requested' | 'briefed' | 'in_production' | 'review' | 'approved' | 'published';
  priorityScore: number;
}

export interface Lead {
  id: string;
  clientId: string;
  name: string;
  email: string;
  stage: string;
  score: number;
}
