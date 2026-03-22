const API_URL = "https://api.ambientweather.net/v1/devices/";

export type WeatherData = {
  dateutc?: number;
  tempf?: number;
  humidity?: number;
  windspeedmph?: number;
  windgustmph?: number;
  maxdailygust?: number;
  winddir?: number;
  uv?: number;
  solarradiation?: number;
  hourlyrainin?: number;
  eventrainin?: number;
  dailyrainin?: number;
  weeklyrainin?: number;
  monthlyrainin?: number;
  yearlyrainin?: number;
  totalrainin?: number;
  battout?: number;
  tempinf?: number;
  humidityin?: number;
  baromrelin?: number;
  baromabsin?: number;
  feelsLike?: number;
  dewPoint?: number;
  feelsLikein?: number;
  dewPointin?: number;
  tz?: string;
  date?: string;
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
    const url = `${API_URL}?apiKey=${this.apiKey}&applicationKey=${this.applicationKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const devices: Device[] = await response.json();

    return devices
      .map((d) => d.lastData)
      .filter(
        (data): data is WeatherData =>
          data !== undefined && Object.keys(data).length > 0,
      );
  }
}
