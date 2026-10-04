/**
 * Web Audio API synthesizer for Civil Defense & Tactical 10-Mile Threat Alarms.
 * Self-contained without external audio file dependencies.
 */

class AlertSoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentVolume: number = 0.8;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isAlarmPlaying: boolean = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  /**
   * Urgent high-priority warning: Threat inside 10-mile radius!
   * Creates a piercing 2-tone tactical warble
   */
  public playTenMileBreachAlarm(durationMs: number = 8000) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    this.stopAlarm();
    this.isAlarmPlaying = true;

    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    // Modulate pitch rapidly between 880Hz and 587Hz (A5 to D5) to create urgent alarm
    const cycleTime = 0.35;
    const cycles = Math.ceil(duration / cycleTime);
    for (let i = 0; i < cycles; i++) {
      const t = now + i * cycleTime;
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(587, t + cycleTime * 0.7);
    }

    gain.gain.setValueAtTime(this.currentVolume * 0.35, now);
    gain.gain.setValueAtTime(this.currentVolume * 0.35, now + duration - 0.2);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    this.activeOscillators.push({ osc, gain });

    setTimeout(() => {
      this.isAlarmPlaying = false;
      this.activeOscillators = [];
    }, durationMs);
  }

  /**
   * Classic Ukrainian Air Defense / Civil Siren (rising and falling wail)
   */
  public playCivilDefenseSiren(durationMs: number = 10000) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    this.stopAlarm();
    this.isAlarmPlaying = true;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    // Dual oscillator for rich civil defense siren harmonic
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    // Rise from 380Hz to 660Hz then fall over 3.2s cycles
    const waveCycle = 3.2;
    const cycles = Math.ceil(duration / waveCycle);

    for (let i = 0; i < cycles; i++) {
      const t = now + i * waveCycle;
      const half = waveCycle / 2;
      osc1.frequency.setValueAtTime(360, t);
      osc1.frequency.exponentialRampToValueAtTime(680, t + half);
      osc1.frequency.exponentialRampToValueAtTime(360, t + waveCycle);

      osc2.frequency.setValueAtTime(363, t); // slight detune
      osc2.frequency.exponentialRampToValueAtTime(686, t + half);
      osc2.frequency.exponentialRampToValueAtTime(363, t + waveCycle);
    }

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.currentVolume * 0.4, now + 0.5);
    gain.gain.setValueAtTime(this.currentVolume * 0.4, now + duration - 1);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);

    this.activeOscillators.push({ osc: osc1, gain }, { osc: osc2, gain });

    setTimeout(() => {
      this.isAlarmPlaying = false;
      this.activeOscillators = [];
    }, durationMs);
  }

  /**
   * Gentle, calming notification chime for morning SitRep delivery or all-clear
   */
  public playMorningChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(this.currentVolume * 0.25, now + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 1.0);
    });
  }

  public stopAlarm() {
    try {
      this.activeOscillators.forEach(({ osc, gain }) => {
        gain.gain.setValueAtTime(0.001, this.audioCtx?.currentTime || 0);
        osc.stop();
      });
    } catch {
      // ignore
    }
    this.activeOscillators = [];
    this.isAlarmPlaying = false;
  }

  public isCurrentlyAlarming(): boolean {
    return this.isAlarmPlaying;
  }
}

export const alertSoundService = new AlertSoundService();
