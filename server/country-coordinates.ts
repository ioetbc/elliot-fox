import type { Coordinates } from "./external-weather";

type CountryData = {
  name: string;
  capital: string;
  coordinates: Coordinates;
};

export const COUNTRY_COORDINATES: Record<string, CountryData> = {
  CA: {
    name: "Canada",
    capital: "Ottawa",
    coordinates: { latitude: 45.4215, longitude: -75.6972 },
  },
  ES: {
    name: "Spain",
    capital: "Madrid",
    coordinates: { latitude: 40.4168, longitude: -3.7038 },
  },
  GB: {
    name: "United Kingdom",
    capital: "London",
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
  },
  AU: {
    name: "Australia",
    capital: "Canberra",
    coordinates: { latitude: -35.2809, longitude: 149.13 },
  },
  EG: {
    name: "Egypt",
    capital: "Cairo",
    coordinates: { latitude: 30.0444, longitude: 31.2357 },
  },
};

export const DEFAULT_COUNTRY = "GB";

export function getCoordinates(countryCode: string): CountryData | null {
  const code = countryCode.toUpperCase();
  return COUNTRY_COORDINATES[code] ?? null;
}
