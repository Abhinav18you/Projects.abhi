# Ghost Drop Web

Privacy-first, client-side-only image metadata sanitizer.

## Current Status

- ✅ **Phase 1 complete:** React + Vite + Tailwind cyberpunk UI scaffold.
- ✅ **Phase 2 complete:** In-browser metadata shredding hook with no recompression.
- ✅ **Phase 3 complete:** Dropzone interaction loop wired with Idle/Processing/Done states, auto-download, and mobile Web Share support.
- ⏳ **Phase 4 pending:** PWA install/offline/share-target manifest and service worker.

## Privacy Guarantees

- No backend server exists in this project.
- No image data is uploaded to any API.
- All sanitization occurs in browser memory.
- Original visual quality is preserved by removing metadata at container/chunk level instead of canvas re-encoding.

## Phase 3 Behavior

1. **Idle:** `Drop image here to sanitize.`
2. **Processing:** Shows `Shredding metadata...` with a progress bar pulse (minimum 500ms UX delay).
3. **Done:** Shows `Clean! (GPS Removed)`, auto-downloads `<original>_clean.<ext>`, and displays a Share button when `navigator.share` is supported.

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
```

> Note: Installing additional npm packages may be blocked by environment policy in this workspace (HTTP 403 from registry).
