# DatArt

A tiny client-side generative art engine built with React, TypeScript, and Vite, and your browser's weird little secrets.

Every visitor gets a unique artwork generated from:
- browser traits
- IP/geolocation info
- randomness derived from a deterministic seed
- deterministic sound derived from the same seed and style inputs
- optional manual controls (sliders, style selectors, palette shuffling)

…and nothing leaves your device. No server, no backend, no AI APIs — just CSS, JavaScript, and vibes.

## ✨ Features
### 🎨 Multiple Art Styles

Current styles:
* **Orbits**: drifting concentric rings
* **Strata**: layered geological bands
* **Constellation**: stars + connecting beams
* **Bubbles**: translucent floating spheres
* **Waves**: soft interference patterns

All styles implement a shared interface and self-register via the style registry.

### 🧬 Fingerprint => Seed => Art

Artwork is derived from:
- User agent
- Platform
- Timezone
- Screen size
- (Optional) IP geolocation
- Mix-in randomness

These traits produce a stable base seed, which determines style, palette, and layout.

### 🕹 Manual Mode

Flip a toggle to override auto mode:
- Choose your style
- Adjust seed
- Adjust complexity
- Shuffle palette
- Watch everything react in real time

### 🌀 Animated Complexity

A simple animation toggle smoothly sweeps complexity from 0 to 100 to 0, creating a screensaver effect across all styles.

### 🔊 Sonification

The Sound control starts a Web Audio interpretation of the current artwork. Style, seed, palette, and complexity influence the tempo, notes, waveform, brightness, stereo movement, echo, rhythm, and chord/drone accents.

Audio profiles are designed to loosely match the visual language: orbits pulse, strata drones, constellations sparkle, grids tick, branches split into short echoes, and flow-style visuals drift.

Audio starts only after a button press, matching browser autoplay rules.

### ♿ Accessibility

DatArt includes a screen-reader summary of the current artwork and sound state. The summary includes style, mode, complexity, animation state, reduced-motion status, sound state, audio profile, and palette count.

Keyboard support:
- Tab reaches the corner toggles, MiniHud controls, style controls, sound controls, and debug controls.
- Enter or Space activates buttons and toggles.
- Escape closes the controls or debug panel when either is open.
- If reduced motion is requested, the app starts with animation off unless the visitor explicitly turns animation on.

### 🪩 Debug Panel

Shows:
- Raw traits
- Derived seed + style
- Palette
- Complexity
- A human-readable explanation of the math

Useful during development and for curious users.

### 🚀 Fully Client-Side Deployment

No backend. Just static files.

Works perfectly on:
- Netlify (recommended)
- Vercel
- GitHub Pages (with SPA fallback)


## 🏗️ Architecture
```
src/
  components/
    art/
      styleRegistry.ts
      ArtContainer.tsx
      *.tsx                # individual styles
    ui/
      ControlPanel.tsx
      DebugPanel.tsx
  hooks/
    useIpInfo.ts
    useSonification.ts
  logic/
    accessibilitySummary.ts
    audioMapping.ts
    fingerprint.ts
    generation.ts
    rng.ts
    types.ts
  App.tsx
```

### Core pipeline

1. Collect traits
2. Hash into a stable seed
3. Merge with manual options
4. Build a GenerationState object
5. ArtContainer selects the correct style component
6. Style component renders with CSS + transforms
7. Optional sonification maps GenerationState to Web Audio notes

## 🧪 Development

### Install
```
npm install
```

### Run the dev server
```
npm run dev
```
Visit:
```
http://localhost:5173
```

### Build for production
```
npm run build
```
Output goes to:
```
dist/
```

### Run unit tests
```
npm run test:run
```

For interactive watch mode:
```
npm run test
```

### Run local CI before pushing
```
npm run ci
```
This runs lint, TypeScript type-checking for app and test files, unit tests, and the production build. Use this before pushing to `main`, since Netlify deploys from that branch.

### Manual accessibility check

Before a demo or deploy:
- Navigate the app with only the keyboard.
- Confirm focus outlines are visible.
- Confirm Escape closes open panels.
- Confirm Sound starts only after pressing a sound button.
- Confirm reduced-motion mode starts with animation off.
- With a screen reader, confirm the generated artwork and sound summary is announced.

### Preview the production build
```
npm run preview
```

## 🚀 Deployment

Fully static - deployable on Netlify, Vercel, or GitHub Pages.

## 🧩 Adding New Styles

To add a new visual style:
1. Create a new file in `src/components/art/MyStyle.tsx`
2. Export a component that uses `ArtStyleProps`
3. Register it in `styleRegistry.ts`
4. (Optional) Update auto-mode style selection

After that, the style appears in the manual style selector, works with complexity, palette, and animation, and fully participates in the generative pipeline.

## 📝 Future Enhancements

* Additional styles (IsoGrid, Crystal, Nebula, Lattice, etc.)
* Export artwork as PNG or SVG
* Shareable links (/style/seed)
* Mobile layout polish
* Intro/tutorial overlay via the debug explanation

## 💖 Credits

Built by Charlie Kelly, assisted by a chat-based entity who is doing her best.
