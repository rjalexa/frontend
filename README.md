# README.md
# Article Entity & Highlights Viewer

A Next.js application for viewing articles with their associated entities (people, locations, organizations) and highlights.

## Features

- Display articles from static JSON files
- Show entities (people, locations, organizations) for each article
- View article highlights 
- Interactive map view for locations

## Prerequisites

- Node.js
- pnpm

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
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   │   ├── files/            # Endpoints for handling file-related operations
│   │   └── highlights/       # Endpoints for managing article highlights
│   ├── article/              # Article view pages
│   │   ├── [id]/             # Dynamic routes for individual articles
│   │   └── loading.tsx       # Loading state for articles
│   ├── map/                  # Map view pages
│   │   ├── [id]/             # Dynamic routes for individual maps
│   │   └── loading.tsx       # Loading state for maps
│   ├── providers/            # App-wide providers
│   │   └── theme-provider.tsx # Manages theme and context
│   ├── layout.tsx            # Root layout for the application
│   ├── globals.css           # Global CSS styles
│   ├── favicon.ico           # App favicon
│   ├── loading.tsx           # Global loading state
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── article/              # Components for displaying article-related data
│   │   ├── content/          # Components for article content
│   │   ├── panels/           # Panels for specific article sections
│   │   │   ├── highlights/   # Highlight panel components
│   │   │   ├── maps/         # Map panel components
│   │   │   ├── summary/      # Summary panel components
│   │   │   └── topics/       # Topics panel components
│   │   └── types.ts          # Type definitions for article-related components
│   ├── entities/             # Components for displaying entities (people, places, etc.)
│   │   ├── EntitiesPanel.tsx # Entity display panel
│   │   └── EntityCard.tsx    # Entity card component
│   ├── header/               # Header components
│   │   └── Header.tsx        # Main app header
│   └── ui/                   # Shared UI components
│       └── card/             # Card components
│           └── index.tsx     # Card implementation
├── data/                     # Static JSON files for articles and merged AI data
├── lib/                      # Utility functions
│   └── utils/                # General-purpose utility functions
├── public/                   # Static assets
│   ├── file.svg              # File-related icon
│   ├── globe.svg             # Globe-related icon
│   ├── manifesto_logo.svg    # App logo
│   ├── mema.svg              # Mema-related icon
│   ├── next.svg              # Next.js logo
│   ├── vercel.svg            # Vercel logo
│   └── window.svg            # Window-related icon
├── types/                    # TypeScript type definitions
│   ├── article.ts            # Type definitions for articles
│   ├── entity.ts             # Type definitions for entities
│   ├── panel.ts              # Type definitions for panels
│   ├── raw.ts                # Type definitions for raw data
│   └── index.ts              # Index for exported types
├── Dockerfile                # Dockerfile for containerizing the application
├── docker-compose.yml        # Docker Compose configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.mjs        # PostCSS configuration
├── prepend_headers.sh        # Shell script for adding headers
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies and scripts
├── pnpm-lock.yaml            # Lockfile for pnpm
├── README.md                 # Project documentation
└── custom.d.ts               # Custom TypeScript declarations

```

## Dependencies

- Next.js 15
- React 18
- Tailwind CSS
- shadcn/ui components

## Notes

- Article data should be placed in JSON files in the `/data` directory
- Map functionality is available for articles/entities with location data