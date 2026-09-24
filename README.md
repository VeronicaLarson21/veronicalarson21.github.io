# Stacks — Reading Tracker (PWA)

A minimal, offline-first reading tracker: log books, browse your TBR by
fiction/nonfiction with a page-length filter, and see what you've read this
year. Data lives on your phone (localStorage) — nothing is sent anywhere.

## Files
- `index.html` — the app
- `manifest.json` — PWA metadata (name, icons, colors)
- `service-worker.js` — caches the app so it loads with no signal
- `icon-192.png`, `icon-512.png` — home screen icons

## Hosting it for free (no Mac, no Xcode needed)

Any static host works — you're just uploading these five files as-is, no
build step. Pick whichever feels easiest:

### Option A: Cloudflare Pages (recommended — fast, generous free tier)
1. Go to pages.cloudflare.com and sign up (free).
2. Create a project → "Upload assets" (no Git needed).
3. Drag this whole folder in and deploy.
4. You'll get a URL like `stacks-xyz.pages.dev`.

### Option B: Netlify
1. Go to app.netlify.com/drop.
2. Drag the folder onto the page — it deploys instantly, no account
   strictly required (an account lets you keep/update it later).
3. You get a URL like `random-name.netlify.app`.

### Option C: GitHub Pages
1. Create a free GitHub account and a new repository.
2. Upload these files via the GitHub website (Add file → Upload files —
   no command line needed).
3. In the repo's Settings → Pages, set the source to the `main` branch,
   root folder.
4. Your site appears at `yourusername.github.io/repo-name`.

All three are free for a personal app like this at zero cost, with no
credit card required.

## Installing it on your iPhone
1. Open the hosted URL in **Safari** (must be Safari, not Chrome, for the
   install step to appear).
2. Tap the Share icon → **Add to Home Screen**.
3. It now opens full-screen from your home screen, works offline after
   the first load, and keeps your data on-device.

## Updating it later
If you tweak `index.html` and re-upload, most hosts (Cloudflare Pages,
Netlify) auto-deploy on re-upload. GitHub Pages updates within a minute
of pushing a change. Your reading data itself lives in the phone's
browser storage and is untouched by redeploys.
