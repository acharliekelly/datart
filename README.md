# DatArt

A tiny client-side generative art engine built with React, TypeScript, and Vite, and your browser's weird little secrets.

Every visitor gets a unique artwork generated from:
- browser traits
- IP/geolocation info
- randomness derived from a deterministic seed
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
  logic/
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