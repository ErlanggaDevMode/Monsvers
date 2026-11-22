const MUTE_STORAGE_KEY = 'monsvers_muted_v1';
const BASE_MASTER_GAIN = 0.18;

// MIDI note number to frequency (Hz)
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Track definitions: tempo (BPM), stepsPerBeat (4 = 16th notes, 2 = 8th notes),
// melody / arp / bass arrays of MIDI notes (0 or null = rest), and optional percussion pattern.
const BGM_TRACKS = {
  // Heroic, hopeful RPG theme (C Major, 112 BPM, 8th-note grid = 32 steps)
  title: {
    bpm: 112,
    stepsPerBeat: 2,
    leadWave: 'square',
    leadGain: 0.22,
    bassWave: 'triangle',
    bassGain: 0.34,
    arpWave: 'triangle',
    arpGain: 0.12,
    melody: [
      72, 0, 76, 79, 84, 0, 83, 79,
      81, 0, 79, 76, 74, 0, 0, 0,
      72, 0, 76, 79, 84, 0, 86, 84,
      83, 0, 79, 81, 79, 0, 0, 0,
    ],
    arp: [
      60, 64, 67, 64, 60, 64, 67, 64,
      65, 69, 72, 69, 62, 67, 71, 67,
      60, 64, 67, 64, 65, 69, 72, 69,
      67, 71, 74, 71, 67, 71, 74, 67,
    ],
    bass: [
      48, 0, 48, 0, 48, 0, 55, 0,
      53, 0, 53, 0, 55, 0, 50, 0,
      48, 0, 48, 0, 53, 0, 53, 0,
      55, 0, 55, 0, 55, 0, 52, 0,
    ],
    drums: null,
  },

  // Adventurous exploration arpeggio (D Major, 120 BPM, 8th-note grid = 32 steps)
  map: {
    bpm: 120,
    stepsPerBeat: 2,
    leadWave: 'square',
    leadGain: 0.18,
    bassWave: 'triangle',
    bassGain: 0.32,
    arpWave: 'triangle',
    arpGain: 0.15,
    melody: [
      74, 78, 81, 0, 86, 0, 81, 78,
      79, 0, 78, 76, 74, 0, 71, 0,
      74, 78, 81, 0, 83, 81, 78, 74,
      76, 0, 78, 76, 74, 0, 0, 0,
    ],
    arp: [
      62, 66, 69, 74, 62, 66, 69, 74,
      67, 71, 74, 79, 69, 73, 76, 81,
      62, 66, 69, 74, 67, 71, 74, 79,
      69, 73, 76, 73, 62, 66, 69, 66,
    ],
    bass: [
      50, 0, 57, 0, 50, 0, 57, 0,
      55, 0, 50, 0, 57, 0, 52, 0,
      50, 0, 57, 0, 55, 0, 59, 0,
      57, 0, 52, 0, 50, 0, 57, 0,
    ],
    drums: [
      1, 0, 2, 0, 1, 0, 2, 0,
      1, 0, 2, 0, 1, 0, 2, 2,
      1, 0, 2, 0, 1, 0, 2, 0,
      1, 0, 2, 0, 1, 2, 2, 0,
    ],
  },

  // Energetic 138 BPM chiptune combat loop (E Minor, 8th-note grid = 32 steps)
  battle: {
    bpm: 138,
    stepsPerBeat: 2,
    leadWave: 'square',
    leadGain: 0.22,
    bassWave: 'triangle',
    bassGain: 0.36,
    arpWave: 'square',
    arpGain: 0.09,
    melody: [
      76, 0, 79, 76, 83, 0, 81, 79,
      76, 74, 76, 79, 74, 0, 71, 0,
      76, 0, 79, 83, 88, 0, 86, 83,
      81, 79, 76, 74, 76, 0, 0, 0,
    ],
    arp: [
      64, 67, 71, 67, 64, 67, 71, 67,
      60, 64, 67, 64, 62, 66, 69, 66,
      64, 67, 71, 67, 60, 64, 67, 64,
      62, 66, 69, 66, 64, 67, 71, 64,
    ],
    bass: [
      52, 52, 64, 52, 52, 52, 64, 52,
      48, 48, 60, 48, 50, 50, 62, 50,
      52, 52, 64, 52, 48, 48, 60, 48,
      50, 50, 62, 50, 52, 55, 59, 52,
    ],
    drums: [
      1, 2, 3, 2, 1, 2, 3, 2,
      1, 2, 3, 2, 1, 1, 3, 2,
      1, 2, 3, 2, 1, 2, 3, 2,
      1, 2, 3, 2, 1, 3, 1, 3,
    ],
  },

  // Intense minor-key 152 BPM Eclipse Rift Boss theme (D Minor / Phrygian, 8th-note grid = 32 steps)
  boss: {
    bpm: 152,
    stepsPerBeat: 2,
    leadWave: 'sawtooth',
    leadGain: 0.19,
    bassWave: 'triangle',
    bassGain: 0.4,
    arpWave: 'square',
    arpGain: 0.11,
    melody: [
      74, 75, 74, 0, 81, 0, 79, 77,
      74, 0, 75, 77, 79, 77, 75, 74,
      86, 0, 85, 81, 82, 0, 81, 79,
      77, 75, 74, 73, 74, 0, 81, 0,
    ],
    arp: [
      62, 65, 69, 65, 62, 65, 69, 65,
      63, 67, 70, 67, 61, 64, 69, 64,
      62, 65, 69, 65, 58, 62, 65, 62,
      63, 67, 70, 67, 61, 64, 69, 61,
    ],
    bass: [
      50, 50, 62, 50, 50, 50, 62, 50,
      51, 51, 63, 51, 49, 49, 61, 49,
      50, 50, 62, 50, 46, 46, 58, 46,
      51, 51, 63, 51, 49, 49, 55, 52,
    ],
    drums: [
      1, 2, 3, 1, 1, 2, 3, 2,
      1, 2, 3, 1, 3, 2, 3, 3,
      1, 2, 3, 1, 1, 2, 3, 2,
      1, 1, 3, 1, 3, 3, 1, 3,
    ],
  },
};

function readPersistedMute() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    }
  } catch {
    // Ignore storage errors (private mode / headless)
  }
  return false;
}

function writePersistedMute(muted) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
    }
  } catch {
    // Ignore storage errors
  }
}

class AudioManager {
  constructor() {
    this.muted = readPersistedMute();
    this._volume = 1.0;
    this._ctx = null;
    this._masterGain = null;
    this._noiseBuffer = null;

    this._currentTrack = null;
    this._bgmTimer = null;
    this._stepIndex = 0;
    this._nextNoteTime = 0;
  }

  _getAudioContextCtor() {
    if (typeof window === 'undefined') return null;
    return window.AudioContext || window.webkitAudioContext || null;
  }

  _ensureContext() {
    if (this._ctx) return this._ctx;
    const AudioCtx = this._getAudioContextCtor();
    if (!AudioCtx) return null;

    try {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : BASE_MASTER_GAIN * this._volume;
      master.connect(ctx.destination);

      this._ctx = ctx;
      this._masterGain = master;
      this._noiseBuffer = this._createNoiseBuffer(ctx);
      return ctx;
    } catch {
      return null;
    }
  }

  _createNoiseBuffer(ctx) {
    const length = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  _applyMasterGain() {
    if (!this._ctx || !this._masterGain) return;
    const target = this.muted ? 0 : BASE_MASTER_GAIN * this._volume;
    const now = this._ctx.currentTime;
    try {
      this._masterGain.gain.cancelScheduledValues(now);
      this._masterGain.gain.setTargetAtTime(target, now, 0.015);
    } catch {
      this._masterGain.gain.value = target;
    }
  }

  unlock() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      ctx.resume().catch(() => {});
    }
    this._applyMasterGain();
    if (this._currentTrack && !this._bgmTimer) {
      this._startBgmScheduler();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    writePersistedMute(this.muted);
    this._applyMasterGain();
    return this.muted;
  }

  setVolume(v) {
    const num = Number(v);
    if (!Number.isFinite(num)) return;
    this._volume = Math.max(0, Math.min(1, num));
    this._applyMasterGain();
  }

  playBgm(trackName) {
    const track = BGM_TRACKS[trackName];
    if (!track) return;

    // Prevent restarting if the same track is already playing
    if (this._currentTrack === trackName && this._bgmTimer) {
      return;
    }

    this.stopBgm();
    this._currentTrack = trackName;
    this._stepIndex = 0;

    const ctx = this._ensureContext();
    if (!ctx) return;

    this._nextNoteTime = ctx.currentTime + 0.04;
    this._startBgmScheduler();
  }

  stopBgm() {
    if (this._bgmTimer) {
      clearInterval(this._bgmTimer);
      this._bgmTimer = null;
    }
    this._currentTrack = null;
    this._stepIndex = 0;
  }

  _startBgmScheduler() {
    if (this._bgmTimer) return;
    this._bgmTimer = setInterval(() => {
      this._scheduleBgmChunk();
    }, 50);
  }

  _scheduleBgmChunk() {
    if (!this._currentTrack || !this._ctx || !this._masterGain) return;
    if (this._ctx.state !== 'running') {
      this._nextNoteTime = this._ctx.currentTime + 0.05;
      return;
    }

    const track = BGM_TRACKS[this._currentTrack];
    if (!track) return;

    const stepDuration = 60 / track.bpm / track.stepsPerBeat;
    const lookahead = 0.14;

    if (this._nextNoteTime < this._ctx.currentTime - 0.1) {
      this._nextNoteTime = this._ctx.currentTime + 0.02;
    }

    while (this._nextNoteTime < this._ctx.currentTime + lookahead) {
      this._scheduleStep(track, this._stepIndex, this._nextNoteTime, stepDuration);
      this._nextNoteTime += stepDuration;
      this._stepIndex = (this._stepIndex + 1) % track.melody.length;
    }
  }

  _scheduleStep(track, step, time, stepDuration) {
    if (this.muted) return;

    const melNote = track.melody[step];
    if (melNote) {
      this._playTone({
        freq: midiToFreq(melNote),
        type: track.leadWave,
        startTime: time,
        duration: stepDuration * 0.82,
        gain: track.leadGain,
        attack: 0.008,
        release: 0.03,
      });
    }

    const arpNote = track.arp ? track.arp[step] : 0;
    if (arpNote) {
      this._playTone({
        freq: midiToFreq(arpNote),
        type: track.arpWave,
        startTime: time,
        duration: stepDuration * 0.55,
        gain: track.arpGain,
        attack: 0.005,
        release: 0.02,
      });
    }

    const bassNote = track.bass ? track.bass[step] : 0;
    if (bassNote) {
      this._playTone({
        freq: midiToFreq(bassNote),
        type: track.bassWave,
        startTime: time,
        duration: stepDuration * 0.88,
        gain: track.bassGain,
        attack: 0.008,
        release: 0.03,
      });
    }

    const drum = track.drums ? track.drums[step] : 0;
    if (drum === 1) {
      // Soft chiptune kick
      this._playSweep({
        startFreq: 135,
        endFreq: 42,
        type: 'triangle',
        startTime: time,
        duration: 0.085,
        gain: 0.28,
      });
    } else if (drum === 2) {
      // Crisp hi-hat tick
      this._playNoise({
        startTime: time,
        duration: 0.03,
        gain: 0.07,
        filterType: 'highpass',
        filterFreq: 6500,
      });
    } else if (drum === 3) {
      // Snare noise snap
      this._playNoise({
        startTime: time,
        duration: 0.07,
        gain: 0.14,
        filterType: 'bandpass',
        filterFreq: 2200,
      });
    }
  }

  _playTone({
    freq,
    type = 'square',
    startTime,
    duration = 0.1,
    gain = 0.25,
    attack = 0.005,
    release = 0.02,
  }) {
    if (!this._ctx || !this._masterGain) return;
    const ctx = this._ctx;
    const t0 = startTime ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    const safePeak = Math.max(0.001, gain);
    const sustainEnd = Math.max(t0 + attack + 0.005, t0 + duration - release);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(safePeak, t0 + attack);
    env.gain.setValueAtTime(safePeak, sustainEnd);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env);
    env.connect(this._masterGain);

    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }

  _playSweep({
    startFreq,
    endFreq,
    type = 'square',
    startTime,
    duration = 0.12,
    gain = 0.25,
  }) {
    if (!this._ctx || !this._masterGain) return;
    const ctx = this._ctx;
    const t0 = startTime ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, startFreq), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(Math.max(0.001, gain), t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env);
    env.connect(this._masterGain);

    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }

  _playNoise({
    startTime,
    duration = 0.08,
    gain = 0.2,
    filterType = 'bandpass',
    filterFreq = 1800,
  }) {
    if (!this._ctx || !this._masterGain || !this._noiseBuffer) return;
    const ctx = this._ctx;
    const t0 = startTime ?? ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, t0);

    const env = ctx.createGain();
    env.gain.setValueAtTime(Math.max(0.001, gain), t0);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(filter);
    filter.connect(env);
    env.connect(this._masterGain);

    src.start(t0);
    src.stop(t0 + duration + 0.01);
  }

  _playArp(notes, stepSec, { type = 'square', gain = 0.24, noteDur = stepSec * 0.9, startOffset = 0 } = {}) {
    if (!this._ctx) return;
    const base = this._ctx.currentTime + startOffset;
    notes.forEach((midi, idx) => {
      if (!midi) return;
      this._playTone({
        freq: midiToFreq(midi),
        type,
        startTime: base + idx * stepSec,
        duration: noteDur,
        gain,
        attack: 0.004,
        release: Math.min(0.04, noteDur * 0.35),
      });
    });
  }

  playSfx(name) {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    switch (name) {
      case 'click':
        this._playTone({ freq: 820, type: 'triangle', startTime: now, duration: 0.035, gain: 0.16, attack: 0.002, release: 0.018 });
        break;

      case 'attack':
        this._playSweep({ startFreq: 520, endFreq: 140, type: 'square', startTime: now, duration: 0.12, gain: 0.28 });
        this._playNoise({ startTime: now + 0.02, duration: 0.08, gain: 0.22, filterType: 'bandpass', filterFreq: 1600 });
        break;

      case 'super':
        this._playArp([72, 76, 79, 84], 0.045, { type: 'square', gain: 0.28, noteDur: 0.09 });
        this._playSweep({ startFreq: 320, endFreq: 90, type: 'sawtooth', startTime: now + 0.1, duration: 0.16, gain: 0.26 });
        this._playNoise({ startTime: now + 0.08, duration: 0.12, gain: 0.24, filterType: 'lowpass', filterFreq: 2400 });
        break;

      case 'crit':
        this._playSweep({ startFreq: 1180, endFreq: 440, type: 'sawtooth', startTime: now, duration: 0.09, gain: 0.3 });
        this._playSweep({ startFreq: 260, endFreq: 55, type: 'triangle', startTime: now + 0.04, duration: 0.18, gain: 0.38 });
        this._playNoise({ startTime: now + 0.03, duration: 0.14, gain: 0.28, filterType: 'bandpass', filterFreq: 2800 });
        break;

      case 'miss':
        this._playSweep({ startFreq: 360, endFreq: 160, type: 'sine', startTime: now, duration: 0.14, gain: 0.18 });
        this._playNoise({ startTime: now, duration: 0.11, gain: 0.12, filterType: 'highpass', filterFreq: 3200 });
        break;

      case 'hit':
        this._playSweep({ startFreq: 180, endFreq: 52, type: 'triangle', startTime: now, duration: 0.11, gain: 0.34 });
        this._playNoise({ startTime: now, duration: 0.06, gain: 0.22, filterType: 'lowpass', filterFreq: 1400 });
        break;

      case 'guard':
        this._playTone({ freq: midiToFreq(76), type: 'triangle', startTime: now, duration: 0.09, gain: 0.24 });
        this._playTone({ freq: midiToFreq(83), type: 'sine', startTime: now + 0.055, duration: 0.15, gain: 0.26 });
        break;

      case 'heal':
        this._playArp([67, 71, 74, 79, 83], 0.06, { type: 'triangle', gain: 0.26, noteDur: 0.14 });
        break;

      case 'status':
        this._playSweep({ startFreq: 320, endFreq: 540, type: 'sawtooth', startTime: now, duration: 0.08, gain: 0.18 });
        this._playSweep({ startFreq: 540, endFreq: 260, type: 'sawtooth', startTime: now + 0.08, duration: 0.12, gain: 0.18 });
        break;

      case 'capture_throw':
        this._playSweep({ startFreq: 300, endFreq: 880, type: 'sine', startTime: now, duration: 0.18, gain: 0.22 });
        break;

      case 'capture_ok':
        this._playArp([72, 76, 79, 84], 0.08, { type: 'square', gain: 0.26, noteDur: 0.16 });
        this._playTone({ freq: midiToFreq(60), type: 'triangle', startTime: now + 0.24, duration: 0.28, gain: 0.3 });
        break;

      case 'capture_fail':
        this._playTone({ freq: midiToFreq(62), type: 'sawtooth', startTime: now, duration: 0.11, gain: 0.22 });
        this._playTone({ freq: midiToFreq(57), type: 'sawtooth', startTime: now + 0.11, duration: 0.18, gain: 0.22 });
        break;

      case 'victory':
        this._playArp([72, 76, 79, 84, 79, 84], 0.09, { type: 'square', gain: 0.26, noteDur: 0.15 });
        this._playArp([48, 55, 60], 0.18, { type: 'triangle', gain: 0.3, noteDur: 0.22 });
        break;

      case 'defeat':
        this._playArp([67, 65, 63, 60], 0.14, { type: 'triangle', gain: 0.28, noteDur: 0.2 });
        break;

      case 'levelup':
        this._playArp([60, 64, 67, 72, 76, 79, 84], 0.055, { type: 'square', gain: 0.25, noteDur: 0.12 });
        break;

      case 'evolve':
        this._playArp([60, 62, 64, 67, 69, 72, 76, 79, 84], 0.065, { type: 'square', gain: 0.26, noteDur: 0.14 });
        this._playTone({ freq: midiToFreq(72), type: 'triangle', startTime: now + 0.56, duration: 0.42, gain: 0.34 });
        this._playTone({ freq: midiToFreq(79), type: 'triangle', startTime: now + 0.56, duration: 0.42, gain: 0.26 });
        break;

      case 'boss_phase2':
        this._playSweep({ startFreq: 160, endFreq: 48, type: 'sawtooth', startTime: now, duration: 0.32, gain: 0.34 });
        this._playTone({ freq: midiToFreq(50), type: 'square', startTime: now + 0.08, duration: 0.34, gain: 0.24 });
        this._playTone({ freq: midiToFreq(53), type: 'square', startTime: now + 0.08, duration: 0.34, gain: 0.2 });
        this._playTone({ freq: midiToFreq(57), type: 'sawtooth', startTime: now + 0.08, duration: 0.34, gain: 0.22 });
        this._playNoise({ startTime: now, duration: 0.24, gain: 0.22, filterType: 'lowpass', filterFreq: 900 });
        break;

      default:
        this._playTone({ freq: 660, type: 'triangle', startTime: now, duration: 0.05, gain: 0.16 });
        break;
    }
  }
}

export const audioManager = new AudioManager();
