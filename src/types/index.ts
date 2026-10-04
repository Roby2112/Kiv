export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface StrikeIncident {
  id: string;
  timestamp: string; // ISO string or time format
  title: string;
  type: 'shahed_drone' | 'cruise_missile' | 'ballistic_missile' | 'interception_debris' | 'recon_drone' | 'infrastructure_strike';
  locationName: string;
  district?: string;
  coordinates: GeoCoordinate;
  distanceMiles: number; // Computed from Maidan
  distanceKm: number;
  bearing: string; // e.g. "SSW", "NE"
  isInsideTenMileRadius: boolean;
  status: 'intercepted' | 'debris_impact' | 'direct_impact' | 'suppressed_ew' | 'in_flight';
  impactDescription: string;
  casualtiesOrDamage: string;
  airDefenseUnit?: string; // e.g. "Patriot PAC-3", "Mobile Fire Group", "NASAMS"
  verifiedSources: string[];
}

export interface NightlySitRep {
  id: string;
  reportDate: string; // e.g. "October 4, 2026"
  generatedAt: string;
  summaryTitle: string;
  executiveSummary: string;
  maidanSafetyAssessment: {
    safetyLevel: 'SECURE' | 'ADVISORY' | 'ELEVATED_RISK' | 'CRITICAL_ALERT';
    distanceToNearestStrikeMiles: number;
    nearestStrikeLocation: string;
    threatsWithinTenMilesCount: number;
    directMaidanImpact: boolean;
    utilitiesStatus: {
      power: 'NORMAL' | 'EMERGENCY_SHUTDOWNS' | 'SCHEDULED_OUTAGES';
      water: 'NORMAL' | 'LOW_PRESSURE' | 'INTERRUPTED';
      heating: 'OPERATIONAL' | 'DEGRADED';
      metroShelter: 'OPERATING_FULL_SHELTER_MODE' | 'NORMAL_TRANSIT';
    };
    actionableAdvice: string;
  };
  nationalStatistics: {
    totalDronesLaunched: number;
    dronesDowned: number;
    dronesLostEW: number;
    totalMissilesLaunched: number;
    missilesDowned: number;
    regionsTargeted: string[];
    mainAttackDirection: string;
  };
  kyivSpecificIncidents: StrikeIncident[];
  groundingSources?: {
    title: string;
    url: string;
  }[];
}

export interface ActiveAirThreat {
  id: string;
  callsign: string;
  threatType: 'SHAHED_DRONE_GROUP' | 'CRUISE_MISSILE' | 'BALLISTIC_ALERT' | 'KAB_GLIDE_BOMB' | 'UNKNOWN_BOGEY';
  estimatedQuantity?: number;
  coordinates: GeoCoordinate;
  vectorHeadingDeg: number; // 0 - 360
  speedKmh: number;
  altitudeMeters: number;
  distanceMilesFromMaidan: number;
  distanceKmFromMaidan: number;
  isInsideTenMileRadius: boolean;
  etaToTenMileRingMinutes: number | null; // null if already inside or moving away
  etaToMaidanMinutes: number | null;
  detectedAt: string;
  lastUpdated: string;
  status: 'TRACKING_INBOUND' | 'INTERCEPTED' | 'CHANGED_COURSE' | 'IMPACTED' | 'LOST_CONTACT';
  approachCorridor: string; // e.g. "Chernihiv -> Brovary corridor", "South via Vasylkiv"
}

export interface ShelterLocation {
  id: string;
  name: string;
  type: 'metro_station' | 'underground_complex' | 'reinforced_basement';
  coordinates: GeoCoordinate;
  distanceFeetFromMaidan: number;
  distanceMetersFromMaidan: number;
  walkingMinutesFromMaidan: number;
  depthMeters: number;
  capacityPersons: number;
  amenities: string[];
  isOpen24_7: boolean;
  address: string;
}

export interface WifeStatusCheck {
  status: 'SAFE' | 'IN_SHELTER' | 'AWAITING_REPLY' | 'ALERT_SENT';
  lastCheckedIn: string;
  locationLabel: string;
  batteryPercent?: number;
  notes?: string;
}
