import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { TacticalMap } from './components/TacticalMap';
import { MorningBriefing } from './components/MorningBriefing';
import { StrikeIncidentsList } from './components/StrikeIncidentsList';
import { ThreatRadarSimulator } from './components/ThreatRadarSimulator';
import { WifeSafetyHub } from './components/WifeSafetyHub';
import { NightlySitRep, ActiveAirThreat, StrikeIncident, WifeStatusCheck } from './types';
import { alertSoundService } from './utils/audioAlert';
import { Shield, Bell, Heart, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [sitrep, setSitrep] = useState<NightlySitRep | null>(null);
  const [threats, setThreats] = useState<ActiveAirThreat[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<StrikeIncident | null>(null);
  const [focusedThreat, setFocusedThreat] = useState<ActiveAirThreat | null>(null);

  const [wifeStatus, setWifeStatus] = useState<WifeStatusCheck>({
    status: 'SAFE',
    lastCheckedIn: new Date().toISOString(),
    locationLabel: 'Apartment near Independence Square, Kyiv',
    batteryPercent: 94,
    notes: 'Checked in at 7:15 AM EET. Woke up, safe and sound. Electricity and water working normally.',
  });

  const [isWifeHubOpen, setIsWifeHubOpen] = useState<boolean>(false);
  const [isRefreshingSitRep, setIsRefreshingSitRep] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(false);

  // Track if alarm was already triggered for current breach to avoid repeating constantly
  const prevInside10CountRef = useRef<number>(0);

  // 1. Fetch initial SitRep and Wife Status
  useEffect(() => {
    fetch('/api/sitrep/nightly')
      .then((res) => res.json())
      .then((data) => setSitrep(data))
      .catch((err) => console.error('Error loading sitrep:', err));

    fetch('/api/wife/status')
      .then((res) => res.json())
      .then((data) => setWifeStatus(data))
      .catch((err) => console.error('Error loading wife status:', err));

    // Check browser notification permission
    if ('Notification' in window) {
      setNotificationsAllowed(Notification.permission === 'granted');
    }
  }, []);

  // 2. Poll Active Threats every 2.5 seconds
  useEffect(() => {
    const fetchThreats = () => {
      fetch('/api/threats/live')
        .then((res) => res.json())
        .then((data) => {
          const list: ActiveAirThreat[] = data.threats || [];
          setThreats(list);

          const inside10 = list.filter((t) => t.isInsideTenMileRadius);
          setIsSimulating(list.some((t) => t.callsign.includes('(Simulated Test)')));

          // If a threat just moved into the 10-mile radius, fire the audible breach alarm!
          if (inside10.length > 0 && prevInside10CountRef.current === 0) {
            alertSoundService.playTenMileBreachAlarm(7000);

            // Trigger Desktop Notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              const closest = inside10[0];
              new Notification('🚨 KYIV PERIMETER ALERT: 10-MILE BREACH', {
                body: `Threat detected ${closest.distanceMilesFromMaidan} miles from Independence Square. Check on your wife!`,
                icon: '/favicon.ico',
              });
            }
          }

          prevInside10CountRef.current = inside10.length;
        })
        .catch((err) => console.error('Error fetching live threats:', err));
    };

    fetchThreats();
    const interval = setInterval(fetchThreats, 2500);
    return () => clearInterval(interval);
  }, []);

  // Request Notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsAllowed(permission === 'granted');
      if (permission === 'granted') {
        new Notification('Kyiv Perimeter Alert Service', {
          body: '10-Mile proximity alerts enabled for Independence Square.',
        });
      }
    }
  };

  // 3. Refresh SitRep using live Gemini Search Grounding
  const handleRefreshSitRep = async () => {
    setIsRefreshingSitRep(true);
    try {
      const res = await fetch('/api/sitrep/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.sitrep) {
        setSitrep(data.sitrep);
      }
    } catch (err) {
      console.error('Error refreshing sitrep:', err);
    } finally {
      setIsRefreshingSitRep(false);
    }
  };

  // 4. Drill Simulation triggers
  const handleStartSimulation = async () => {
    try {
      await fetch('/api/threats/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'shahed_approach' }),
      });
      setIsSimulating(true);
    } catch (err) {
      console.error('Error starting simulation:', err);
    }
  };

  const handleClearSimulation = async () => {
    try {
      await fetch('/api/threats/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'clear' }),
      });
      setIsSimulating(false);
      alertSoundService.stopAlarm();
    } catch (err) {
      console.error('Error clearing simulation:', err);
    }
  };

  // 5. Update Wife Check-in status
  const handleUpdateWifeStatus = async (
    newStatus: WifeStatusCheck['status'],
    notes?: string
  ) => {
    try {
      const res = await fetch('/api/wife/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      const data = await res.json();
      if (data.wifeStatus) {
        setWifeStatus(data.wifeStatus);
      }
    } catch (err) {
      console.error('Error updating wife status:', err);
    }
  };

  const threatsInside10 = threats.filter((t) => t.isInsideTenMileRadius);
  const isAlertActive = threatsInside10.length > 0;
  const closestThreat = threats.length > 0
    ? [...threats].sort((a, b) => a.distanceMilesFromMaidan - b.distanceMilesFromMaidan)[0]
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black font-sans">
      {/* Top Header */}
      <Header
        wifeStatus={wifeStatus}
        onOpenWifeHub={() => setIsWifeHubOpen(true)}
        isAlertActive={isAlertActive}
        onRefreshSitRep={handleRefreshSitRep}
        isRefreshingSitRep={isRefreshingSitRep}
        onRunSimulation={isSimulating ? handleClearSimulation : handleStartSimulation}
        isSimulating={isSimulating}
      />

      {/* Real-time Threat Banner */}
      <AlertBanner
        threats={threats}
        onOpenWifeHub={() => setIsWifeHubOpen(true)}
        onFocusThreatOnMap={(threat) => setFocusedThreat(threat)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Permission Request Prompt if not granted */}
        {!notificationsAllowed && 'Notification' in window && (
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Enable browser notifications to receive immediate alerts if threats move inside the 10-mile radius while this tab is in the background.
              </span>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded shadow transition-colors shrink-0 ml-3"
            >
              Enable Alerts
            </button>
          </div>
        )}

        {/* 1. Morning Intelligence SitRep Briefing */}
        {sitrep && (
          <MorningBriefing
            sitrep={sitrep}
            onRefresh={handleRefreshSitRep}
            isRefreshing={isRefreshingSitRep}
          />
        )}

        {/* 2. Tactical Geospatial Radar Map with 10-Mile Perimeter Ring */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 flex items-center gap-2">
              <span>Independence Square Tactical Defense Grid</span>
              <span className="text-[11px] font-normal text-amber-400">· 10-Mile Radius Alert Boundary</span>
            </h2>
          </div>

          <TacticalMap
            incidents={sitrep ? sitrep.kyivSpecificIncidents : []}
            threats={threats}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            focusedThreat={focusedThreat}
          />
        </section>

        {/* 3. Incidents Log & Live 10-Mile Radar Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Overnight Strikes & Debris Falls with Exact Distance */}
          <div>
            <StrikeIncidentsList
              incidents={sitrep ? sitrep.kyivSpecificIncidents : []}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

          {/* Right: Live 10-Mile Perimeter Threat Radar & Drill Simulator */}
          <div>
            <ThreatRadarSimulator
              threats={threats}
              onStartSimulation={handleStartSimulation}
              onClearSimulation={handleClearSimulation}
              isSimulating={isSimulating}
              onFocusThreat={(threat) => setFocusedThreat(threat)}
            />
          </div>
        </div>
      </main>

      {/* Wife Safety & Emergency Check-In Modal */}
      <WifeSafetyHub
        isOpen={isWifeHubOpen}
        onClose={() => setIsWifeHubOpen(false)}
        wifeStatus={wifeStatus}
        onUpdateStatus={handleUpdateWifeStatus}
        nearestThreatDistanceMiles={closestThreat ? closestThreat.distanceMilesFromMaidan : null}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            Kyiv Perimeter · Civil Defense &amp; Morning SitRep Monitor for Independence Square (Maidan Nezalezhnosti)
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>Air Force AFU / KMDA / DSNS</span>
            <span>·</span>
            <span>Maidan Coordinates: 50.4501°N, 30.5234°E</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
