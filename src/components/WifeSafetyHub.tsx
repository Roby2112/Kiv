import React, { useState } from 'react';
import { WifeStatusCheck, ShelterLocation } from '../types';
import { MAIDAN_AREA_SHELTERS } from '../utils/geo';
import { Heart, X, MessageSquare, Send, PhoneCall, Shield, CheckCircle, Clock, MapPin, AlertTriangle, Battery, ExternalLink } from 'lucide-react';

interface WifeSafetyHubProps {
  isOpen: boolean;
  onClose: () => void;
  wifeStatus: WifeStatusCheck;
  onUpdateStatus: (newStatus: WifeStatusCheck['status'], notes?: string) => void;
  nearestThreatDistanceMiles: number | null;
}

export const WifeSafetyHub: React.FC<WifeSafetyHubProps> = ({
  isOpen,
  onClose,
  wifeStatus,
  onUpdateStatus,
  nearestThreatDistanceMiles,
}) => {
  const [customNotes, setCustomNotes] = useState<string>(wifeStatus.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  if (!isOpen) return null;

  // Prepare dynamic pre-filled text for WhatsApp / Telegram
  const threatMsg = nearestThreatDistanceMiles !== null
    ? `Air threat detected approx. ${nearestThreatDistanceMiles} miles from Maidan.`
    : `Airspace over central Kyiv currently clear.`;

  const prefilledText = encodeURIComponent(
    `Hi sweetheart, checking in on you. I'm monitoring the Kyiv radar: ${threatMsg} Are you safe at the apartment or in the Maidan metro shelter? Please send me a quick thumbs-up. Love you!`
  );

  const whatsappUrl = `https://wa.me/?text=${prefilledText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('https://kyiv-shield.app')}&text=${prefilledText}`;

  const handleSaveNotes = () => {
    onUpdateStatus(wifeStatus.status, customNotes);
    setIsEditingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-600/80 flex items-center justify-center text-rose-300">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Wife Safety &amp; Emergency Hub</span>
                <span className="text-xs font-normal text-rose-400 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded-full">
                  Independence Square (Maidan)
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Instant check-in, direct 1-tap messaging, and nearest underground bomb shelters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Status Banner */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Current State</span>
                <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      wifeStatus.status === 'SAFE'
                        ? 'bg-emerald-400'
                        : wifeStatus.status === 'IN_SHELTER'
                        ? 'bg-blue-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {wifeStatus.status === 'SAFE'
                      ? 'Marked Safe at Independence Square'
                      : wifeStatus.status === 'IN_SHELTER'
                      ? 'Currently Sheltered Underground'
                      : 'Awaiting Safety Response'}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-zinc-400">
                <div>Last Check-In:</div>
                <div className="font-semibold text-zinc-200 mt-0.5">
                  {new Date(wifeStatus.lastCheckedIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Kyiv Time)
                </div>
              </div>
            </div>

            {/* Quick Status Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-semibold">
              <button
                onClick={() => onUpdateStatus('SAFE', customNotes)}
                className={`py-2 px-3 rounded-lg border transition-all ${
                  wifeStatus.status === 'SAFE'
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-200 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ✓ Mark Safe
              </button>
              <button
                onClick={() => onUpdateStatus('IN_SHELTER', customNotes)}
                className={`py-2 px-3 rounded-lg border transition-all ${
                  wifeStatus.status === 'IN_SHELTER'
                    ? 'bg-blue-950 border-blue-600 text-blue-200 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🛡️ In Shelter
              </button>
              <button
                onClick={() => onUpdateStatus('AWAITING_REPLY', customNotes)}
                className={`py-2 px-3 rounded-lg border transition-all ${
                  wifeStatus.status === 'AWAITING_REPLY'
                    ? 'bg-amber-950 border-amber-600 text-amber-200 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ⏳ Awaiting Reply
              </button>
            </div>

            {/* Notes Section */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-400">Check-in Notes / Status update:</span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-amber-400 hover:underline"
                  >
                    Edit note
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. In apartment, power & water working, battery 95%..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-amber-500 text-zinc-950 text-xs font-semibold rounded hover:bg-amber-400"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-300 italic bg-zinc-900/60 p-2 rounded border border-zinc-800">
                  "{wifeStatus.notes || 'No notes added yet.'}"
                </p>
              )}
            </div>
          </div>

          {/* 1-Tap Messaging */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Send Instant Safety Message to Wife
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send WhatsApp Check-In</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send Telegram Check-In</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              Includes pre-filled dynamic threat distance and gentle reassurance.
            </p>
          </div>

          {/* Closest Deep Bomb Shelters from Independence Square */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              <span>Deep Bomb Shelters at Independence Square</span>
              <span className="text-[11px] text-zinc-500 font-normal">All verified &amp; open 24/7</span>
            </div>

            <div className="space-y-2">
              {MAIDAN_AREA_SHELTERS.map((shelter) => (
                <div
                  key={shelter.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>🛡️ {shelter.name}</span>
                        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded font-semibold">
                          {shelter.depthMeters}m Underground
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-0.5">{shelter.address}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-amber-400 text-sm">
                        {shelter.walkingMinutesFromMaidan} min walk
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {shelter.distanceFeetFromMaidan} ft ({shelter.distanceMetersFromMaidan}m)
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-zinc-300 flex flex-wrap gap-1.5">
                    {shelter.amenities.map((item, idx) => (
                      <span key={idx} className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Kyiv Hotlines */}
          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-xs">
            <div className="font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>Kyiv Emergency Response Hotlines</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-zinc-900 p-1.5 rounded text-center">
                <div className="text-zinc-400">Fire &amp; Rescue (DSNS)</div>
                <div className="font-bold text-white text-sm">101</div>
              </div>
              <div className="bg-zinc-900 p-1.5 rounded text-center">
                <div className="text-zinc-400">National Police</div>
                <div className="font-bold text-white text-sm">102</div>
              </div>
              <div className="bg-zinc-900 p-1.5 rounded text-center">
                <div className="text-zinc-400">Ambulance / Medic</div>
                <div className="font-bold text-white text-sm">103</div>
              </div>
              <div className="bg-zinc-900 p-1.5 rounded text-center">
                <div className="text-zinc-400">Kyiv City Contact</div>
                <div className="font-bold text-white text-sm">1551</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Safety Hub
          </button>
        </div>
      </div>
    </div>
  );
};
