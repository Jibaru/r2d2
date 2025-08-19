# r2d2 — CLAUDE.md

> **Purpose:** This document explains the architecture, developer guidelines, and usage patterns for **r2d2** — a music radio app that creates on-demand stations from a genre/style roulette and pre-generates the next tracks while the current one plays. All code must be written in **English**, modular, and without unnecessary comments (use clear function and module names instead).

---

## High-level goals

* Let users create a radio station by picking required genres/styles (for example: `lofi` required) and a roulette of derived sub-styles (e.g., 8 lofi sub-styles).
* When a station plays a track, the next track is generated in the background and appended to the queue so playback never stalls.
* Generation uses ElevenLabs music API (`@elevenlabs/elevenlabs-js`, check `music_api_docs.md` for more information) for composing audio based on a composition plan.
* Tech stack: **Next.js** with **TypeScript**, **bun** (package manager & runtime), **biome** (dev dependency for lint/format), **shadcn + Tailwind CSS** for UI.

---

## Features

1. Station roulette

   * User marks mandatory genres (e.g., `lofi`).
   * The app expands that genre into a set of sub-styles (preset lists). For mandatory `lofi`, the roulette contains 8 different lofi styles.
   * The roulette chooses N styles for a station and builds a station profile.

2. Continuous generation and queueing

   * While the current track plays, the app pre-generates the next track(s).
   * Generated track(s) are saved (stream/cache) and queued. On `next` or `end`, the next item in the queue plays instantly.

3. Modular server-side generation API (Next.js route)

   * Responsible for calling ElevenLabs with a `compositionPlan` and returning a streaming response or a URL to a cached file.

4. Client playback

   * Robust WebAudio/HTMLAudio playback with queue management, progress, and `skip`.
   * Visual roulette UI and station editor.

5. Dev experience

   * Run `biome` after each task. Integrate `biome` into CI and optionally into git hooks.

---

## Conventions & rules

* Code language: **English only** (identifiers, file names, commit messages).
* Keep files small; prefer `function` or `module` extraction over long explanatory comments.
* Use TypeScript everywhere for typesafety.
* Keep UI components presentational and hook state into separate hooks/services.
* Write clear function names that read like documentation. Prefer `createCompositionPlanForStation()` over `doStuff()`.
* After finishing any task or change, run the linter and auto-formatter (`biome`) and fix issues before pushing.

Suggested developer flow:

```bash
# install deps
bun install

# dev server
bun dev

# run formatter and linter after each task
biome format
biome check
```

Put `biome` in `devDependencies` and add scripts in `package.json`.

---

## Recommended folder structure

```
/r2d2
├─ app/                      # Next.js (app router) or pages/
│  ├─ api/
│  │  ├─ music/compose/route.ts   # server API to call ElevenLabs
│  │  └─ music/status/route.ts    # check status of composition tasks
│  ├─ station/[id]/page.tsx       # station player page
│  └─ ...
├─ components/
│  ├─ RadioPlayer/               # player UI (small presentational components)
│  ├─ Roulette/                  # roulette UI and logic
│  └─ Shared/                    # primitives (Button, Icon, Spinner)
├─ hooks/
│  ├─ useQueue.ts                # client queue & prefetch logic
│  └─ useStation.ts
├─ lib/
│  ├─ elevenlabs/                # adapters for ElevenLabs client
│  └─ audio/                     # helpers for streaming, decoding, caching
├─ server/
│  ├─ workers/                   # background job workers (if needed)
│  └─ storage/                   # file caching helpers
├─ styles/                       # tailwind + shadcn configs
├─ utils/                        # small pure helpers
├─ .biome/                       # biome config
└─ package.json
```

---

## Station roulette: presets & behavior

* Maintain a presets file `lib/presets.ts` that maps a root genre to a list of sub-styles.
* Example entry for `lofi` should expose at least 8 lofi styles, e.g.:

  * `lofi hip-hop`, `chilled piano lofi`, `nostalgic lofi`, `jazzy lofi`, `instrumental lofi`, `lofi ambient`, `study lofi`, `lofi with vinyl crackle`.
* A station definition contains:

  ```ts
  interface StationProfile {
    id: string;
    requiredGenres: string[]; // e.g. ['lofi']
    selectedStyles: string[]; // final expanded list from roulette
    seed?: string | number;   // to reproduce roulette results
  }
  ```
* Roulette algorithm: expand required genres into candidate styles, shuffle (seeded optional), take `N`.

---

## Composition plan & ElevenLabs

* Create a function `createCompositionPlanForStation(profile: StationProfile, targetDurationMs: number): MusicPrompt`.
* Prefer deterministic composition plans per station + timestamp so that generation is reproducible if needed.

**Example composition plan usage**

```ts
// lib/elevenlabs/client.ts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

export const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
```

```ts
// lib/elevenlabs/plan.ts
import type { MusicPrompt } from "@elevenlabs/elevenlabs-js/api";

export function createCompositionPlanForStation(profile, durationMs = 120_000): MusicPrompt {
  return {
    positiveGlobalStyles: [
      ...profile.selectedStyles, // mix the styles into positive styles
      "warm reverb",
      "vinyl crackle",
      "70-80 bpm",
    ],
    negativeGlobalStyles: ["loud", "distorted", "aggressive"],
    sections: [
      { sectionName: "Intro", positiveLocalStyles: ["soft pads"], negativeLocalStyles: ["drums"], durationMs: 20000, lines: [] },
      // more sections derived from selectedStyles...
    ],
  };
}
```

**Server-side composition route (high level)**

* `/api/music/compose` accepts `{ stationId, durationMs, seed? }`.
* It calls `createCompositionPlanForStation(...)` then `elevenlabs.music.compose({ compositionPlan })`.
* Stream the result and persist to ephemeral cache storage (local disk, S3, or object store) and return a playback URL or cached id.
* Ensure composition requests are rate-limited and queued to avoid hitting provider limits.

***Note on streaming:*** ElevenLabs returns a readable stream (or web stream). Convert to a Node readable and stream to disk. Save as mp3 or return as chunked stream to client.

---

## Client: playback & prefetch strategy

* `useQueue` hook responsibilities:

  * Keep a queue of `Track` objects: `{ id, url, metadata, duration, state }`.
  * Keep `currentIndex` pointer.
  * Expose `play`, `pause`, `next`, `previous`.
  * When `current` starts playing, ensure `prefetchNext()` is triggered if queue length is below threshold (e.g., 2 tracks ahead).
  * Prefetch calls server API `/api/music/compose` with station profile and stores returned URL in queue entry.

* Playback using `HTMLAudioElement` or WebAudio for lower-level control. Decode metadata and show waveform/progress.

* On `ended` event, auto-advance to next queued track.

---

## Caching & storage

* Short-lived local cache: store generated tracks under `/server/storage/cache/:stationId/:trackId.mp3` for a TTL (e.g., 24 hours).
* For scale, push generated tracks to S3 and return signed URLs to players.
* Use a small metadata DB (SQLite or in-memory Redis) to keep track of generation status, file path, fingerprint.

---

## Background worker / job queue

* Use a simple in-process queue for MVP or external queue (BullMQ / RSMQ) for scale.
* Worker responsibilities:

  * Dequeue compose requests.
  * Call ElevenLabs, stream result to storage.
  * Update metadata (ready/failed).
* API routes should submit tasks and return a task id; client polls or listens on websocket/Server-Sent Events for status.

---

## Error handling & resilience

* If generation fails, keep a short fallback (a pre-generated loop or crossfade to previous track).
* Implement rate-limiting and exponential backoff for ElevenLabs calls.
* Validate composition plan size and sections to avoid excessive request payloads.

---

## Security & environment

* Keep `ELEVENLABS_API_KEY` in environment variables.
* Do not commit secrets.
* Restrict public endpoints to return only signed/cached URLs — never raw provider keys.

Env example (.env):

```
ELEVENLABS_API_KEY=sk-...
NODE_ENV=development
CACHE_DIR=./server/storage/cache
```

---

## CI, linting and developer workflow

* Add `biome` as a dev dependency.
* Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "bun dev",
    "build": "next build",
    "start": "next start",
    "format": "biome format",
    "lint": "biome check",
    "prepare": "biome format && biome check"
  }
}
```

* Developer guideline: after every task (feature, fix), run:

```bash
biome format
biome check
```

* Optionally add a `pre-commit` git hook to run the formatter and linter.

---

## Example: server composition route (sketch)

```ts
// app/api/music/compose/route.ts
import type { NextRequest } from 'next/server';
import { elevenlabs } from '@/lib/elevenlabs/client';
import { createCompositionPlanForStation } from '@/lib/elevenlabs/plan';
import { saveStreamAsMP3 } from '@/lib/audio/saveStream';

export async function POST(request: NextRequest) {
  const { stationId, durationMs } = await request.json();

  const profile = await getStationProfile(stationId);
  const compositionPlan = createCompositionPlanForStation(profile, durationMs);

  const trackStream = await elevenlabs.music.compose({ compositionPlan });

  const filename = await saveStreamAsMP3(trackStream, buildCachePath(stationId));

  return new Response(JSON.stringify({ url: `/api/music/cache/${filename}` }), { status: 200 });
}
```

And an adapted `saveStreamAsMP3` helper like the one you provided should be used server-side to persist the result.

---

## UX recommendations

* Roulette UI should clearly show which genres are required and allow users to lock/unlock picks.
* Show station queue timeline and an indicator when the next track is being generated.
* Add an option to regenerate a specific queued slot (regenerate next).
* Provide crossfade and volume normalization for smooth listening.

---

## Testing & observability

* Unit test: composition plan generator, presets expansion, queue logic.
* Integration test: mock ElevenLabs client to validate streaming and saving logic.
* Monitoring: capture fetch/generation success rates, latency, and provider errors.

---

## Accessibility & i18n

* Make sure player controls are keyboard accessible and have aria labels.
* Although code must be written in English, keep all UI translatable (i18n-ready strings).

---

## Final notes & checklist

* [ ] Code in English.
* [ ] Modular, single-responsibility functions instead of long comments.
* [ ] Biome run after every change (format + check).
* [ ] Station roulette presets file with at least 8 lofi sub-styles.
* [ ] Prefetch/queue logic implemented (`useQueue` hook).
* [ ] Compose route that streams to disk and returns cached URLs.

---

### Quick reference — ElevenLabs composition example

(Adapted from your snippet; place into `lib/elevenlabs/example.ts`)

```ts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import { saveStreamAsMP3 } from "@/lib/audio/saveStream";
import type { MusicPrompt } from "@elevenlabs/elevenlabs-js/api";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

const compositionPlan: MusicPrompt = {
  positiveGlobalStyles: ["lofi hip-hop", "chill", "warm reverb", "vinyl crackle", "70-80 bpm"],
  negativeGlobalStyles: ["aggressive", "loud", "fast-paced"],
  sections: [
    { sectionName: "Ambient Intro", positiveLocalStyles: ["soft ambient pads", "vinyl crackle"], negativeLocalStyles: ["drums"], durationMs: 20000, lines: [] },
    { sectionName: "Piano Entry", positiveLocalStyles: ["soft jazz piano chords"], negativeLocalStyles: ["fast arpeggios"], durationMs: 25000, lines: [] },
    // ... more sections
  ]
};

export async function composeExample() {
  const trackStream = await client.music.compose({ compositionPlan });
  await saveStreamAsMP3(trackStream, `./server/storage/cache/example_lofi_${Date.now()}.mp3`);
}
```

---

If you want, I can now:

* Produce a starting Git repo scaffold with the folder structure and the example `compose` route.
* Generate `useQueue` hook and a minimal player component (React + Tailwind + shadcn) as a single-file preview.

Choose one and I will scaffold it (remember: code will be in English and I'll run `biome format`/`biome check` commands as part of the workflow steps).
