# Article Entity & Highlights Viewer

A Next.js application for viewing articles with their associated entities (people, locations, organizations) and highlights.

## Features

- Display articles from static JSON files
- Show entities (people, locations, organizations) for each article
- View article highlights (requires Weaviate connection)
- Interactive map view for locations

## Prerequisites

- Node.js
- pnpm
- Weaviate instance running on localhost:8080

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Place your article JSON files in the `/data` directory

3. Start the development server:
```bash
pnpm dev
```

Access the application at http://localhost:3000

## Project Structure

```
.
├── app/                  # Next.js app router
│   ├── api/             # API routes
│   ├── article/         # Article view pages
│   └── map/            # Map view pages
├── components/          # React components
├── data/               # Static article JSON files
└── lib/                # Utility functions
```

## Dependencies

- Next.js 15
- React 18
- Tailwind CSS
- shadcn/ui components
- Weaviate client (for highlights feature)

## Notes

- The highlights feature requires a running Weaviate instance on localhost:8080
- Article data should be placed in JSON files in the `/data` directory
- Map functionality is available for entities with location data