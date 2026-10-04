import React, { useState, useEffect } from 'react';
import { Shield, Volume2, VolumeX, Bell, AlertTriangle, RefreshCw, Heart, Radio, MapPin, Clock } from 'lucide-react';
import { alertSoundService } from '../utils/audioAlert';
import { WifeStatusCheck } from '../types';

interface HeaderProps {
  wifeStatus: WifeStatusCheck;
  onOpenWifeHub: () => void;
  isAlertActive: boolean;
  onRefreshSitRep: () => void;
  isRefreshingSitRep: boolean;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wifeStatus,
  onOpenWifeHub,
  isAlertActive,
  onRefreshSitRep,
  isRefreshingSitRep,
  onRunSimulation,
  isSimulating,
}) => {
  const [kyivTime, setKyivTime] = useState<string>('');
  const [kyivDate, setKyivDate] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(alertSoundService.getIsMuted());
  const [volume, setVolume] = useState<number>(0.8);
  const [showSoundSettings, setShowSoundSettings] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setKyivTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Kyiv',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now)
      );
      setKyivDate(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Kyiv',
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    alertSoundService.setMuted(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    alertSoundService.setVolume(val);
  };

  const testCivilSiren = () => {
    alertSoundService.playCivilDefenseSiren(4000);
  };

  const testBreachAlarm = () => {
    alertSoundService.playTenMileBreachAlarm(3500);
  };

  const stopAllAudio = () => {
    alertSoundService.stopAlarm();
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Location Anchor */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/80">
            <Shield className="w-5 h-5 text-amber-400" />
            {isAlertActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                KYIV PERIMETER
                <span className="text-xs font-normal text-zinc-400">· Maidan 10-Mile Threat & Strike Watch</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-amber-300 font-medium">
                <MapPin className="w-3 h-3" />
                Independence Square (50.4501°N, 30.5234°E)
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                Kyiv Time: <strong className="text-zinc-200">{kyivTime || '...'}</strong> ({kyivDate})
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Wife Quick Status & Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Wife Status Pill Button */}
          <button
            onClick={onOpenWifeHub}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              wifeStatus.status === 'SAFE'
                ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-200 hover:bg-emerald-900/60'
                : wifeStatus.status === 'IN_SHELTER'
                ? 'bg-blue-950/60 border-blue-700/70 text-blue-200 hover:bg-blue-900/60'
                : 'bg-amber-950/60 border-amber-700/70 text-amber-200 hover:bg-amber-900/60'
            }`}
            title="Open Wife Safety & Emergency Check-In Hub"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Wife at Maidan:</span>
            <span className="font-semibold underline underline-offset-2">
              {wifeStatus.status === 'SAFE' ? 'Safe' : wifeStatus.status === 'IN_SHELTER' ? 'In Shelter' : 'Awaiting Reply'}
            </span>
          </button>

          {/* Sound Controls Button */}
          <div className="relative">
            <button
              onClick={() => setShowSoundSettings(!showSoundSettings)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isMuted
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  : 'bg-zinc-800 border-zinc-600 text-zinc-100 hover:bg-zinc-700'
              }`}
              title="10-Mile Proximity Alarm Settings"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isMuted ? 'Muted' : 'Alarm Active'}</span>
            </button>

            {/* Sound Dropdown Popover */}
            {showSoundSettings && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    Perimeter Alarm Audio
                  </span>
                  <button
                    onClick={toggleMute}
                    className="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Alarm Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-amber-500 bg-zinc-800 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Test Sirens:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={testBreachAlarm}
                      className="px-2 py-1.5 bg-red-950/70 border border-red-800 hover:bg-red-900/80 text-red-200 rounded text-[11px] font-medium text-center"
                    >
                      10-Mi Breach Tone
                    </button>
                    <button
                      onClick={testCivilSiren}
                      className="px-2 py-1.5 bg-amber-950/70 border border-amber-800 hover:bg-amber-900/80 text-amber-200 rounded text-[11px] font-medium text-center"
                    >
                      Civil Air Defense
                    </button>
                  </div>
                  <button
                    onClick={stopAllAudio}
                    className="w-full mt-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                  >
                    Silence Current Sound
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drill Simulator Button */}
          <button
            onClick={onRunSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isSimulating
                ? 'bg-red-900/50 border-red-700 text-red-200 animate-pulse'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Simulate inbound Shahed threat approaching 10-mile radius"
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>{isSimulating ? 'Drill Active (Clear)' : 'Test Alarm Drill'}</span>
          </button>

          {/* Live Refresh SitRep with Gemini */}
          <button
            onClick={onRefreshSitRep}
            disabled={isRefreshingSitRep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold shadow transition-all disabled:opacity-50"
            title="Query Gemini with live Google Search grounding for latest overnight strikes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSitRep ? 'animate-spin' : ''}`} />
            <span>{isRefreshingSitRep ? 'Fetching...' : 'Update Morning Intel'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
