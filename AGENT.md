# Ghost Drop Web – Agent Context Log

## Project Identity
- **Name:** Ghost Drop Web (evolving into "Privacy Command Center")
- **Mission:** Privacy-first, client-side-only image privacy toolkit.
- **Core rule:** No image or metadata may leave the browser (zero backend uploads).

## Phase Plan (Authoritative)
1. **Phase 1 (done):** React + Vite + Tailwind UI scaffold.
2. **Phase 2 (done):** Metadata shredding logic.
3. **Phase 3 (done):** Connected UI states + download/share loop.
4. **Phase 4 (done):** PWA install + offline + share target.
5. **Phase 5 (done):** Stealth terminal redesign aligned to tactical reference UI.
6. **Phase 6 (done):** Global UI Architecture + Blackout Engine (Local AI Face Redaction).

## What Was Already Done Before This Attempt
- React + TypeScript + Vite app scaffolded.
- Metadata shredder hook implemented with no-recompression stripping.
- PWA share target support and offline service worker added.
- Stealth terminal redesign with tactical corner-bracket frame.

## What This Attempt Adds (Phase 6 - Privacy Command Center)

### Global UI Architecture
- Updated Sidebar navigation with 4 tools: Incinerator, Blackout Engine, Phantom Payload, Settings.
- 3-column grid layout: left sidebar, center main stage (bento-box cards), right terminal.
- Premium design tokens: pure black background, blurred radial gradient, translucent glass cards, ultra-thin borders.
- Spring physics animations with framer-motion for page transitions.

### Blackout Engine (Local AI Face Redaction)
- Added `@mediapipe/tasks-vision` dependency for WebAssembly ML.
- Created `useBlackoutEngine` hook with:
  - FilesetResolver and FaceDetector initialization from MediaPipe.
  - `blaze_face_short_range.tflite` model for face detection.
  - Off-screen canvas processing for images.
  - Gaussian blur application to detected face bounding boxes.
  - Redacted image Blob output.
- Created `BlackoutEngine` view with:
  - Hero section explaining the tool.
  - 3-step workflow diagram (Drop Image → AI Detection → Auto Redact).
  - Drop zone with processing states.
  - Technical details card.
- Terminal logging: LOADING WEBASSEMBLY ML MODEL, [X] FACES DETECTED, APPLYING LOCAL REDACTION.

### New Files
- `src/hooks/useBlackoutEngine.ts` - MediaPipe face detection hook.
- `src/views/BlackoutEngine.tsx` - Face redaction UI component.
- `src/views/PhantomPayload.tsx` - Placeholder for Phase 2 encrypted file transfer.

### Modified Files
- `src/App.tsx` - Added routes for BlackoutEngine and PhantomPayload.
- `src/components/Sidebar.tsx` - New navigation icons and menu items.
- `package.json` - Added @mediapipe/tasks-vision dependency.

## Security and Privacy Validation Notes
- No network upload paths were added or modified.
- Face detection runs entirely locally via WebAssembly (MediaPipe).
- ML model is loaded from CDN but processing happens client-side only.
- Sanitization path remains browser-local (`File`, `Blob`, `Canvas`) and privacy-first.
- CodeQL security scan passed with zero vulnerabilities.

## Verification Notes
- Build passes with `npm run build`.
- Face detection tested successfully (1 face detected in test image).
- Terminal logging working as specified.
- App remains static-host compatible.

## Follow-Up Ideas
- Implement Phantom Payload (encrypted P2P file transfer) in Phase 2.
- Add batch face redaction for multiple images.
- Add adjustable blur intensity slider.
- Consider caching the ML model in Service Worker for offline support.
