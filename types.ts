export enum MetalType {
  GOLD = 'Gold',
  SILVER = 'Silver'
}

export interface DataPoint {
  date: string; // ISO format YYYY-MM-DD for sorting/charts
  displayDate: string; // Original DD/MM/YYYY
  value: number;
}

export interface ChartData {
  gold: DataPoint[];
  silver: DataPoint[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}