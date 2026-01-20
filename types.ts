
export enum PredictionType {
  DAILY = 'DAILY',
  HOURLY = 'HOURLY'
}

export enum Season {
  SPRING = 1,
  SUMMER = 2,
  FALL = 3,
  WINTER = 4
}

export enum WeatherSituation {
  CLEAR = 1,
  MIST = 2,
  LIGHT_RAIN = 3,
  HEAVY_RAIN = 4
}

export interface PredictionInputs {
  date: string;
  season: Season;
  weatherSituation: WeatherSituation;
  temperature: number; // Normalized 0-1
  humidity: number;    // Normalized 0-1
  windspeed: number;   // Normalized 0-1
  isWeekend: boolean;
  hour?: number;       // 0-23
}

export interface PredictionResult {
  count: number;
  reasoning: string;
  confidence: number;
  timestamp: string;
  featuresUsed: Record<string, any>;
}
