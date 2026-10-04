import React from 'react';
import { ActiveAirThreat } from '../types';
import { Radio, AlertOctagon, Shield, Play, Square, Navigation, Crosshair, Bell } from 'lucide-react';
import { alertSoundService } from '../utils/audioAlert';

interface ThreatRadarSimulatorProps {
  threats: ActiveAirThreat[];
  onStartSimulation: () => void;
  onClearSimulation: () => void;
  isSimulating: boolean;
  onFocusThreat: (threat: ActiveAirThreat) => void;
}

export const ThreatRadarSimulator: React.FC<ThreatRadarSimulatorProps> = ({
  threats,
  onStartSimulation,
  onClearSimulation,
  isSimulating,
  onFocusThreat,
}) => {
  const threatsInside10Mi = threats.filter((t) => t.isInsideTenMileRadius);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>10-Mile Threat Perimeter Radar</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time proximity alert system for airspace within 10.0 miles of Independence Square.
          </p>
        </div>

        {/* Drill Controls */}
        <div className="flex items-center gap-2 text-xs">
          {isSimulating ? (
            <button
              onClick={onClearSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium"
              title="Reset simulation to All Clear"
            >
              <Square className="w-3.5 h-3.5 text-red-400" />
              <span>End Drill / Clear</span>
            </button>
          ) : (
            <button
              onClick={onStartSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 font-medium transition-colors"
              title="Test the 10-mile proximity alarm with an inbound Shahed drone group"
            >
              <Play className="w-3.5 h-3.5 text-red-400" />
              <span>Simulate 10-Mi Threat Drill</span>
            </button>
          )}
        </div>
      </div>

      {/* Threats Feed */}
      {threats.length === 0 ? (
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-emerald-300">Kyiv Perimeter All Clear</div>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No active hostile air targets currently tracked inside or approaching the 10-mile Independence Square defense ring.
            Use "Simulate 10-Mi Threat Drill" above anytime to test audio sirens and alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {threats.map((threat) => {
            const isInside = threat.isInsideTenMileRadius;

            return (
              <div
                key={threat.id}
                className={`p-4 rounded-xl border transition-all ${
                  isInside
                    ? 'bg-red-950/70 border-red-700 shadow-md ring-1 ring-red-500/50 animate-pulse'
                    : 'bg-zinc-950 border-amber-800/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                          isInside ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {isInside ? '🔴 INSIDE 10-MILE RADIUS' : '🟡 APPROACHING PERIMETER'}
                      </span>
                      <span className="font-bold text-white text-xs">{threat.callsign}</span>
                    </div>

                    <div className="text-xs text-zinc-300 mt-1">
                      Corridor: <strong>{threat.approachCorridor}</strong> · Speed: <strong>{threat.speedKmh} km/h</strong> · Alt: <strong>{threat.altitudeMeters}m</strong>
                    </div>
                  </div>

                  {/* Distance & ETA */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-base font-extrabold ${isInside ? 'text-red-400' : 'text-amber-400'}`}>
                        {threat.distanceMilesFromMaidan} miles
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {threat.distanceKmFromMaidan} km from Maidan
                      </div>
                    </div>

                    <button
                      onClick={() => onFocusThreat(threat)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
                      title="Focus on Map"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress / ETA Bar */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300">
                  <div>
                    Status: <strong className={isInside ? 'text-red-300' : 'text-amber-300'}>{threat.status}</strong>
                  </div>
                  <div>
                    {threat.etaToMaidanMinutes !== null && (
                      <span>
                        Estimated arrival to Maidan center:{' '}
                        <strong className="text-white font-bold">~{threat.etaToMaidanMinutes} min</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
