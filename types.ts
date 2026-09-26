
export enum UserRole {
  USER = 'USER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN'
}

export type SupportedLanguage = 'en' | 'ta';
export type Gender = 'male' | 'female' | 'other' | '';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  language: SupportedLanguage;
  voiceEnabled: boolean;
  preferredVoice?: string;
  age?: number;
  dob?: string;
  gender?: Gender;
}

export interface ManipulationZone {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  severity: 'high' | 'medium' | 'low';
  startTime?: number; // start time in seconds (for video/audio)
  endTime?: number; // end time in seconds (for video/audio)
}

export interface ConfidenceScore {
  method: string;
  score: number; // 0-100 probability of AI/manipulation
  status: 'clean' | 'suspicious' | 'manipulated';
}

export interface ForensicReport {
  id: string;
  timestamp: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  authenticityScore: number; // 0 to 100 (Overall human authenticity)
  aiProbability: number;
  tamperDetected: boolean;
  findings: string[];
  manipulationZones?: ManipulationZone[];
  confidenceBreakdown: ConfidenceScore[];
  metadataAnalysis: {
    cameraModel?: string;
    software?: string;
    gps?: string;
    timestamp?: string;
  };
  blockchainHash: string;
  status: 'clean' | 'suspicious' | 'manipulated';
  explanation: string;
  generatorAttribution?: string;
  isOfflineResult?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PreViralAlert {
  id: string;
  title: string;
  description: string;
  threatLevel: ThreatLevel;
  velocity: string; 
  sourceAttribution: {
    platform: string;
    originRegion: string;
    actorGroup?: string;
  };
  impactScore: number; 
  actionableIntel: string[];
  detectedAt: string;
}

export interface HistoryItem extends ForensicReport {
  savedAt: string;
}
