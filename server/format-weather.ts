/**
 * WMO Weather Codes (used by Open-Meteo API)
 *
 * 0  - Clear sky
 * 1  - Mainly clear
 * 2  - Partly cloudy
 * 3  - Overcast
 * 45 - Fog
 * 48 - Depositing rime fog
 * 51 - Drizzle: Light
 * 53 - Drizzle: Moderate
 * 55 - Drizzle: Dense
 * 56 - Freezing drizzle: Light
 * 57 - Freezing drizzle: Dense
 * 61 - Rain: Slight
 * 63 - Rain: Moderate
 * 65 - Rain: Heavy
 * 66 - Freezing rain: Light
 * 67 - Freezing rain: Heavy
 * 71 - Snowfall: Slight
 * 73 - Snowfall: Moderate
 * 75 - Snowfall: Heavy
 * 77 - Snow grains
 * 80 - Rain showers: Slight
 * 81 - Rain showers: Moderate
 * 82 - Rain showers: Violent
 * 85 - Snow showers: Slight
 * 86 - Snow showers: Heavy
 * 95 - Thunderstorm: Slight or moderate
 * 96 - Thunderstorm with slight hail
 * 99 - Thunderstorm with heavy hail
 */

export enum WeatherCondition {
  THUNDER = "THUNDER",
  RAIN = "RAIN",
  SUNNY = "SUNNY",
  HEAVY_CLOUD = "HEAVY_CLOUD",
  LIGHT_CLOUD = "LIGHT_CLOUD",
}

const VIDEO_BASE_URL = "https://pub-48d10041c3bf40138ccbe69952ac5fd3.r2.dev";

export const CONDITION_VIDEO_MAP: Record<WeatherCondition, string> = {
  [WeatherCondition.THUNDER]: `${VIDEO_BASE_URL}/THUNDER_COMPRESSED.mp4`,
  [WeatherCondition.RAIN]: `${VIDEO_BASE_URL}/RAIN_COMPRESSED.mp4`,
  [WeatherCondition.SUNNY]: `${VIDEO_BASE_URL}/SUNNY_COMPRESSED.mp4`,
  [WeatherCondition.HEAVY_CLOUD]: `${VIDEO_BASE_URL}/HEAVY_CLOUD_COMPRESSED.mp4`,
  [WeatherCondition.LIGHT_CLOUD]: `${VIDEO_BASE_URL}/LIGH_CLOUD_COMPRESSED.mp4`,
};

// WMO Weather Codes mapping
// https://open-meteo.com/en/docs#weathervariables
function weatherCodeToCondition(code: number): WeatherCondition {
  switch (true) {
    // 95, 96, 99: Thunderstorm
    case code >= 95:
      return WeatherCondition.THUNDER;

    // Drizzle, rain, rain showers, snow
    case (code >= 51 && code <= 67) ||
      (code >= 80 && code <= 82) ||
      (code >= 71 && code <= 77):
      return WeatherCondition.RAIN;

    // Clear sky, mainly clear
    case code === 0 || code === 1:
      return WeatherCondition.SUNNY;

    // Overcast, fog
    case code === 3 || code >= 45:
      return WeatherCondition.HEAVY_CLOUD;

    // Partly cloudy (code === 2) or unknown
    default:
      return WeatherCondition.LIGHT_CLOUD;
  }
}

export function formatWeather(weatherCode: number): WeatherCondition {
  return weatherCodeToCondition(weatherCode);
}
