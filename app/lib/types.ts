export interface SKU {
  id: string;
  name: string;
  price: number;
}

export interface LiveRoom {
  id: string;
  name: string;
  videoUrl: string;
  skus: SKU[];
}

export interface Evaluation {
  roomId: string;
  skuId: string;
  evaluatorId: string; // Added this
  videoQualified: 'qualified' | 'unqualified';
  visualQualified: 'qualified' | 'unqualified';
  boardAppearanceCount: number;
  issues: string[];
  otherIssueDesc?: string;
  timestamp: number;
}

export interface RoomSubmission {
  roomId: string;
  submittedAt: number;
}
