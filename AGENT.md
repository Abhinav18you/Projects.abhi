# Ghost Drop Web – Agent Context Log

## Project Identity
- **Name:** Ghost Drop Web
- **Mission:** Privacy-first, client-side-only image metadata sanitizer.
- **Core rule:** No image or metadata may leave the browser (zero backend uploads).

## Phase Plan (Authoritative)
1. **Phase 1 (done):** React + Vite + Tailwind UI scaffold.
2. **Phase 2 (done):** Metadata shredding logic.
3. **Phase 3 (done in this attempt):** Connected UI states + download/share loop.
4. **Phase 4 (pending):** PWA install + offline + share target.

## What Was Already Done Before This Attempt
- React + TypeScript + Vite app scaffolded.
- Tailwind dark cyberpunk styling applied.
- Hero + drag-and-drop zone + privacy footer implemented.
- No backend endpoints, no upload flow.
- `useMetadataShredder` hook implemented with no-recompression metadata stripping.

## What This Attempt Adds (Phase 3)
- Wired `useMetadataShredder` into `react-dropzone` `onDrop` flow.
- Added 3-state interaction loop:
  - Idle: `Drop image here to sanitize.`
  - Processing: `Shredding metadata...` with 500ms minimum UX delay and progress pulse.
  - Done: `Clean! (GPS Removed)`.
- Added automatic sanitized file download with `_clean` filename suffix.
- Added mobile-first Web Share button using `navigator.share` + `navigator.canShare` checks.
- Added dropzone disable/visual wait state while processing.

## Security and Privacy Validation Notes
- No network requests were introduced.
- No backend or upload routes were added.
- Processing remains fully in-memory and local to the browser.

## Known Constraints / Environment Notes
- Package registry access is restricted in this environment.
- `npm install file-saver` failed with HTTP 403; native browser download API is used instead.

## Next Actions (Phase 4 target)
- Add web app manifest and install metadata.
- Add service worker for offline capability.
- Configure Web Share Target API in manifest for Android inbound gallery shares.
