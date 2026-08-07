import type { Location } from './types';

/**
 * Cities are shared by reference so the geo layout can cluster on identity
 * rather than float-comparing coordinates.
 */
const city = (
  name: string,
  country: string,
  cc: string,
  lat: number,
  lon: number
): Location => ({ city: name, country, cc, lat, lon });

export const CITIES = {
  sf: city('San Francisco', 'United States', 'US', 37.7749, -122.4194),
  paloAlto: city('Palo Alto', 'United States', 'US', 37.4419, -122.143),
  mountainView: city('Mountain View', 'United States', 'US', 37.3861, -122.0839),
  sanJose: city('San Jose', 'United States', 'US', 37.3382, -121.8863),
  sanMateo: city('San Mateo', 'United States', 'US', 37.563, -122.3255),
  bellevue: city('Bellevue', 'United States', 'US', 47.6101, -122.2015),
  berkeley: city('Berkeley', 'United States', 'US', 37.8715, -122.273),
  southSf: city('South San Francisco', 'United States', 'US', 37.6547, -122.4077),
  newYork: city('New York', 'United States', 'US', 40.7128, -74.006),
  cambridgeMa: city('Cambridge, MA', 'United States', 'US', 42.3736, -71.1097),
  pittsburgh: city('Pittsburgh', 'United States', 'US', 40.4406, -79.9959),
  seattle: city('Seattle', 'United States', 'US', 47.6062, -122.3321),
  miami: city('Miami', 'United States', 'US', 25.7617, -80.1918),

  london: city('London', 'United Kingdom', 'GB', 51.5072, -0.1276),
  cambridgeUk: city('Cambridge', 'United Kingdom', 'GB', 52.2053, 0.1218),
  paris: city('Paris', 'France', 'FR', 48.8566, 2.3522),
  helsinki: city('Helsinki', 'Finland', 'FI', 60.1699, 24.9384),

  telAviv: city('Tel Aviv', 'Israel', 'IL', 32.0853, 34.7818),
  beijing: city('Beijing', 'China', 'CN', 39.9042, 116.4074),
  shanghai: city('Shanghai', 'China', 'CN', 31.2304, 121.4737),
  tokyo: city('Tokyo', 'Japan', 'JP', 35.6762, 139.6503),
  toronto: city('Toronto', 'Canada', 'CA', 43.6532, -79.3832),
  montreal: city('Montreal', 'Canada', 'CA', 45.5017, -73.5673),
  bengaluru: city('Bengaluru', 'India', 'IN', 12.9716, 77.5946),
} satisfies Record<string, Location>;

export type CityKey = keyof typeof CITIES;
