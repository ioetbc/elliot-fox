import {Hono} from "hono";
import apiApp from "../server/index";

type Bindings = {
  ASSETS: Fetcher;
  AMBIENT_WEATHER_API_KEY: string;
  AMBIENT_WEATHER_APPLICATION_KEY: string;
};

const app = new Hono<{Bindings: Bindings}>();

// Mount the API routes
app.route("/", apiApp);

// Serve static assets via ASSETS binding for all other routes
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
