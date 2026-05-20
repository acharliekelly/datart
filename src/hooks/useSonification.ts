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
  private echoGain: GainNode;
  private echoDelay: DelayNode;
  private echoFeedback: GainNode;
  private timerId: number | null = null;
  private pendingTimerIds: number[] = [];
  private audioState: AudioState;
  private volume: number;
  private noteIndex = 0;
  private rhythmIndex = 0;

  constructor(audioState: AudioState, volume: number) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.echoGain = this.context.createGain();
    this.echoDelay = this.context.createDelay(1.5);
    this.echoFeedback = this.context.createGain();

    this.masterGain.gain.value = audioState.masterGain * volume;
    this.echoGain.gain.value = audioState.echoMix;
    this.echoDelay.delayTime.value = audioState.echoTime;
    this.echoFeedback.gain.value = 0.24;

    this.echoDelay.connect(this.echoFeedback);
    this.echoFeedback.connect(this.echoDelay);
    this.echoDelay.connect(this.echoGain);
    this.echoGain.connect(this.masterGain);
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
    for (const pendingTimerId of this.pendingTimerIds) {
      window.clearTimeout(pendingTimerId);
    }
    this.pendingTimerIds = [];
    this.masterGain.gain.setTargetAtTime(0, this.context.currentTime, 0.04);
  }

  close() {
    this.stop();
    void this.context.close();
  }

  updateAudioState(audioState: AudioState) {
    this.audioState = audioState;
    this.noteIndex = this.noteIndex % Math.max(1, audioState.notes.length);
    this.rhythmIndex = this.rhythmIndex % Math.max(1, audioState.rhythm.length);
    this.masterGain.gain.setTargetAtTime(
      audioState.masterGain * this.volume,
      this.context.currentTime,
      0.08
    );
    this.echoGain.gain.setTargetAtTime(
      audioState.echoMix,
      this.context.currentTime,
      0.08
    );
    this.echoDelay.delayTime.setTargetAtTime(
      audioState.echoTime,
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

    const beatMs = 60_000 / this.audioState.tempo;
    this.playPatternNote(note);

    if (this.shouldPlayChord()) {
      this.playChord(note.duration);
    }

    this.noteIndex = (this.noteIndex + 1) % this.audioState.notes.length;
    const rhythm = this.audioState.rhythm[this.rhythmIndex] ?? 1;
    this.rhythmIndex = (this.rhythmIndex + 1) % this.audioState.rhythm.length;

    this.timerId = window.setTimeout(this.scheduleNext, beatMs * rhythm);
  };

  private shouldPlayChord(): boolean {
    if (this.audioState.mode === "drone") return this.noteIndex % 2 === 0;
    if (this.audioState.mode === "pulse") return this.noteIndex % 4 === 0;
    if (this.audioState.mode === "flow") return this.noteIndex % 5 === 0;
    return false;
  }

  private playPatternNote(note: AudioState["notes"][number]) {
    const accentBoost = note.accent ? 1.22 : 1;
    this.playNote(
      note.frequency,
      note.duration,
      note.velocity * accentBoost,
      note.pan,
      this.audioState.waveform,
      note.accent
    );

    if (this.audioState.mode === "branch" && note.accent) {
      this.scheduleAccent(() => {
        this.playNote(
          note.frequency * 1.5,
          note.duration * 0.58,
          note.velocity * 0.58,
          -note.pan,
          "triangle",
          false
        );
      }, 90);
    }

    if (this.audioState.mode === "sparkle" && note.accent) {
      this.scheduleAccent(() => {
        this.playNote(
          note.frequency * 2,
          note.duration * 0.45,
          note.velocity * 0.45,
          -note.pan,
          "sine",
          false
        );
      }, 55);
    }
  }

  private scheduleAccent(callback: () => void, delay: number) {
    const timerId = window.setTimeout(() => {
      this.pendingTimerIds = this.pendingTimerIds.filter((id) => id !== timerId);
      callback();
    }, delay);
    this.pendingTimerIds.push(timerId);
  }

  private playChord(duration: number) {
    const chordDuration =
      this.audioState.mode === "drone" ? duration * 1.8 : duration * 1.15;

    this.audioState.chordFrequencies.forEach((frequency, index) => {
      this.playNote(
        frequency,
        chordDuration,
        this.audioState.mode === "drone" ? 0.26 : 0.18,
        (index - 1) * 0.35,
        this.audioState.waveform,
        false
      );
    });
  }

  private playNote(
    frequency: number,
    duration: number,
    velocity: number,
    pan: number,
    waveform: OscillatorType,
    accent: boolean
  ) {
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const voiceGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const panner = this.context.createStereoPanner();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);

    filter.type = "lowpass";
    filter.frequency.setTargetAtTime(
      this.audioState.filterFrequency,
      now,
      0.03
    );
    filter.Q.value = accent
      ? this.audioState.filterQ * 1.25
      : this.audioState.filterQ;

    panner.pan.setTargetAtTime(pan, now, 0.02);

    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, Math.min(1, velocity)),
      now + this.audioState.attack
    );
    voiceGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + Math.max(0.06, duration + this.audioState.release)
    );

    oscillator.connect(filter);
    filter.connect(panner);
    panner.connect(voiceGain);
    voiceGain.connect(this.masterGain);
    voiceGain.connect(this.echoDelay);

    oscillator.start(now);
    oscillator.stop(now + duration + this.audioState.release + 0.04);
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
