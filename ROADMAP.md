# DatArt Roadmap

Last updated: 2026-05-19

## Immediate Goal

Prepare DatArt for a short disability-event demo next week by improving stability, making automatic starting styles more varied, and adding an accessible audio output generated from the same data as the visuals.

## Phase 1: Stabilize The Existing App

Priority: highest

Tasks:

- Move IP trait application out of the animation effect in `src/App.tsx`.
- Fix the `WaveArt` transform string.
- Remove the unused eslint-disable warning in `src/App.tsx`.
- Add a low-frequency animation loop for complexity instead of updating React state every animation frame.
- Quantize animated complexity to whole numbers or larger steps before regenerating art.
- Add render-cost caps for high-density styles, especially `FernArt`, `VoronoiBloomArt`, `FlowFieldArt`, `LatticeArt`, and `RecursiveTreeArt`.
- Add a reduced-motion guard using `prefers-reduced-motion`.
- Run a local soak test with animation enabled for at least 15 minutes.

Suggested acceptance checks:

- `npm run build` passes.
- `npm run lint` has no project warnings.
- Animation can run for 15 minutes in Chrome without runaway memory, locked UI, or tab crash.
- Manual controls remain responsive while animation is active.

## Phase 2: Rewrite Automatic Style Selection

Status: implemented on `feat/style-selection`

Priority: high

Current problem:

- The style selector uses hard-coded short-circuit rules, which can assign many users to the same style.
- One rule references an invalid style ID: `"stata"`.

Recommended approach:

- Build a deterministic style score from the complete fingerprint instead of returning on the first matching trait.
- Use only registered style IDs from `STYLES`.
- Mix multiple trait-specific hashes:
  - full fingerprint
  - timezone
  - language
  - browser family
  - screen size bucket
  - dark-mode preference
  - IP/geolocation fields when available
- Add small per-style weights to avoid over-selecting one style.
- Return a concise debug reason, such as `weighted fingerprint score: top=aurora, runner-up=fern`.

Useful follow-up:

- Add a small local script or unit test that feeds sample trait sets through the selector and reports style distribution.

Suggested acceptance checks:

- No invalid style IDs are possible.
- A sample matrix of common browsers/timezones/languages produces broad distribution across most registered styles.
- Style selection is stable for the same traits.
- Manual style override still works.

Implemented notes:

- `chooseStyleFromFingerprint()` now uses a versioned weighted score across every registered style instead of returning on the first matching rule.
- Scoring includes full fingerprint, IP, geolocation, timezone, language, browser family, screen bucket, device pixel ratio, and color-scheme preference.
- Debug output reports the winning style, score, and runner-up.
- Unit tests cover registered-style validity, deterministic output, and broad distribution across common trait combinations.

## Phase 3: Add Audio Sonification

Status: Phase 3B sound-spruce pass implemented on `feat/sonification`

Priority: high

Recommended architecture:

- Add audio-specific generation types, for example `AudioState`, derived from `GenerationState`.
- Add `src/logic/audioMapping.ts` to map existing visual inputs into sound parameters.
- Add `src/audio/DatArtAudioEngine.ts` or a React hook such as `useDatArtAudio`.
- Add UI controls:
  - audio on/off
  - volume
  - optional density/intensity link to complexity
- Keep audio start user-initiated to satisfy browser autoplay rules.

Initial mapping:

- `styleId`: synthesis voice or pattern type.
- `seed`: deterministic phrase/rhythm generator.
- `palette`: timbre and pitch material.
- `complexity`: note density, tempo, modulation depth, or harmonic richness.
- `fingerprint`: scale/mode and stereo/spatial variation.

Demo-friendly audio modes:

- `orbits`: slow pulsing tones.
- `strata`: layered drones.
- `constellation`: sparse bell-like arpeggios.
- `bubbles`: soft plucks with rounded envelopes.
- `waves`: filtered noise or tremolo tones.
- `fern/tree`: branching melodic phrases.
- `flowfield/aurora/nebula`: evolving pads.

Suggested acceptance checks:

- Audio can start, stop, and change volume without page reload.
- Audio responds when style, seed, palette, or complexity changes.
- Audio does not start automatically.
- Audio does not clip or become painfully loud.
- Visual animation can be off while audio remains meaningful.

Implemented notes:

- `buildAudioState()` maps `GenerationState` to deterministic tempo, notes, waveform, filter brightness, gain, and stereo pan.
- `useSonification()` owns the Web Audio engine and starts only from user interaction.
- MiniHud exposes a visible Sound button; ControlPanel exposes start/stop, volume, current audio summary, and errors.
- Unit tests cover deterministic mapping, complexity-to-density behavior, and conservative audio parameter ranges.

Phase 3B notes:

- Added style-specific audio profiles so visual styles map to more distinct sound modes: pulse, drone, sparkle, pluck, wave, grid, bloom, branch, and flow.
- Added profile-driven scales, waveforms, rhythms, envelopes, echo settings, filter resonance, root offsets, and chord/drone accents.
- The Web Audio engine now supports rhythmic spacing, echo feedback, accent notes, branch/sparkle follow-up notes, and occasional chord/drone layers.
- Unit tests now verify that representative visual styles produce distinct audio modes, waveforms, and summaries.

## Phase 4: Accessibility And Presentation Polish

Status: first accessibility pass implemented on `feat/a11y`

Priority: medium

Tasks:

- Add a concise screen-reader summary of the generated artwork and sound.
- Add clear accessible labels for icon-like HUD controls.
- Ensure all controls are keyboard accessible.
- Add `prefers-reduced-motion` behavior.
- Add an accessible fallback when IP lookup fails.
- Update README to match the real style list and demo controls.
- Consider a dedicated demo mode with simplified controls.

Suggested acceptance checks:

- Keyboard can operate style selection, animation, audio, and volume.
- Screen readers get a meaningful description of current style/audio state.
- Reduced-motion preference disables or softens complexity animation by default.
- README setup instructions match the current app.

Implemented notes:

- Added `buildAccessibilitySummary()` to describe style, generation mode, complexity, motion state, sound state, audio profile, and palette count.
- Rendered the summary in an `aria-live` screen-reader-only region.
- Reduced-motion users start with animation off unless they explicitly turn animation on.
- MiniHud controls now expose clearer `aria-label` and `aria-pressed` state.
- Controls and debug toggles now expose `aria-expanded`, `aria-controls`, dialog roles, and Escape-to-close behavior.
- Added visible focus outlines and larger inner control targets.
- Unit tests cover the accessibility summary helper.

## Phase 5: Optional Improvements After The Demo

Priority: lower

Ideas:

- Add tests for fingerprinting, palette generation, style selection, and audio mapping.
- Add shareable URLs for seed/style/complexity.
- Add export as PNG/SVG.
- Convert the heaviest SVG/DOM styles to canvas.
- Add performance telemetry visible in the debug panel.
- Add a curated "presentation mode" that rotates through safe styles.

## Suggested Next Steps

1. Manually test keyboard-only navigation on desktop and mobile-sized layouts.
2. Test with at least one screen reader and confirm the live summary is useful without being too chatty.
3. Manually verify reduced-motion startup behavior in the browser.
4. Do a timed rehearsal on the actual demo machine or a similar laptop, with browser devtools memory/performance open.
