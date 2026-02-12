# Ghost Drop Web

Privacy-first, client-side-only image metadata sanitizer with a stealth terminal interface.

## Current Status

- ✅ **Phase 1 complete:** React + Vite + Tailwind cyberpunk scaffold.
- ✅ **Phase 2 complete:** In-browser metadata shredding hook with no recompression.
- ✅ **Phase 3 complete:** Dropzone interaction loop with Idle/Processing/Done states.
- ✅ **Phase 4 complete:** PWA installability, offline service worker cache, and Android Web Share Target handoff.
- ✅ **Phase 5 complete:** Full "Stealth Mode" UI overhaul with tactical terminal visuals, progressive log animation, and explicit post-clean actions.

## Privacy Guarantees

- No backend server exists in this project.
- No image data is uploaded to any API.
- All sanitization occurs in browser memory.
- Original visual quality is preserved by removing metadata at container/chunk level instead of canvas re-encoding.

## UI Behavior

- **Idle:** `DRAG IMAGE TO INCINERATE` with upload icon and terminal-style cursor pulse.
- **Processing:** lock spinner, sharp neon progress line, and animated terminal log lines.
- **Success:** `CLEAN.` state with size-saved summary and dedicated actions for **Download** and **Scan Another**.
- Processing view is held for at least **1.5s** to ensure users can see the in-browser sanitization animation.

## PWA Features (Phase 4)

- `manifest.webmanifest` enables install prompts with standalone display mode.
- Service worker (`public/sw.js`) provides offline shell caching and app startup without network.
- Web Share Target (`/share-target`) receives Android gallery shares and stores the incoming image locally in Cache Storage.
- Shared images are sanitized automatically on app launch.

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
```

## Security Checks Performed

- Confirmed no backend/server upload routes were introduced in UI changes.
- Confirmed sanitization still uses local browser APIs only (`File`, `Blob`, `Cache Storage`, `Service Worker`).
- Confirmed processing animation is UI-only and does not add telemetry or outbound calls.
