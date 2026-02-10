# Ghost Drop Web – Agent Context Log

## Project Identity
- **Name:** Ghost Drop Web
- **Mission:** Privacy-first, client-side-only image metadata sanitizer.
- **Core rule:** No image or metadata may leave the browser (zero backend uploads).

## Phase Plan (Authoritative)
1. **Phase 1 (done):** React + Vite + Tailwind UI scaffold.
2. **Phase 2 (in progress here):** Build metadata shredding logic.
3. **Phase 3 (pending):** Connect UI states + download/share loop.
4. **Phase 4 (pending):** PWA install + offline + share target.

## What Was Already Done Before This Attempt
- React + TypeScript + Vite app scaffolded.
- Tailwind dark cyberpunk styling applied.
- Hero + drag-and-drop zone + privacy footer implemented.
- No backend endpoints, no upload flow.

## What This Attempt Adds
- Added a new hook at `src/hooks/useMetadataShredder.ts`.
- Hook accepts JPG/PNG/WEBP files and returns sanitized `Blob` output.
- Metadata removal is done as **container-level binary chunk/segment stripping** to avoid image recompression:
  - JPEG: removes metadata APP markers (APP1/APP2/APP13) while preserving compatibility markers.
  - PNG: removes metadata chunks (`eXIf`, `iTXt`, `tEXt`, `zTXt`, `tIME`).
  - WEBP: removes `EXIF` and `XMP ` chunks and updates `VP8X` flags.
- Hook exposes `isProcessing` and `error` for UI integration in Phase 3.

## Current Status
- Phase 2 core logic exists in a reusable hook with safer JPEG marker handling and WEBP VP8X flag updates.
- Hook not yet wired into the dropzone UI (intentionally deferred to Phase 3).

## Known Constraints / Environment Notes
- Package registry access is restricted in this environment.
- `npm install` fails with HTTP 403 against `registry.npmjs.org` (cannot install dependencies currently).
- Implementation avoids requiring newly installed packages until registry access is available.

## Do / Don’t for Future Agents
### Do
- Keep all processing in-browser and in-memory.
- Preserve original image quality (no canvas re-encode for metadata removal).
- Keep code auditable and explicit for open-source review.
- Continue phase-by-phase; do not jump ahead unless explicitly requested.

### Don’t
- Don’t introduce backend upload endpoints.
- Don’t send files to third-party APIs.
- Don’t add compression/transcoding as part of metadata stripping.
- Don’t remove this context file; update it instead.

## Next Actions (Phase 3 target)
- Wire `useMetadataShredder` into `react-dropzone` flow.
- Add Idle/Processing/Done UI states.
- Trigger file download with clean naming convention.
- Add mobile `navigator.share` fallback path.
