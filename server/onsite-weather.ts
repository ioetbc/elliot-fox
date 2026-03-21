const API_URL = "https://api.ambientweather.net/v1/devices/";

export type WeatherData = {
  tempf?: number;
  humidity?: number;
  windspeedmph?: number;
  winddir?: number;
  baromrelin?: number;
  dailyrainin?: number;
  dateutc?: number;
  [key: string]: unknown;
};

export type Device = {
  macAddress: string;
  info: {
    name: string;
    location?: string;
  };
  lastData?: WeatherData;
};

export type OnsiteEnv = {
  AMBIENT_WEATHER_API_KEY: string;
  AMBIENT_WEATHER_APPLICATION_KEY: string;
};

export class OnsiteWeather {
  private apiKey: string;
  private applicationKey: string;

  constructor(env: OnsiteEnv) {
    this.apiKey = env.AMBIENT_WEATHER_API_KEY;
    this.applicationKey = env.AMBIENT_WEATHER_APPLICATION_KEY;
  }

  async getWeather(): Promise<WeatherData[]> {
    // Skip if no credentials configured
    if (!this.apiKey || !this.applicationKey) {
      return [];
    }

    try {
      const url = `${API_URL}?apiKey=${this.apiKey}&applicationKey=${this.applicationKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        // Return empty to fall back to external weather
        console.error(`Ambient Weather API error: ${response.status}`);
        return [];
      }

      const devices: Device[] = await response.json();

      return devices
        .map((d) => d.lastData)
        .filter(
          (data): data is WeatherData =>
            data !== undefined && Object.keys(data).length > 0,
        );
    } catch (error) {
      // Return empty to fall back to external weather
      console.error("Ambient Weather API failed:", error);
      return [];
    }
  }
}
