# Ghost Drop Web – Agent Context Log

## Project Identity
- **Name:** Ghost Drop Web
- **Mission:** Privacy-first, client-side-only image metadata sanitizer.
- **Core rule:** No image or metadata may leave the browser (zero backend uploads).

## Phase Plan (Authoritative)
1. **Phase 1 (done):** React + Vite + Tailwind UI scaffold.
2. **Phase 2 (done):** Metadata shredding logic.
3. **Phase 3 (done):** Connected UI states + download/share loop.
4. **Phase 4 (done):** PWA install + offline + share target.

## What Was Already Done Before This Attempt
- React + TypeScript + Vite app scaffolded.
- Tailwind dark cyberpunk styling applied.
- Hero + drag-and-drop zone + privacy footer implemented.
- No backend endpoints, no upload flow.
- `useMetadataShredder` hook implemented with no-recompression metadata stripping.

## What This Attempt Adds (Phase 4)
- Added PWA install metadata via `public/manifest.webmanifest`.
- Added text-based install icons (`public/icon-192.svg`, `public/icon-512.svg`) to avoid binary-file PR limitations.
- Added service worker (`public/sw.js`) for:
  - Offline shell caching and navigation fallback.
  - Android Web Share Target POST handling at `/share-target`.
  - Local handoff of shared image via Cache Storage endpoint (`/shared-image`).
- Registered service worker in `src/main.tsx`.
- Updated app (`src/App.tsx`) to auto-load shared-target images from local cache and sanitize them immediately.
- Updated `index.html` with PWA tags (`manifest`, `theme-color`, Apple mobile app tags).

## Security and Privacy Validation Notes
- No network upload APIs were introduced.
- No backend or remote storage dependencies were added.
- Share Target files are processed locally via Service Worker + Cache Storage.
- Sanitization path remains in-memory and browser-local.

## Verification Notes
- Production build succeeds (`npm run build`).
- PWA artifacts included in generated `dist/` output.
- Service worker and manifest are static-host compatible (Vercel/GitHub Pages static hosting).

## Follow-Up Ideas
- Add branded icon artwork for stronger home-screen identity.
- Add user-facing install prompt UX for browsers supporting `beforeinstallprompt`.
