import {Hono} from "hono";
import {OnsiteWeather, type OnsiteEnv} from "./onsite-weather";
import {ExternalWeather} from "./external-weather";
import {formatWeather, CONDITION_VIDEO_MAP} from "./format-weather";
import {getCoordinates, DEFAULT_COUNTRY} from "./country-coordinates";

type Bindings = OnsiteEnv;

const api = new Hono<{Bindings: Bindings}>().get("/weather", async (c) => {
  try {
    const countryCode = c.req.query("country") ?? DEFAULT_COUNTRY;

    const countryData =
      getCoordinates(countryCode) ?? getCoordinates(DEFAULT_COUNTRY)!;

    const onsite = new OnsiteWeather(c.env);
    const onsiteData = await onsite.getWeather();

    if (!onsiteData.length) {
      const external = new ExternalWeather();
      const externalData = await external.getCurrentWeather(
        countryData.coordinates,
      );

      const condition = formatWeather(externalData.weatherCode);

      return c.json({
        condition,
        videoUrl: CONDITION_VIDEO_MAP[condition],
      });
    }

    return c.json(onsiteData);
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
