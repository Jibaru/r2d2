# r2d2 — CLAUDE.md

> **Purpose:** r2d2 is a music radio app that creates AI-generated stations using ElevenLabs Music API. Users select genres via roulette, tracks are generated sequentially, stored in UploadThing, and cached in PostgreSQL for instant playback.

## Architecture

* **Frontend**: Next.js 15 + TypeScript + shadcn/ui + Tailwind CSS
* **Backend**: PostgreSQL + Drizzle ORM (document-style with JSONB)
* **Storage**: UploadThing for MP3 files (CDN delivery)
* **AI**: ElevenLabs Music API with sequential generation (rate-limit compliant)
* **Package Manager**: bun

## Core Features

1. **Genre Roulette**: 20 genres with 8 styles each (160 total combinations)
2. **Sequential Generation**: Tracks generated one-by-one to respect ElevenLabs rate limits
3. **Persistent Storage**: Tracks cached in PostgreSQL + UploadThing for reuse
4. **Queue Management**: Auto-prefetch maintains 2 tracks ahead
5. **Station Persistence**: Save/load stations with tracks

## Development

```bash
bun install          # Install dependencies
bun dev             # Start dev server
bun run format      # Format code (required after changes)
bun run lint        # Check code quality
bun run build       # Build for production
bun run db:generate # Generate database migrations
```

**Rules**: English code only, no comments (use clear names), run biome after every change.

## Key Files

```
app/
├─ api/
│  ├─ music/compose/route.ts     # ElevenLabs generation + UploadThing
│  ├─ stations/route.ts          # Station CRUD
│  └─ uploadthing/              # UploadThing configuration
├─ station/[id]/page.tsx        # Station player page
└─ page.tsx                     # Home with roulette

lib/
├─ db/
│  ├─ schema.ts                 # PostgreSQL schema (document-style)
│  └─ migrations/               # Drizzle migrations
├─ repositories/                # Database access layer
├─ elevenlabs/                  # AI music generation
├─ presets.ts                   # 20 genres × 8 styles
└─ utils/composeLock.ts         # Sequential generation lock

hooks/useQueue.ts               # Client-side queue management
```

## Database Schema

```ts
// Document-style PostgreSQL with JSONB
interface StationContent {
  requiredGenres: string[];
  selectedStyles: string[];
  seed?: string | number;
  name?: string;
}

interface TrackContent {
  title?: string;
  duration: number;
  filePath: string;        // UploadThing URL
  generatedAt: string;
  stationId: string;
  compositionPlan?: Record<string, unknown>;
}
```

## Environment Variables

```env
ELEVENLABS_API_KEY=sk-...
DATABASE_URL=postgresql://username:password@localhost:5432/r2d2
UPLOADTHING_TOKEN=ut_token_...
NODE_ENV=development
```

## Rate Limiting & Sequential Generation

**Problem**: ElevenLabs allows max 2 concurrent requests
**Solution**: Sequential generation with locks

- **Server**: `composeLock` ensures one ElevenLabs call at a time
- **Client**: `isGeneratingRef` prevents multiple prefetch calls
- **Queue**: Tracks generated one-by-one, added immediately when ready

## Available Genres (20 total)

`lofi`, `ambient`, `jazz`, `electronic`, `hip-hop`, `house`, `techno`, `dubstep`, `rock`, `pop`, `r&b`, `classical`, `folk`, `reggae`, `funk`, `country`, `metal`, `world`, `experimental`, `chill`

Each genre has 8 unique styles (160 total style combinations).
