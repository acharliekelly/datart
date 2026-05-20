import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildAudioState, type AudioState } from "../logic/audioMapping";
import type { GenerationState } from "../logic/types";

interface UseSonificationResult {
  audioState: AudioState;
  isAudioEnabled: boolean;
  audioVolume: number;
  audioError: string | null;
  toggleAudio: () => Promise<void>;
  setAudioVolume: (volume: number) => void;
}

class SonificationEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private timerId: number | null = null;
  private audioState: AudioState;
  private volume: number;
  private noteIndex = 0;

  constructor(audioState: AudioState, volume: number) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = audioState.masterGain * volume;
    this.masterGain.connect(this.context.destination);
    this.audioState = audioState;
    this.volume = volume;
  }

  async start() {
    await this.context.resume();
    this.scheduleNext();
  }

  stop() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.masterGain.gain.setTargetAtTime(0, this.context.currentTime, 0.04);
  }

  close() {
    this.stop();
    void this.context.close();
  }

  updateAudioState(audioState: AudioState) {
    this.audioState = audioState;
    this.noteIndex = this.noteIndex % Math.max(1, audioState.notes.length);
    this.masterGain.gain.setTargetAtTime(
      audioState.masterGain * this.volume,
      this.context.currentTime,
      0.08
    );
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.masterGain.gain.setTargetAtTime(
      this.audioState.masterGain * volume,
      this.context.currentTime,
      0.08
    );
  }

  private scheduleNext = () => {
    const note = this.audioState.notes[this.noteIndex];
    if (!note) return;

    this.playNote(note.frequency, note.duration, note.velocity, note.pan);
    this.noteIndex = (this.noteIndex + 1) % this.audioState.notes.length;

    const beatMs = 60_000 / this.audioState.tempo;
    this.timerId = window.setTimeout(this.scheduleNext, beatMs);
  };

  private playNote(
    frequency: number,
    duration: number,
    velocity: number,
    pan: number
  ) {
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const voiceGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const panner = this.context.createStereoPanner();

    oscillator.type = this.audioState.waveform;
    oscillator.frequency.setValueAtTime(frequency, now);

    filter.type = "lowpass";
    filter.frequency.setTargetAtTime(
      this.audioState.filterFrequency,
      now,
      0.03
    );
    filter.Q.value = 0.7;

    panner.pan.setTargetAtTime(pan, now, 0.02);

    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, velocity),
      now + 0.025
    );
    voiceGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + Math.max(0.06, duration)
    );

    oscillator.connect(filter);
    filter.connect(panner);
    panner.connect(voiceGain);
    voiceGain.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
  }
}

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

export function useSonification(
  generationState: GenerationState
): UseSonificationResult {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioVolume, setAudioVolumeState] = useState(0.55);
  const [audioError, setAudioError] = useState<string | null>(null);
  const engineRef = useRef<SonificationEngine | null>(null);

  const audioState = useMemo(
    () => buildAudioState(generationState),
    [generationState]
  );

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.updateAudioState(audioState);
  }, [audioState]);

  useEffect(() => {
    return () => {
      engineRef.current?.close();
      engineRef.current = null;
    };
  }, []);

  const setAudioVolume = useCallback((volume: number) => {
    const nextVolume = clampVolume(volume);
    setAudioVolumeState(nextVolume);
    engineRef.current?.setVolume(nextVolume);
  }, []);

  const toggleAudio = useCallback(async () => {
    if (isAudioEnabled) {
      engineRef.current?.close();
      engineRef.current = null;
      setIsAudioEnabled(false);
      return;
    }

    try {
      const engine = new SonificationEngine(audioState, audioVolume);
      engineRef.current = engine;
      await engine.start();
      setAudioError(null);
      setIsAudioEnabled(true);
    } catch (error) {
      engineRef.current?.close();
      engineRef.current = null;
      setIsAudioEnabled(false);
      setAudioError(
        error instanceof Error ? error.message : "Unable to start audio"
      );
    }
  }, [audioState, audioVolume, isAudioEnabled]);

  return {
    audioState,
    isAudioEnabled,
    audioVolume,
    audioError,
    toggleAudio,
    setAudioVolume,
  };
}
