import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Navigation, Heart, ArrowRight } from 'lucide-react';
import { ActiveAirThreat } from '../types';

interface AlertBannerProps {
  threats: ActiveAirThreat[];
  onOpenWifeHub: () => void;
  onFocusThreatOnMap?: (threat: ActiveAirThreat) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  threats,
  onOpenWifeHub,
  onFocusThreatOnMap,
}) => {
  const threatsInside10Miles = threats.filter((t) => t.isInsideTenMileRadius);
  const threatsApproaching = threats.filter((t) => !t.isInsideTenMileRadius && t.distanceMilesFromMaidan <= 25.0);

  // 1. Critical Red Alert: Threat Inside 10-Mile Radius of Independence Square!
  if (threatsInside10Miles.length > 0) {
    const closest = [...threatsInside10Miles].sort(
      (a, b) => a.distanceMilesFromMaidan - b.distanceMilesFromMaidan
    )[0];

    return (
      <div className="bg-red-950 border-y border-red-700/80 text-red-100 px-4 py-3 relative overflow-hidden shadow-lg animate-pulse">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-900 rounded-lg shrink-0 mt-0.5 border border-red-500">
              <AlertOctagon className="w-6 h-6 text-red-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wide text-white text-sm">
                  CRITICAL DEFENSE ALERT · THREAT INSIDE 10-MILE RADIUS
                </span>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-xs">
                  {closest.distanceMilesFromMaidan} MILES FROM MAIDAN
                </span>
              </div>
              <p className="text-xs text-red-200 mt-1">
                <strong>{closest.callsign}</strong> ({closest.threatType.replace(/_/g, ' ')}) detected at{' '}
                {closest.distanceMilesFromMaidan} mi ({closest.distanceKmFromMaidan} km) from Independence Square.
                {closest.etaToMaidanMinutes !== null && ` Estimated ETA to Maidan center: ~${closest.etaToMaidanMinutes} min.`}{' '}
                Immediate underground shelter protocol recommended for Khreshchatyk / Maidan area.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {onFocusThreatOnMap && (
              <button
                onClick={() => onFocusThreatOnMap(closest)}
                className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 border border-red-600 rounded-md text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Track on Map
              </button>
            )}
            <button
              onClick={onOpenWifeHub}
              className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-950 rounded-md text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              Check on Wife Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Proximity Warning: Threat within 10-25 miles of Kyiv approaches
  if (threatsApproaching.length > 0) {
    const closest = [...threatsApproaching].sort(
      (a, b) => a.distanceMilesFromMaidan - b.distanceMilesFromMaidan
    )[0];

    return (
      <div className="bg-amber-950/90 border-y border-amber-700/80 text-amber-100 px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-900/90 rounded-lg shrink-0 mt-0.5 border border-amber-600">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-200 text-xs uppercase tracking-wider">
                  Air Threat Approaching Kyiv Corridor
                </span>
                <span className="text-xs font-semibold text-amber-300">
                  {closest.distanceMilesFromMaidan} miles to Independence Square
                </span>
              </div>
              <p className="text-xs text-amber-300/90 mt-0.5">
                {closest.callsign} ({closest.approachCorridor}) heading towards Kyiv. Approx.{' '}
                {closest.etaToTenMileRingMinutes !== null ? `${closest.etaToTenMileRingMinutes} min to 10-mile perimeter ring.` : 'closing distance.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {onFocusThreatOnMap && (
              <button
                onClick={() => onFocusThreatOnMap(closest)}
                className="px-3 py-1 bg-amber-900 hover:bg-amber-800 border border-amber-600 rounded text-xs font-medium text-amber-100 flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                View Vector
              </button>
            )}
            <button
              onClick={onOpenWifeHub}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Heart className="w-3 h-3 text-rose-800 fill-rose-800" />
              Notify Wife
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. All Clear / Normal Perimeter Watch
  return (
    <div className="bg-zinc-900/90 border-y border-zinc-800 text-zinc-300 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-emerald-300 font-semibold">10-Mile Perimeter Clear:</strong> No active inbound
            air threats detected within 10 miles of Independence Square. Air defense batteries on continuous combat watch.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-zinc-400">
          <span>Maidan Metro Shelter: <strong className="text-zinc-200">Open 24/7</strong></span>
          <span aria-hidden="true">·</span>
          <span>DTEK Power Grid: <strong className="text-zinc-200">Stable</strong></span>
        </div>
      </div>
    </div>
  );
};
