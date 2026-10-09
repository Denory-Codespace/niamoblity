// ==============================================================================
// nia mobility - Web Audio API Multi-Tone Notification Chime System
// Provides distinct, pleasant synthesized tones for Welcome, Message, & Application alerts
// Developed for Kenyan Mobility Platform
// ==============================================================================

/**
 * Creates and unlocks an AudioContext safely in browser environment.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Helper to play a smooth synthesized musical note with envelope.
 */
function playToneNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  peakGain: number,
  attack: number,
  sustain: number,
  decay: number,
  type: OscillatorType = 'sine'
) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    gain.gain.setValueAtTime(peakGain, startTime + attack + sustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + sustain + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + attack + sustain + decay + 0.05);
  } catch (e) {
    // Audio synthesis failure fallback
  }
}

/**
 * 1. Standard Notification Chime: Pleasant, melodic 3-tone chime (~2.0s)
 */
export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  playToneNote(ctx, 587.33, t, 0.18, 0.02, 0.08, 0.45);        // D5
  playToneNote(ctx, 880.00, t + 0.35, 0.20, 0.02, 0.10, 0.50);  // A5
  playToneNote(ctx, 1174.66, t + 0.75, 0.18, 0.02, 0.12, 0.60); // D6
  playToneNote(ctx, 880.00, t + 1.20, 0.09, 0.03, 0.10, 0.65);  // A5 gentle echo
}

/**
 * 2. Welcome Registration Sound: Joyful, celebratory Kenyan welcome chime (C major fanfare ~2.5s)
 * Triggered upon successful driver / partner account registration.
 */
export function playWelcomeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Rich warm harmonic sequence: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
  playToneNote(ctx, 523.25, t, 0.22, 0.03, 0.12, 0.50, 'triangle');
  playToneNote(ctx, 659.25, t + 0.28, 0.24, 0.03, 0.12, 0.55, 'triangle');
  playToneNote(ctx, 783.99, t + 0.58, 0.26, 0.03, 0.15, 0.60, 'sine');
  playToneNote(ctx, 1046.50, t + 0.95, 0.28, 0.03, 0.25, 0.85, 'sine');

  // Gentle acoustic shimmer chord
  playToneNote(ctx, 1318.51, t + 1.35, 0.12, 0.05, 0.15, 0.90, 'sine'); // E6
}

/**
 * 3. Chat Message Sound: Subtle, crisp 2-tone pop (G5 -> C6 ~0.4s)
 * Perfect for conversational back-and-forth without audio fatigue.
 */
export function playMessageSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  playToneNote(ctx, 783.99, t, 0.16, 0.015, 0.04, 0.22, 'sine');        // G5
  playToneNote(ctx, 1046.50, t + 0.12, 0.20, 0.015, 0.06, 0.28, 'sine'); // C6
}

/**
 * 4. Application Alert Sound: Prominent, upbeat business chime for new driver applications (~1.8s)
 */
export function playApplicationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  playToneNote(ctx, 440.00, t, 0.20, 0.02, 0.08, 0.35);        // A4
  playToneNote(ctx, 659.25, t + 0.22, 0.22, 0.02, 0.08, 0.40);  // E5
  playToneNote(ctx, 880.00, t + 0.46, 0.26, 0.02, 0.15, 0.65);  // A5
  playToneNote(ctx, 1318.51, t + 0.78, 0.18, 0.02, 0.12, 0.60); // E6
}
