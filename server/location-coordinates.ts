import type {Coordinates} from "./external-weather";

type LocationData = {
  label: string;
  coordinates: Coordinates;
};

export const ONSITE_LOCATION = "onsite";

export const LOCATION_COORDINATES: Record<string, LocationData> = {
  london: {
    label: "London",
    coordinates: {latitude: 51.5074, longitude: -0.1278},
  },
  ottawa: {
    label: "Ottawa",
    coordinates: {latitude: 45.4215, longitude: -75.6972},
  },
  madrid: {
    label: "Madrid",
    coordinates: {latitude: 40.4168, longitude: -3.7038},
  },
  canberra: {
    label: "Canberra",
    coordinates: {latitude: -35.2809, longitude: 149.13},
  },
  cairo: {
    label: "Cairo",
    coordinates: {latitude: 30.0444, longitude: 31.2357},
  },
  lowestoft: {
    label: "Lowestoft",
    coordinates: {latitude: 52.4759, longitude: 1.7521},
  },
  "canary-wharf": {
    label: "Canary Wharf",
    coordinates: {latitude: 51.5054, longitude: -0.0235},
  },
  redruth: {
    label: "Redruth",
    coordinates: {latitude: 50.2329, longitude: -5.2236},
  },
};

export const DEFAULT_LOCATION = "london";

export function getCoordinates(location?: string): LocationData {
  const key = location?.toLowerCase();
  return key && key in LOCATION_COORDINATES
    ? LOCATION_COORDINATES[key]
    : LOCATION_COORDINATES[DEFAULT_LOCATION];
}
