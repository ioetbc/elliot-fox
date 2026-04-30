import {Hono} from "hono";
import {OnsiteWeather, type OnsiteEnv} from "./onsite-weather";
import {ExternalWeather} from "./external-weather";
import {
  getWeatherCondition,
  CONDITION_VIDEO_MAP,
  getOnsiteWeatherCondition,
} from "./get-weather-condition";
import {getCoordinates, ONSITE_LOCATION} from "./location-coordinates";

type Bindings = OnsiteEnv;

const api = new Hono<{Bindings: Bindings}>().get("/weather", async (c) => {
  try {
    const location = c.req.query("location");

    if (location === ONSITE_LOCATION) {
      const onsite = new OnsiteWeather(c.env);
      const onsiteData = await onsite.getWeather();

      if (onsiteData.length > 0) {
        const latestData = onsiteData[0];

        const condition = getOnsiteWeatherCondition(latestData);
        const videoUrl = CONDITION_VIDEO_MAP[condition];

        return c.json({
          videoUrl,
          data: {
            type: "ELLIOT_WEATHER_STATION",
            ...latestData,
          },
        });
      }
    }

    const {coordinates} = getCoordinates(location);
    const external = new ExternalWeather();
    const externalData = await external.getCurrentWeather(coordinates);
    const condition = getWeatherCondition(externalData.weatherCode);

    console.log('condition', condition)

    const videoUrl = CONDITION_VIDEO_MAP[condition];

    return c.json({
      videoUrl,
      data: {
        type: "WEATHER_API",
        ...externalData,
        condition
      },
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
