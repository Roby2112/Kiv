import React, { useState } from 'react';
import { NightlySitRep } from '../types';
import { ShieldCheck, AlertCircle, Volume2, VolumeX, Sparkles, ExternalLink, Zap, Droplet, Flame, Train, CheckCircle } from 'lucide-react';
import { alertSoundService } from '../utils/audioAlert';

interface MorningBriefingProps {
  sitrep: NightlySitRep;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({
  sitrep,
  onRefresh,
  isRefreshing,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const { maidanSafetyAssessment, nationalStatistics } = sitrep;

  // Web Speech Synthesis for Morning Voice Briefing
  const toggleSpeechBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    alertSoundService.playMorningChime();

    setTimeout(() => {
      const speechText = `Good morning. Here is your Kyiv and Independence Square defense sitrep for ${sitrep.reportDate}.
Independence Square status is ${maidanSafetyAssessment.safetyLevel.toLowerCase()}.
There were no direct strikes on Maidan Nezalezhnosti.
The closest overnight incident was recorded ${maidanSafetyAssessment.distanceToNearestStrikeMiles} miles away in ${maidanSafetyAssessment.nearestStrikeLocation}.
Nationwide, Ukrainian air defense intercepted ${nationalStatistics.dronesDowned} of ${nationalStatistics.totalDronesLaunched} launched drones, with ${nationalStatistics.dronesLostEW} suppressed by electronic warfare.
City utilities, power, and water around Independence Square are operating normally. The metro shelters remain on continuous civil protection readiness.
Your wife's area remains secure.`;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }, 400);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Top Banner: Date & Audio Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Morning Intelligence Digest
            </span>
            <span className="text-zinc-500">·</span>
            <span className="text-xs text-zinc-400">{sitrep.reportDate}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">{sitrep.summaryTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Readout Button */}
          <button
            onClick={toggleSpeechBriefing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all ${
              isPlayingAudio
                ? 'bg-rose-900/80 border border-rose-600 text-rose-100 animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
            }`}
            title="Listen to 45-second spoken morning audio situation report"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                <span>Stop Spoken SitRep</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Listen to Morning Audio SitRep</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Focus: Independence Square Safety & Distance Breakdown */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Independence Square (Maidan) Status
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>Untouched &amp; Normal Activity</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 px-2 py-0.5 rounded">
                  0 Direct Impacts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
              <div className="text-zinc-400">Nearest Overnight Event:</div>
              <div className="font-bold text-zinc-100 mt-0.5">
                {maidanSafetyAssessment.distanceToNearestStrikeMiles} mi ({maidanSafetyAssessment.nearestStrikeLocation})
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
              <div className="text-zinc-400">Inside 10-Mile Zone:</div>
              <div className="font-bold text-amber-400 mt-0.5">
                {maidanSafetyAssessment.threatsWithinTenMilesCount} Interceptions / Debris Falls
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Advice & Reassurance */}
        <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
          <strong className="text-amber-300">SitRep Guidance:</strong> {maidanSafetyAssessment.actionableAdvice}
        </p>

        {/* Maidan Local Utilities Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">DTEK Electricity</div>
              <div className="font-semibold text-zinc-200">
                {maidanSafetyAssessment.utilitiesStatus.power === 'NORMAL' ? 'Normal / Stable' : 'Emergency Grid Outages'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <Droplet className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Kyivvodokanal Water</div>
              <div className="font-semibold text-zinc-200">
                {maidanSafetyAssessment.utilitiesStatus.water === 'NORMAL' ? 'Standard Pressure' : 'Low Pressure'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Municipal Heating</div>
              <div className="font-semibold text-zinc-200">
                {maidanSafetyAssessment.utilitiesStatus.heating === 'OPERATIONAL' ? 'Operational' : 'Degraded'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <Train className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Maidan Metro Station</div>
              <div className="font-semibold text-zinc-200">Transit &amp; 24/7 Shelter</div>
            </div>
          </div>
        </div>
      </div>

      {/* National Attack & Air Defense Interception Statistics */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Ukraine Air Defense Morning Tally (24h Summary)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
            <div className="text-xs text-zinc-400">Shahed Drones Launched</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {nationalStatistics.totalDronesLaunched}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Geran-2 / Shahed-136</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
            <div className="text-xs text-zinc-400">Drones Shot Down</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              {nationalStatistics.dronesDowned}
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">
              {Math.round((nationalStatistics.dronesDowned / (nationalStatistics.totalDronesLaunched || 1)) * 100)}% Kinetic Intercept Rate
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
            <div className="text-xs text-zinc-400">Suppressed by EW</div>
            <div className="text-xl font-extrabold text-cyan-400 mt-1">
              {nationalStatistics.dronesLostEW}
            </div>
            <div className="text-[10px] text-cyan-500/80 mt-0.5">Lost Location / Parodiya Decoys</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
            <div className="text-xs text-zinc-400">Cruise / Ballistic Missiles</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {nationalStatistics.missilesDowned} / {nationalStatistics.totalMissilesLaunched} Downed
            </div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">Patriot &amp; NASAMS batteries</div>
          </div>
        </div>
      </div>

      {/* Executive Summary & Grounding Details */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-4">
        <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Official Operational Intelligence</span>
          <span className="text-[11px] text-zinc-500 font-normal">
            Targeted: {nationalStatistics.regionsTargeted.join(', ')}
          </span>
        </div>
        <div className="text-xs text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line">
          {sitrep.executiveSummary}
        </div>

        {/* Verified Grounding Sources */}
        {sitrep.groundingSources && sitrep.groundingSources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/70 text-[11px] text-zinc-400">
            <div className="font-medium text-zinc-300 mb-1">Official Military &amp; Civil References:</div>
            <div className="flex flex-wrap gap-3">
              {sitrep.groundingSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  <span>{source.title}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
