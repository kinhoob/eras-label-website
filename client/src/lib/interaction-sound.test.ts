import { afterEach, describe, expect, it, vi } from "vitest";
import { playInteractionSound } from "./interaction-sound";

class FakeAudioContext {
  static instances = 0;
  currentTime = 10;
  state: AudioContextState = "running";
  destination = {} as AudioDestinationNode;
  createOscillator = vi.fn(() => ({
    type: "sine" as OscillatorType,
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  }));
  resume = vi.fn(() => Promise.resolve());

  constructor() {
    FakeAudioContext.instances += 1;
  }
}

describe("som de interação", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("não tenta criar áudio quando o som está desativado", () => {
    vi.stubGlobal("window", { AudioContext: FakeAudioContext });

    expect(() => playInteractionSound(false)).not.toThrow();
    expect(FakeAudioContext.instances).toBe(0);
  });

  it("reutiliza o contexto e agenda o som sem quebrar a navegação", () => {
    vi.stubGlobal("window", { AudioContext: FakeAudioContext });

    expect(() => {
      playInteractionSound(true);
      playInteractionSound(true);
    }).not.toThrow();
    expect(FakeAudioContext.instances).toBe(1);
  });

  it("ignora ambientes sem Web Audio", () => {
    vi.stubGlobal("window", {});

    expect(() => playInteractionSound(true)).not.toThrow();
  });
});
