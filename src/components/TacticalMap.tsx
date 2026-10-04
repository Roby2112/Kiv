import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MAIDAN_COORDINATES, MAIDAN_AREA_SHELTERS, calculateDistanceMiles, calculateDistanceKm, calculateBearingDeg, bearingToCardinal } from '../utils/geo';
import { StrikeIncident, ActiveAirThreat, GeoCoordinate } from '../types';
import { Shield, Layers, Navigation, Crosshair, MapPin, Eye, Info } from 'lucide-react';

interface TacticalMapProps {
  incidents: StrikeIncident[];
  threats: ActiveAirThreat[];
  selectedIncident: StrikeIncident | null;
  onSelectIncident: (inc: StrikeIncident | null) => void;
  focusedThreat: ActiveAirThreat | null;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  threats,
  selectedIncident,
  onSelectIncident,
  focusedThreat,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups for clean updates
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const threatsLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const ringsLayerRef = useRef<L.LayerGroup | null>(null);
  const caliperLayerRef = useRef<L.LayerGroup | null>(null);

  // UI state for layer toggles
  const [showTenMileRing, setShowTenMileRing] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showOvernightStrikes, setShowOvernightStrikes] = useState<boolean>(true);
  const [filterInsideTenMilesOnly, setFilterInsideTenMilesOnly] = useState<boolean>(false);
  const [caliperActive, setCaliperActive] = useState<boolean>(false);
  const [caliperMeasurement, setCaliperMeasurement] = useState<{
    miles: number;
    km: number;
    bearing: string;
    coord: GeoCoordinate;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Dark tactical basemap (CartoDB Dark Matter)
    const map = L.map(mapContainerRef.current, {
      center: [MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng],
      zoom: 11,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark tile layer for high-contrast tactical situational awareness
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Create Layer Groups
    ringsLayerRef.current = L.layerGroup().addTo(map);
    sheltersLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    threatsLayerRef.current = L.layerGroup().addTo(map);
    caliperLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Click handler for Caliper measurement
    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedCoord: GeoCoordinate = { lat: e.latlng.lat, lng: e.latlng.lng };
      const miles = calculateDistanceMiles(MAIDAN_COORDINATES, clickedCoord);
      const km = calculateDistanceKm(MAIDAN_COORDINATES, clickedCoord);
      const bearing = bearingToCardinal(calculateBearingDeg(MAIDAN_COORDINATES, clickedCoord));

      setCaliperMeasurement({
        miles: parseFloat(miles.toFixed(2)),
        km: parseFloat(km.toFixed(2)),
        bearing,
        coord: clickedCoord,
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Rings (10-mile radius perimeter, 3-mile core, 25-mile buffer)
  useEffect(() => {
    if (!ringsLayerRef.current || !mapInstanceRef.current) return;
    ringsLayerRef.current.clearLayers();

    // 1. Home / Wife Marker at Independence Square
    const homeIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping-slow"></div>
        <div class="relative w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
          ❤️
        </div>
      </div>
    `;

    const homeMarker = L.marker([MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng], {
      icon: L.divIcon({
        className: 'custom-home-pin',
        html: homeIconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
      zIndexOffset: 1000,
    });

    homeMarker.bindPopup(`
      <div class="p-2 text-zinc-900">
        <div class="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase">
          <span>❤️</span>
          <span>Wife's Location · Independence Square</span>
        </div>
        <p class="text-xs text-zinc-700 mt-1 font-medium">Maidan Nezalezhnosti, Khreshchatyk St</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">Coordinates: 50.4501°N, 30.5234°E</p>
        <div class="mt-2 pt-1.5 border-t border-zinc-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
          <span>🛡️</span> All perimeter threat distances are calculated from this exact point.
        </div>
      </div>
    `);

    ringsLayerRef.current.addLayer(homeMarker);

    if (showTenMileRing) {
      // 10-mile critical defense radius (16,093.44 meters)
      const tenMileCircle = L.circle([MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng], {
        radius: 16093.44, // 10 miles in meters
        color: '#dc2626', // Red perimeter ring
        weight: 2.5,
        dashArray: '6, 6',
        fillColor: '#ef4444',
        fillOpacity: 0.04,
      });

      tenMileCircle.bindTooltip('10-Mile Critical Perimeter Ring (16.1 km)', {
        permanent: false,
        direction: 'top',
        className: 'bg-zinc-900 text-white text-xs px-2 py-1 rounded border border-red-600',
      });

      ringsLayerRef.current.addLayer(tenMileCircle);

      // Inner 3-mile core central ring (4,828 meters)
      const threeMileCircle = L.circle([MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng], {
        radius: 4828,
        color: '#f59e0b', // Amber
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#f59e0b',
        fillOpacity: 0.03,
      });

      ringsLayerRef.current.addLayer(threeMileCircle);

      // Outer 25-mile regional warning ring (40,233 meters)
      const twentyFiveMileCircle = L.circle([MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng], {
        radius: 40233,
        color: '#6b7280',
        weight: 1,
        dashArray: '3, 6',
        fillColor: 'transparent',
      });

      ringsLayerRef.current.addLayer(twentyFiveMileCircle);
    }
  }, [showTenMileRing]);

  // Update Shelters Layer
  useEffect(() => {
    if (!sheltersLayerRef.current) return;
    sheltersLayerRef.current.clearLayers();

    if (!showShelters) return;

    MAIDAN_AREA_SHELTERS.forEach((shelter) => {
      const shelterIcon = L.divIcon({
        className: 'shelter-icon',
        html: `
          <div class="w-5 h-5 rounded-full bg-blue-600 border border-white text-white flex items-center justify-center text-[10px] shadow font-bold">
            M
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([shelter.coordinates.lat, shelter.coordinates.lng], {
        icon: shelterIcon,
      });

      marker.bindPopup(`
        <div class="p-2 text-zinc-900 max-w-xs">
          <div class="flex items-center justify-between text-xs font-bold text-blue-700">
            <span>🛡️ ${shelter.name}</span>
            <span class="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">${shelter.depthMeters}m Depth</span>
          </div>
          <p class="text-xs text-zinc-600 mt-1">${shelter.address}</p>
          <div class="grid grid-cols-2 gap-1.5 mt-2 text-[11px] bg-zinc-100 p-1.5 rounded">
            <div>Distance: <strong>${shelter.distanceFeetFromMaidan} ft (${shelter.distanceMetersFromMaidan}m)</strong></div>
            <div>Walk time: <strong>~${shelter.walkingMinutesFromMaidan} min</strong></div>
            <div>Capacity: <strong>${shelter.capacityPersons.toLocaleString()} people</strong></div>
            <div>Status: <strong class="text-emerald-700">Open 24/7</strong></div>
          </div>
          <div class="mt-2 text-[10px] text-zinc-500">
            <strong>Key Features:</strong> ${shelter.amenities.join(', ')}
          </div>
        </div>
      `);

      sheltersLayerRef.current?.addLayer(marker);
    });
  }, [showShelters]);

  // Update Overnight Strike Incidents Layer
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (!showOvernightStrikes) return;

    const incidentsToDisplay = filterInsideTenMilesOnly
      ? incidents.filter((i) => i.isInsideTenMileRadius)
      : incidents;

    incidentsToDisplay.forEach((inc) => {
      const isInside = inc.isInsideTenMileRadius;
      const isSelected = selectedIncident?.id === inc.id;

      // Color based on status and distance
      const bgClass = isInside ? 'bg-amber-600' : 'bg-zinc-700';
      const borderClass = isSelected ? 'border-2 border-white ring-2 ring-amber-400' : 'border border-zinc-900';

      const iconHtml = `
        <div class="w-6 h-6 rounded-full ${bgClass} ${borderClass} shadow-lg flex items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-transform hover:scale-125">
          ${inc.status === 'intercepted' ? '🛡️' : inc.type === 'cruise_missile' ? '🚀' : '💥'}
        </div>
      `;

      const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
        icon: L.divIcon({
          className: 'incident-marker',
          html: iconHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      });

      marker.bindPopup(`
        <div class="p-2 text-zinc-900 max-w-sm">
          <div class="flex items-center justify-between text-xs font-bold ${isInside ? 'text-amber-700' : 'text-zinc-700'}">
            <span>${inc.title}</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-zinc-600 mt-0.5">
            <span>${inc.timestamp}</span>
            <span>·</span>
            <span class="font-semibold ${isInside ? 'text-red-700' : 'text-zinc-700'}">
              ${inc.distanceMiles} mi ${inc.bearing} from Maidan (${isInside ? 'INSIDE 10-MI ZONE' : 'OUTSIDE 10-MI ZONE'})
            </span>
          </div>
          <p class="text-xs text-zinc-700 mt-2 leading-relaxed">${inc.impactDescription}</p>
          <div class="mt-2 text-[11px] bg-zinc-100 p-1.5 rounded space-y-0.5">
            <div>Damage/Casualties: <strong>${inc.casualtiesOrDamage}</strong></div>
            ${inc.airDefenseUnit ? `<div>Air Defense: <strong>${inc.airDefenseUnit}</strong></div>` : ''}
          </div>
          <div class="mt-1.5 text-[10px] text-zinc-500">
            Source: ${inc.verifiedSources.join(', ')}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectIncident(inc);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [incidents, showOvernightStrikes, filterInsideTenMilesOnly, selectedIncident, onSelectIncident]);

  // Update Active Inbound Air Threats Layer
  useEffect(() => {
    if (!threatsLayerRef.current || !mapInstanceRef.current) return;
    threatsLayerRef.current.clearLayers();

    threats.forEach((threat) => {
      const isInside = threat.isInsideTenMileRadius;

      // Draw dashed trajectory line pointing towards Independence Square
      const trajectoryLine = L.polyline(
        [
          [threat.coordinates.lat, threat.coordinates.lng],
          [MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng],
        ],
        {
          color: isInside ? '#ef4444' : '#f59e0b',
          weight: 2,
          dashArray: '4, 8',
          opacity: 0.7,
        }
      );
      threatsLayerRef.current?.addLayer(trajectoryLine);

      // Inbound Threat Icon with heading indicator
      const threatIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full ${isInside ? 'bg-red-500/40 animate-ping' : 'bg-amber-500/30 animate-pulse'}"></div>
          <div class="w-7 h-7 rounded-full ${isInside ? 'bg-red-600' : 'bg-amber-600'} border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-extrabold cursor-pointer">
            ⚠️
          </div>
        </div>
      `;

      const threatMarker = L.marker([threat.coordinates.lat, threat.coordinates.lng], {
        icon: L.divIcon({
          className: 'active-threat-pin',
          html: threatIconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        zIndexOffset: 1200,
      });

      threatMarker.bindPopup(`
        <div class="p-2 text-zinc-900 max-w-xs">
          <div class="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
            <span>🚨 INBOUND AIR THREAT</span>
          </div>
          <div class="text-xs font-bold text-zinc-900 mt-0.5">${threat.callsign}</div>
          <div class="mt-2 text-xs bg-red-50 border border-red-200 p-2 rounded">
            <div class="font-bold text-red-700 text-sm">
              ${threat.distanceMilesFromMaidan} miles to Independence Square
            </div>
            <div class="text-zinc-700 text-[11px] mt-1">
              Corridor: <strong>${threat.approachCorridor}</strong>
            </div>
            <div class="text-zinc-700 text-[11px]">
              Speed: <strong>${threat.speedKmh} km/h</strong> · Alt: <strong>${threat.altitudeMeters}m</strong>
            </div>
            ${
              threat.etaToMaidanMinutes !== null
                ? `<div class="text-red-700 font-semibold text-[11px] mt-1">ETA to Maidan: ~${threat.etaToMaidanMinutes} minutes</div>`
                : ''
            }
          </div>
        </div>
      `);

      threatsLayerRef.current?.addLayer(threatMarker);
    });
  }, [threats]);

  // Recenter / Focus triggers
  const recenterMaidan = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng], 12, {
      duration: 1.2,
    });
  };

  const recenterTenMileView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([MAIDAN_COORDINATES.lat, MAIDAN_COORDINATES.lng], 10, {
      duration: 1.2,
    });
  };

  useEffect(() => {
    if (focusedThreat && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([focusedThreat.coordinates.lat, focusedThreat.coordinates.lng], 12, {
        duration: 1,
      });
    }
  }, [focusedThreat]);

  useEffect(() => {
    if (selectedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedIncident.coordinates.lat, selectedIncident.coordinates.lng], 13, {
        duration: 1,
      });
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner flex flex-col">
      {/* Top Map Bar / Controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Quick Layers & Scope Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 rounded-lg shadow-lg pointer-events-auto text-xs">
          <button
            onClick={() => setShowTenMileRing(!showTenMileRing)}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              showTenMileRing
                ? 'bg-red-950 text-red-200 border border-red-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            10-Mi Ring
          </button>
          <button
            onClick={() => setShowOvernightStrikes(!showOvernightStrikes)}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              showOvernightStrikes
                ? 'bg-amber-950 text-amber-200 border border-amber-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overnight Strikes ({incidents.length})
          </button>
          <button
            onClick={() => setFilterInsideTenMilesOnly(!filterInsideTenMilesOnly)}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterInsideTenMilesOnly
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            &lt; 10-Mi Only
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              showShelters
                ? 'bg-blue-950 text-blue-200 border border-blue-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Metro Shelters
          </button>
        </div>

        {/* Right: Recenter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 rounded-lg shadow-lg pointer-events-auto text-xs">
          <button
            onClick={recenterMaidan}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Center on Independence Square"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Maidan Center</span>
          </button>
          <button
            onClick={recenterTenMileView}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="View entire 10-mile defense boundary"
          >
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span>Full 10-Mi Perimeter</span>
          </button>
          <button
            onClick={() => {
              setCaliperActive(!caliperActive);
              if (caliperActive) setCaliperMeasurement(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              caliperActive
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Click anywhere on the map to measure exact distance and bearing from Independence Square"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Measure Distance</span>
          </button>
        </div>
      </div>

      {/* Caliper Floating HUD Banner */}
      {caliperActive && (
        <div className="absolute bottom-4 left-4 z-[1000] p-2.5 bg-zinc-900/95 border border-emerald-600/80 rounded-lg shadow-xl text-xs text-zinc-200 max-w-sm pointer-events-auto">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Crosshair className="w-4 h-4" />
            <span>Distance Caliper to Independence Square</span>
          </div>
          {caliperMeasurement ? (
            <div className="mt-1 text-xs">
              Distance: <strong className="text-white text-sm">{caliperMeasurement.miles} miles</strong> ({caliperMeasurement.km} km){' '}
              <span className="text-zinc-400">Heading: {caliperMeasurement.bearing}</span>
              <div className="mt-0.5 text-[11px] font-medium text-emerald-300">
                {caliperMeasurement.miles <= 10.0 ? '⚠️ INSIDE 10-Mile Perimeter Zone' : '✓ OUTSIDE 10-Mile Perimeter Zone'}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400 mt-1">
              Click anywhere on the map to calculate exact direct-line distance to your wife's location at Maidan.
            </p>
          )}
        </div>
      )}

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Bottom Legend */}
      <div className="p-2 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-400 flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-zinc-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Wife / Maidan (0.0 mi)
          </span>
          <span className="flex items-center gap-1 text-zinc-300 font-medium">
            <span className="w-3.5 h-0.5 bg-red-500 border-dashed border-t border-red-500 inline-block"></span> 10-Mile Radius Limit
          </span>
          <span className="flex items-center gap-1 text-zinc-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Strike / Debris Point
          </span>
          <span className="flex items-center gap-1 text-zinc-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Metro Deep Shelter
          </span>
          {threats.length > 0 && (
            <span className="flex items-center gap-1 text-red-400 font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Active Inbound Bogey
            </span>
          )}
        </div>
        <div className="text-zinc-500">
          Source: General Staff AFU & State Emergency Service
        </div>
      </div>
    </div>
  );
};
