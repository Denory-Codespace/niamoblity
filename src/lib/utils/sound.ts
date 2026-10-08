// ==============================================================================
// nia mobility - Web Audio API Notification & Chime System
// Developed by Denory Codespace
// ==============================================================================

/**
 * Plays a pleasant, rich three-tone chime lasting ~2 seconds using the Web Audio API.
 * Does not require external audio assets or network requests.
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Helper to create a tone
    const playTone = (
      freq: number,
      startTime: number,
      peakGain: number,
      attackDuration: number,
      sustainDuration: number,
      decayDuration: number,
      type: OscillatorType = 'sine'
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + attackDuration);
      gain.gain.setValueAtTime(peakGain, startTime + attackDuration + sustainDuration);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + attackDuration + sustainDuration + decayDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + attackDuration + sustainDuration + decayDuration + 0.05);
    };

    const t = ctx.currentTime;

    // Tone 1: D5 (587 Hz) — bright opening note
    playTone(587.33, t, 0.18, 0.02, 0.08, 0.4);

    // Tone 2: A5 (880 Hz) — rise
    playTone(880, t + 0.35, 0.22, 0.02, 0.10, 0.45);

    // Tone 3: D6 (1174 Hz) — high resolution
    playTone(1174.66, t + 0.75, 0.2, 0.02, 0.12, 0.55);

    // Tone 4: A5 again (880 Hz) — gentle echo / tail
    playTone(880, t + 1.20, 0.10, 0.04, 0.10, 0.60);

  } catch (e) {
    // AudioContext autoplay might be blocked prior to user interaction
  }
}
