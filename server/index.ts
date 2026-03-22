import {Hono} from "hono";
import {OnsiteWeather, type OnsiteEnv} from "./onsite-weather";
import {ExternalWeather} from "./external-weather";
import {
  getWeatherCondition,
  CONDITION_VIDEO_MAP,
  getOnsiteWeatherCondition,
} from "./get-weather-condition";
import {getCoordinates, DEFAULT_COUNTRY} from "./country-coordinates";

type Bindings = OnsiteEnv;

const api = new Hono<{Bindings: Bindings}>().get("/weather", async (c) => {
  try {
    const lat = c.req.query("lat");
    const long = c.req.query("long");
    const countryCode = c.req.query("country") ?? DEFAULT_COUNTRY;

    // Use direct coordinates if both lat and long are provided
    const coordinates =
      lat && long
        ? {latitude: parseFloat(lat), longitude: parseFloat(long)}
        : (getCoordinates(countryCode) ?? getCoordinates(DEFAULT_COUNTRY)!)
            .coordinates;

    // Only attempt onsite weather for GB
    if (!lat && !long && countryCode === "GB") {
      const onsite = new OnsiteWeather(c.env);
      const onsiteData = await onsite.getWeather();

      if (onsiteData.length > 0) {
        const latestData = onsiteData[0];
        const condition = getOnsiteWeatherCondition(latestData);
        const videoUrl = CONDITION_VIDEO_MAP[condition];

        return c.json({
          videoUrl,
        });
      }
    }

    // Fallback to external weather API
    const external = new ExternalWeather();
    const externalData = await external.getCurrentWeather(coordinates);
    const condition = getWeatherCondition(externalData.weatherCode);
    const videoUrl = CONDITION_VIDEO_MAP[condition];

    return c.json({
      videoUrl,
    });
  } catch (error) {
    return c.json(
      {error: error instanceof Error ? error.message : "Unknown error"},
      500,
    );
  }
});

const app = new Hono<{Bindings: Bindings}>().route("/api", api);

export type AppType = typeof app;

export default app;
