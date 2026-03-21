import {Hono} from "hono";
import {serveStatic} from "hono/cloudflare-pages";
import apiApp from "../server/index";

type Bindings = {
  AMBIENT_WEATHER_API_KEY: string;
  AMBIENT_WEATHER_APPLICATION_KEY: string;
};

const app = new Hono<{Bindings: Bindings}>();

// Mount the API routes
app.route("/", apiApp);

// Serve static assets (built frontend) for all other routes
app.get("*", serveStatic());

export default app;
