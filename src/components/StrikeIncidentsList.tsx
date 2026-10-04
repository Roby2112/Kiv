import React, { useState } from 'react';
import { StrikeIncident } from '../types';
import { Shield, MapPin, ArrowUpRight, Crosshair, AlertCircle, CheckCircle2, Filter } from 'lucide-react';

interface StrikeIncidentsListProps {
  incidents: StrikeIncident[];
  selectedIncident: StrikeIncident | null;
  onSelectIncident: (inc: StrikeIncident) => void;
}

export const StrikeIncidentsList: React.FC<StrikeIncidentsListProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'ten_miles_only' | 'intercepted' | 'debris'>('all');
  const [sortMode, setSortMode] = useState<'proximity' | 'time'>('proximity');

  // Filter
  const filtered = incidents.filter((inc) => {
    if (filterMode === 'ten_miles_only') return inc.isInsideTenMileRadius;
    if (filterMode === 'intercepted') return inc.status === 'intercepted';
    if (filterMode === 'debris') return inc.status === 'debris_impact';
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'proximity') {
      return a.distanceMiles - b.distanceMiles;
    }
    return b.timestamp.localeCompare(a.timestamp);
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
      {/* Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Kyiv Strike &amp; Debris Log</span>
            <span className="text-xs font-normal text-zinc-400">({incidents.length} recorded events)</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Exact distance and compass bearing computed relative to Independence Square (Maidan).
          </p>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setSortMode('proximity')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                sortMode === 'proximity'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Closest to Maidan
            </button>
            <button
              onClick={() => setSortMode('time')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                sortMode === 'time'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Chronological
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto text-xs border-b border-zinc-800/80">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterMode === 'all'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          All Locations ({incidents.length})
        </button>
        <button
          onClick={() => setFilterMode('ten_miles_only')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterMode === 'ten_miles_only'
              ? 'bg-red-950 border border-red-700 text-red-200 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Within 10-Mile Zone ({incidents.filter((i) => i.isInsideTenMileRadius).length})
        </button>
        <button
          onClick={() => setFilterMode('intercepted')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterMode === 'intercepted'
              ? 'bg-emerald-950 border border-emerald-700 text-emerald-200 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Clean Interceptions
        </button>
        <button
          onClick={() => setFilterMode('debris')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterMode === 'debris'
              ? 'bg-amber-950 border border-amber-700 text-amber-200 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Debris Falls
        </button>
      </div>

      {/* Incidents Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1 max-h-[520px]">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No incidents matching the active filter.
          </div>
        ) : (
          sorted.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isInside = inc.isInsideTenMileRadius;

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : isInside
                    ? 'bg-zinc-950/80 border-amber-900/60 hover:bg-zinc-800/40 hover:border-amber-700'
                    : 'bg-zinc-950/40 border-zinc-800 hover:bg-zinc-800/30'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{inc.title}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                      <span>{inc.timestamp}</span>
                      <span>·</span>
                      <span className="text-zinc-300 font-medium">{inc.locationName}</span>
                    </div>
                  </div>

                  {/* Distance Caliper Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        isInside
                          ? 'bg-red-950 border border-red-700/80 text-red-200'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Crosshair className="w-3 h-3 text-amber-400" />
                      {inc.distanceMiles} mi {inc.bearing}
                    </span>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {isInside ? '⚠️ Inside 10-Mi Ring' : 'Outside 10-Mi Ring'} ({inc.distanceKm} km)
                    </div>
                  </div>
                </div>

                {/* Details */}
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {inc.impactDescription}
                </p>

                {/* Footer metadata */}
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Damage:</span>
                    <span className="text-zinc-200 font-medium">{inc.casualtiesOrDamage}</span>
                  </div>

                  {inc.airDefenseUnit && (
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Shield className="w-3 h-3" />
                      <span>{inc.airDefenseUnit}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
