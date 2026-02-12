# Ghost Drop Web

Privacy-first, client-side-only image metadata sanitizer.

## Current Status

- ✅ **Phase 1 complete:** React + Vite + Tailwind cyberpunk UI scaffold.
- ✅ **Phase 2 complete:** In-browser metadata shredding hook with no recompression.
- ✅ **Phase 3 complete:** Dropzone interaction loop wired with Idle/Processing/Done states, auto-download, and mobile Web Share support.
- ✅ **Phase 4 complete:** PWA installability, offline service worker cache, and Android Web Share Target handoff support.

## Privacy Guarantees

- No backend server exists in this project.
- No image data is uploaded to any API.
- All sanitization occurs in browser memory.
- Original visual quality is preserved by removing metadata at container/chunk level instead of canvas re-encoding.

## PWA Features (Phase 4)

- `manifest.webmanifest` enables install prompts with standalone display mode.
- Service worker (`public/sw.js`) provides offline shell caching and app startup without network, including text-based icon assets.
- Web Share Target (`/share-target`) receives Android gallery shares and stores the incoming image locally in Cache Storage.
- Shared images are sanitized automatically on app launch and downloaded immediately with `_clean` suffix.

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

- Confirmed no backend/server routes were added.
- Confirmed service worker handles share target data locally and never posts to third-party endpoints.
- Confirmed all processing still uses browser APIs only (`File`, `Blob`, `Cache Storage`, `Service Worker`).
