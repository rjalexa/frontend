This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# DETAILS

# Project Structure Overview

This is a Next.js project using TypeScript, Tailwind CSS, and various UI components from shadcn/ui. Here's a breakdown of the key directories and files:

## Core Directories

### `/app`

The main application directory using Next.js 13+ App Router architecture.

- `/app/api/` - API route handlers

  - `/files` - File-related API endpoints
  - `/highlights` - Highlights feature endpoints
  - `/weaviate-health` - Health check endpoints for Weaviate integration

- `/app/article/[id]` - Dynamic article pages
- `/app/map/[id]` - Dynamic map pages with custom map components
- `/app/providers` - Application-wide providers (e.g., theme provider)

### `/components`

Reusable React components

- `/components/ui/` - UI component library (shadcn/ui components)

  - `button.tsx` - Button component
  - `card.tsx` - Card component
  - `dialog.tsx` - Dialog/modal component
  - `dropdown-menu.tsx` - Dropdown menu component

- `/components/highlights` - Feature-specific components for highlights functionality
- `EntityDashboard.tsx` - Main dashboard component

### `/lib`

Utility functions and shared logic

- `utils.ts` - Common utility functions

## Important Files

### Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind

### Core Application Files

- `/app/layout.tsx` - Root layout component
- `/app/page.tsx` - Home page component
- `/app/globals.css` - Global styles

### Asset Directories

- `/app/fonts/` - Custom fonts (Geist)
- `/public/` - Static assets
  - Various SVG files for icons and images

## Key Features

1. **Article System**

   - Dynamic article pages with [id] based routing
   - Highlight functionality with dedicated API endpoints

2. **Map Integration**

   - Custom map components using Leaflet
   - Dynamic map pages with ID-based routing

3. **UI Components**

   - Utilizes shadcn/ui component library
   - Custom theme provider for consistent styling
   - Responsive design with Tailwind CSS

4. **API Integration**
   - File handling endpoints
   - Highlight management
   - Weaviate integration for health checks

## Dependencies

Major dependencies include:

- Next.js 15.0.3
- React 19.0.0-rc
- Tailwind CSS 3.4
- Leaflet for mapping
- shadcn/ui components
- Lucide React for icons

## Development Stack

- TypeScript for type safety
- ESLint for code quality
- PostCSS for CSS processing
- PNPM as package manager

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```

The application should now be running at `http://localhost:3000`
