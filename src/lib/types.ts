export type FloodRisk = "low" | "moderate" | "high" | "critical";

export interface FloodSensor {
  id: number;
  name: string;
  coordinates: [number, number]; 
  risk: FloodRisk;
  waterLevel: number;
}