let audioCtx = null;

const getInitialSound = () => {
  try {
    const saved = localStorage.getItem("a_shell_sound");
    if (saved !== null) {
      return saved === "true";
    }
  } catch {
    // LocalStorage unavailable
  }
  return true; // Default ON
};

let soundEnabled = getInitialSound();

export const isSoundEnabled = () => soundEnabled;

export const setSoundEnabled = (enabled) => {
  soundEnabled = !!enabled;
  try {
    localStorage.setItem("a_shell_sound", String(soundEnabled));
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new CustomEvent("sound-change", { detail: { enabled: soundEnabled } }));
};

const getAudioContext = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// ==========================================
// REAL-TIME LIGHTSABER SOUND EFFECTS
// ==========================================

// 1. Blade Clash & Electrical Plasma Scratch (kzzt! krrshhh!)
export const playSaberClash = (intensity = 1.0) => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;

    // A. Electrical scratch crackle (High-Q bandpass filtered noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.07); // 70ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const r = Math.random() * 2 - 1;
      const spike = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      data[i] = r * 0.65 + spike * 0.35;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(2200 + Math.random() * 1000, t);
    bandpass.Q.setValueAtTime(5.0, t);

    const noiseGain = ctx.createGain();
    const vol = Math.min(0.065, 0.05 * intensity);
    noiseGain.gain.setValueAtTime(vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(t);

    // B. Plasma Core Impact Pop (Low-mid FM sawtooth zap)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const clashFreq = 170 + Math.random() * 70;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(clashFreq, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.08);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(600, t);
    lowpass.frequency.exponentialRampToValueAtTime(160, t + 0.08);

    oscGain.gain.setValueAtTime(0.045 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(lowpass);
    lowpass.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    // Ignore audio policy errors
  }
};

// 2. Continuous Blade Lock Sizzle / Electrical Grinding Scratch
export const playSaberLockBuzz = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140 + Math.random() * 45, t);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1900 + Math.random() * 700, t);
    filter.Q.value = 5.5;

    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  } catch {
    // Ignore
  }
};

// 3. Blade Scraping / Glancing Scratch (when blades slide against each other)
export const playSaberScratch = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const dur = 0.06;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200 + (Math.random() - 0.5) * 800, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + dur);
    filter.Q.setValueAtTime(6.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
  } catch {
    // Ignore
  }
};

// 4. Force Push / Disengage Woosh
export const playForcePush = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.22);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.22);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  } catch {
    // Ignore
  }
};

// 3. Lightsaber Whoosh / Aerial Swing Doppler Hum
export const playSaberSwing = (isHeavy = false) => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const startFreq = isHeavy ? 175 : 135;
    const endFreq = isHeavy ? 70 : 90;
    const dur = isHeavy ? 0.15 : 0.11;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.exponentialRampToValueAtTime(130, t + dur);

    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + dur);
  } catch {
    // Ignore
  }
};

// ==========================================
// TACTILE TERMINAL KEYBOARD SOUNDS
// ==========================================
export const playKeySound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;

    // Resonant keycap thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pitch = 320 + Math.random() * 80;
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);

    // High-pitch mechanical spring snap
    const bufferSize = Math.floor(ctx.sampleRate * 0.008);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 2000;
    noise.connect(noiseFilter);
    noiseFilter.connect(ctx.destination);
    noise.start(t);
  } catch {
    // Ignore
  }
};

export const playFoodSound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    // Ignore
  }
};

export const playGameOverSound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.25);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  } catch {
    // Ignore
  }
};