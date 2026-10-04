import { GeoCoordinate, ShelterLocation } from '../types';

// Maidan Nezalezhnosti (Independence Square), Kyiv
export const MAIDAN_COORDINATES: GeoCoordinate = {
  lat: 50.4501,
  lng: 30.5234,
};

export const TEN_MILES_IN_KM = 16.09344;
export const TEN_MILES_IN_METERS = 16093.44;

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates distance between two coordinates in miles
 */
export function calculateDistanceMiles(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  return calculateDistanceKm(coord1, coord2) * 0.621371;
}

/**
 * Calculates compass bearing from coord1 to coord2 (in degrees 0-360)
 */
export function calculateBearingDeg(from: GeoCoordinate, to: GeoCoordinate): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Converts degrees into 16-point cardinal direction string
 */
export function bearingToCardinal(deg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Helper to compute distance and bearing from Maidan
 */
export function getRelativePositionToMaidan(coord: GeoCoordinate) {
  const miles = calculateDistanceMiles(MAIDAN_COORDINATES, coord);
  const km = calculateDistanceKm(MAIDAN_COORDINATES, coord);
  const bearingDeg = calculateBearingDeg(MAIDAN_COORDINATES, coord);
  const cardinal = bearingToCardinal(bearingDeg);
  const isInsideTenMiles = miles <= 10.0;

  return {
    miles: parseFloat(miles.toFixed(2)),
    km: parseFloat(km.toFixed(2)),
    bearingDeg: Math.round(bearingDeg),
    bearing: cardinal,
    isInsideTenMiles,
  };
}

/**
 * Deep underground bomb shelters in the immediate vicinity of Independence Square
 */
export const MAIDAN_AREA_SHELTERS: ShelterLocation[] = [
  {
    id: 'shelter-maidan-metro',
    name: 'Maidan Nezalezhnosti Metro Station',
    type: 'metro_station',
    coordinates: { lat: 50.4497, lng: 30.5245 },
    distanceFeetFromMaidan: 150,
    distanceMetersFromMaidan: 45,
    walkingMinutesFromMaidan: 1,
    depthMeters: 60,
    capacityPersons: 8500,
    amenities: ['Reinforced Blast Doors', 'Backup Generators', 'Filtered Ventilation', 'Drinkable Water Fountain', 'First Aid Post', 'Wi-Fi & Mobile Repeater'],
    isOpen24_7: true,
    address: 'Maidan Nezalezhnosti, Khreshchatyk St',
  },
  {
    id: 'shelter-khreshchatyk-metro',
    name: 'Khreshchatyk Metro Station (Linked to Maidan)',
    type: 'metro_station',
    coordinates: { lat: 50.4475, lng: 30.5228 },
    distanceFeetFromMaidan: 850,
    distanceMetersFromMaidan: 260,
    walkingMinutesFromMaidan: 3,
    depthMeters: 65,
    capacityPersons: 12000,
    amenities: ['Underground Transfer Tunnel to Maidan', 'Medical Station', 'Backup Power', 'Infant Care Area', 'Toilets', 'Continuous Police Patrol'],
    isOpen24_7: true,
    address: 'Khreshchatyk St, 19',
  },
  {
    id: 'shelter-globus-complex',
    name: 'Globus Underground Complex (Lower Sub-levels)',
    type: 'underground_complex',
    coordinates: { lat: 50.4503, lng: 30.5229 },
    distanceFeetFromMaidan: 200,
    distanceMetersFromMaidan: 60,
    walkingMinutesFromMaidan: 1,
    depthMeters: 14,
    capacityPersons: 3500,
    amenities: ['Subterranean Concrete Core', 'Power Outlets', 'Emergency Exits to Khreshchatyk', 'Direct access from Independence Square pavement'],
    isOpen24_7: true,
    address: 'Maidan Nezalezhnosti, 1',
  },
  {
    id: 'shelter-teatralna-metro',
    name: 'Teatralna Metro Station',
    type: 'metro_station',
    coordinates: { lat: 50.4452, lng: 30.5181 },
    distanceFeetFromMaidan: 2150,
    distanceMetersFromMaidan: 650,
    walkingMinutesFromMaidan: 7,
    depthMeters: 70,
    capacityPersons: 9000,
    amenities: ['Deep Pylon Construction', 'Interconnection with Zoloti Vorota', 'Autonomous Ventilation', 'Emergency Power Supply'],
    isOpen24_7: true,
    address: 'Bohdana Khmelnytskoho St, 1',
  },
  {
    id: 'shelter-zoloti-vorota-metro',
    name: 'Zoloti Vorota Metro Station (Deepest Shelter Hub)',
    type: 'metro_station',
    coordinates: { lat: 50.4468, lng: 30.5133 },
    distanceFeetFromMaidan: 2750,
    distanceMetersFromMaidan: 840,
    walkingMinutesFromMaidan: 9,
    depthMeters: 96,
    capacityPersons: 11000,
    amenities: ['Ultra-Deep Strategic Nuclear-Grade Shelter (96m)', 'Full Hermetic Seals', 'Massive Capacity', 'Continuous Cell Coverage'],
    isOpen24_7: true,
    address: 'Volodymyrska St, 40A',
  }
];
