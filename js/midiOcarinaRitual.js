// js/midiOcarinaRitual.js
// =========================================================
// FREYJA CODEX — MIDI OCARINA RITUAL UNLOCK SYSTEM
// - Listens to MIDI input
// - Plays ocarina tones on note press
// - Detects a ritual note sequence
// - Unlocks the Codex update/settings panel
// =========================================================

(function () {
  // -------------------------------------------------------
  // SECTION 1 — CONFIG & STATE
  // (Ritual sequence, flags, shared state)
  // -------------------------------------------------------
  const STATE = {
    audioContext: null,
    masterGain: null,
    midiAccess: null,
    enabled: false,
    volume: 0.4,         // 0.0–1.0
    breathiness: 0.1,    // noise mix 0.0–0.5
    vibratoDepth: 10,    // cents
    vibratoRate: 5,      // Hz
    ritualBuffer: [],
    ritualSequence: ["A4", "C5", "E5", "A5"], // default ritual sequence
    maxBufferLength: 16,
    activeVoices: new Map(), // key: midiNote, value: voice object
  };


  // -------------------------------------------------------
  // SECTION 2 — NOTE & UTILITY HELPERS
  // (MIDI → frequency, MIDI → note name, etc.)
  // -------------------------------------------------------
  function midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  function midiToNoteName(midiNote) {
    const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    const octave = Math.floor(midiNote / 12) - 1;
    const name = notes[midiNote % 12];
    return `${name}${octave}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }


  // -------------------------------------------------------
  // SECTION 3 — WEB AUDIO / OCARINA SYNTH ENGINE
  // (Breathy sine + noise + filter + envelope + vibrato)
  // -------------------------------------------------------
  function ensureAudioContext() {
    if (STATE.audioContext) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = STATE.volume;
    masterGain.connect(ctx.destination);

    STATE.audioContext = ctx;
    STATE.masterGain = masterGain;
  }

  function setMasterVolume(volume) {
    STATE.volume = clamp(volume, 0, 1);
    if (STATE.masterGain) {
      STATE.masterGain.gain.value = STATE.volume;
    }
  }

  function createOcarinaVoice(midiNote) {
    ensureAudioContext();
    const ctx = STATE.audioContext;
    if (!ctx || !STATE.masterGain) return null;

    const now = ctx.currentTime;
    const freq = midiToFrequency(midiNote);

    // Main oscillator (sine)
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // Noise source for breath
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Noise filter (to make breathy, not harsh)
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 3000;

    // Envelope gain for main tone
    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0, now);

    // Envelope for noise
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);

    // Low-pass filter for the combined sound
    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 2500;
    toneFilter.Q.value = 0.8;

    // Optional vibrato
    const vibratoOsc = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibratoOsc.frequency.value = STATE.vibratoRate; // Hz
    vibratoGain.gain.value = STATE.vibratoDepth;    // cents

    vibratoOsc.connect(vibratoGain);
    vibratoGain.connect(osc.detune);

    // Routing
    osc.connect(envGain);
    envGain.connect(toneFilter);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(toneFilter);

    toneFilter.connect(STATE.masterGain);

    // Envelope — soft attack, gentle release
    const attack = 0.03;
    const decay = 0.1;
    const sustain = 0.7;
    const noiseAttack = 0.02;
    const noiseLevel = clamp(STATE.breathiness, 0, 0.5);

    envGain.gain.cancelScheduledValues(now);
    envGain.gain.setValueAtTime(0, now);
    envGain.gain.linearRampToValueAtTime(1, now + attack);
    envGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    noiseGain.gain.cancelScheduledValues(now);
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(noiseLevel, now + noiseAttack);

    osc.start(now);
    noise.start(now);
    vibratoOsc.start(now);

    return {
      osc,
      noise,
      noiseGain,
      envGain,
      vibratoOsc,
      stop: (when = ctx.currentTime) => {
        const release = 0.25;
        envGain.gain.cancelScheduledValues(when);
        envGain.gain.setValueAtTime(envGain.gain.value, when);
        envGain.gain.linearRampToValueAtTime(0, when + release);

        noiseGain.gain.cancelScheduledValues(when);
        noiseGain.gain.setValueAtTime(noiseGain.gain.value, when);
        noiseGain.gain.linearRampToValueAtTime(0, when + release);

        osc.stop(when + release + 0.05);
        noise.stop(when + release + 0.05);
        vibratoOsc.stop(when + release + 0.05);
      }
    };
  }

  function noteOnOcarina(midiNote) {
    if (!STATE.enabled) return;
    const voice = createOcarinaVoice(midiNote);
    if (voice) {
      STATE.activeVoices.set(midiNote, voice);
    }
  }

  function noteOffOcarina(midiNote) {
    const voice = STATE.activeVoices.get(midiNote);
    if (voice && voice.stop) {
      voice.stop();
      STATE.activeVoices.delete(midiNote);
    }
  }


  // -------------------------------------------------------
  // SECTION 4 — RITUAL SEQUENCE DETECTION
  // (Rolling buffer, sequence match, unlock trigger)
  // -------------------------------------------------------
  function pushNoteToRitualBuffer(noteName) {
    STATE.ritualBuffer.push(noteName);
    if (STATE.ritualBuffer.length > STATE.maxBufferLength) {
      STATE.ritualBuffer.shift();
    }
    checkRitualMatch();
  }

  function checkRitualMatch() {
    const seq = STATE.ritualSequence;
    if (!seq || !seq.length) return;

    if (STATE.ritualBuffer.length < seq.length) return;

    const tail = STATE.ritualBuffer.slice(-seq.length);
    const match = seq.every((name, idx) => name === tail[idx]);
    if (!match) return;

    triggerUnlock();
    // Optional: clear buffer to require full re-entry
    STATE.ritualBuffer.length = 0;
  }

  function triggerUnlock() {
    // Fire-kiss visual (if present)
    const fireKiss = document.querySelector('.codex-fire-kiss');
    if (fireKiss) {
      fireKiss.classList.remove('codex-fire-kiss--active');
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      fireKiss.offsetWidth;
      fireKiss.classList.add('codex-fire-kiss--active');
    }

    // Open the update/settings panel if exposed
    if (window.CodexUpdatePanel && typeof window.CodexUpdatePanel.open === "function") {
      window.CodexUpdatePanel.open();
    }
  }

  function setRitualSequence(sequenceArray) {
    if (!Array.isArray(sequenceArray) || !sequenceArray.length) return;
    STATE.ritualSequence = sequenceArray.slice();
  }


  // -------------------------------------------------------
  // SECTION 5 — MIDI INPUT LISTENER
  // (requestMIDIAccess, noteOn/noteOff, routing to synth & ritual)
  // -------------------------------------------------------
  function handleMidiMessage(event) {
    const [status, note, velocity] = event.data;
    const command = status & 0xf0;

    const isNoteOn = command === 0x90 && velocity > 0;
    const isNoteOff = command === 0x80 || (command === 0x90 && velocity === 0);

    if (isNoteOn) {
      const noteName = midiToNoteName(note);
      pushNoteToRitualBuffer(noteName);
      noteOnOcarina(note);
    } else if (isNoteOff) {
      noteOffOcarina(note);
    }
  }

  function attachMidiHandlers(midiAccess) {
    midiAccess.inputs.forEach(input => {
      input.onmidimessage = handleMidiMessage;
    });

    // If inputs change (device plugged/unplugged), reattach
    midiAccess.onstatechange = () => {
      midiAccess.inputs.forEach(input => {
        input.onmidimessage = handleMidiMessage;
      });
    };
  }

  function initMIDI() {
    if (!navigator.requestMIDIAccess) return Promise.resolve(false);

    return navigator.requestMIDIAccess()
      .then(access => {
        STATE.midiAccess = access;
        attachMidiHandlers(access);
        return true;
      })
      .catch(() => false);
  }


  // -------------------------------------------------------
  // SECTION 6 — PUBLIC API & INITIALIZATION
  // (init, enable/disable, volume, sequence, etc.)
  // -------------------------------------------------------
  function init() {
    // Audio context must be resumed from a user gesture in many browsers.
    ensureAudioContext();
    if (STATE.audioContext && STATE.audioContext.state === "suspended") {
      STATE.audioContext.resume();
    }
    STATE.enabled = true;
    return initMIDI();
  }

  function enable() {
    STATE.enabled = true;
    if (STATE.audioContext && STATE.audioContext.state === "suspended") {
      STATE.audioContext.resume();
    }
  }

  function disable() {
    STATE.enabled = false;
    // Stop all active voices
    STATE.activeVoices.forEach(voice => {
      if (voice.stop) voice.stop();
    });
    STATE.activeVoices.clear();
  }

  function setBreathiness(b) {
    STATE.breathiness = clamp(b, 0, 0.5);
  }

  function setVibrato(depthCents, rateHz) {
    if (typeof depthCents === "number") {
      STATE.vibratoDepth = depthCents;
    }
    if (typeof rateHz === "number") {
      STATE.vibratoRate = rateHz;
    }
  }

  // Expose a clean, stable API
  window.CodexOcarinaRitual = {
    init,                 // returns Promise<boolean> for MIDI availability
    enable,
    disable,
    setVolume: setMasterVolume,
    setBreathiness,
    setVibrato,
    setSequence: setRitualSequence,
  };
})();
