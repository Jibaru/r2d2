# r2d2

AI-powered music radio stations using ElevenLabs Music API. Create custom stations by selecting genres through a roulette system.

## Features

- **Genre Roulette**: 20 genres × 8 styles (160 combinations)
- ElevenLabs Music API with sequential generation
- PostgreSQL + UploadThing CDN
- Auto-prefetch maintains playback
- Next.js 15 + shadcn/ui

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables (see .env.example)
cp .env.example .env

# Run database migrations
bun run db:generate

# Start development server
bun dev
```

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: PostgreSQL, Drizzle ORM
- **Storage**: UploadThing
- **AI**: ElevenLabs Music API
- **Package Manager**: bun

## Environment Variables

```env
ELEVENLABS_API_KEY=sk-...
DATABASE_URL=postgresql://...
UPLOADTHING_TOKEN=ut_token_...
```

## Available Genres

`lofi`, `ambient`, `jazz`, `electronic`, `hip-hop`, `house`, `techno`, `dubstep`, `rock`, `pop`, `r&b`, `classical`, `folk`, `reggae`, `funk`, `country`, `metal`, `world`, `experimental`, `chill`

## Development

```bash
bun run format      # Format code (required)
bun run lint        # Check code quality
bun run build       # Build for production
```
