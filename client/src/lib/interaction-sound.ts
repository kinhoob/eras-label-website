/**
 * Shared interaction sound helper for the editorial storefront.
 * It keeps one AudioContext per browser tab instead of creating a new context
 * for every click, which avoids unnecessary Web Audio resource churn.
 */
let audioContext: AudioContext | null = null;

/**
 * Plays the short Eras Label click sound when audio is enabled.
 * Browsers can block Web Audio until a user gesture; failures are intentionally
 * ignored because sound is an enhancement and must never break navigation.
 */
export function playInteractionSound(enabled = true): void {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContextConstructor = window.AudioContext ??
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    audioContext ??= new AudioContextConstructor();
    const context = audioContext;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, start);
    oscillator.frequency.exponentialRampToValueAtTime(880, start + 0.08);
    gain.gain.setValueAtTime(0.08, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.08);

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }
  } catch {
    // Audio is optional: browsers without Web Audio must keep the UI usable.
  }
}
