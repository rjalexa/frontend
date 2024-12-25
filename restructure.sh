#!/bin/bash

# Create new directory structure
echo "Creating new directory structure..."
mkdir -p "app/_routes/article/[id]"
mkdir -p "app/_routes/map/[id]"
mkdir -p "components/article/content"
mkdir -p "components/article/panels/highlights"
mkdir -p "components/article/panels/topics"
mkdir -p "components/article/panels/summary"
mkdir -p "components/common"
mkdir -p "components/ui/button"
mkdir -p "components/ui/card"
mkdir -p "components/ui/dialog"
mkdir -p "components/ui/dropdown"
mkdir -p "components/ui/slide"
mkdir -p "types"
mkdir -p "lib/utils"
mkdir -p "lib/constants"

# Move routes and reorganize app directory
echo "Reorganizing app directory..."
# Keep existing api directory structure
mv "app/api" "app/_routes/api"
mv "app/article/[id]/page.tsx" "app/_routes/article/[id]/"
mv "app/article/loading.tsx" "app/_routes/article/"
mv "app/map/[id]/page.tsx" "app/_routes/map/[id]/"
mv "app/map/[id]/MapComponent.tsx" "app/_routes/map/[id]/"
mv "app/map/[id]/components/DynamicMapWrapper.tsx" "app/_routes/map/[id]/"
mv "app/map/loading.tsx" "app/_routes/map/"
mv "app/page.tsx" "app/_routes/"

# Reorganize components
echo "Reorganizing components..."
# Move ArticleContent to new structure
mv "components/article/ArticleContent.tsx" "components/article/content/"

# Create panels directory structure
mv "components/article/panels/HighlightsPanel.tsx" "components/article/panels/highlights/index.tsx"
mv "components/article/panels/TopicsPanel.tsx" "components/article/panels/topics/index.tsx"
mv "components/article/panels/SummaryPanel.tsx" "components/article/panels/summary/index.tsx"

# Move Header to common
mv "components/Header.tsx" "components/common/"

# Reorganize UI components
mv "components/ui/button.tsx" "components/ui/button/index.tsx"
mv "components/ui/card.tsx" "components/ui/card/index.tsx"
mv "components/ui/dialog.tsx" "components/ui/dialog/index.tsx"
mv "components/ui/dropdown-menu.tsx" "components/ui/dropdown/index.tsx"
mv "components/ui/slide-panel.tsx" "components/ui/slide/index.tsx"

# Create and organize types
echo "Setting up types directory..."
cat > "types/article.ts" << 'EOF'
import { Entity } from './entity';
import { Highlight } from './panel';

export interface Article {
  id: string;
  headline: string;
  datePublished: string;
  date_created: string;
  author: string;
  slug: string;
  articleBody?: string;
  articleKicker?: string;
  content?: string;
  meta_data?: Entity[];
  highlights?: Highlight[];
}

export type SortField = 'date_created' | 'headline' | 'author';
export type SortDirection = 'asc' | 'desc';
EOF

cat > "types/entity.ts" << 'EOF'
export type EntityKind = 'location' | 'person' | 'organization';

export interface Entity {
  id: string;
  kind: EntityKind;
  label: string;
  linking_info?: LinkingInfo[];
}

export interface LinkingInfo {
  source: string;
  url?: string;
  lat?: number;
  lng?: number;
  title?: string;
  summary?: string;
}
EOF

cat > "types/panel.ts" << 'EOF'
export interface BasePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Highlight {
  highlight_text: string;
  highlight_sequence_number: number;
}
EOF

cat > "types/index.ts" << 'EOF'
export * from './article';
export * from './entity';
export * from './panel';
EOF

# Move utils
echo "Organizing utilities..."
mv "lib/utils.ts" "lib/utils/index.ts"
[ -f "components/utils.ts" ] && mv "components/utils.ts" "lib/utils/components.ts"

# Create constants
echo "Creating constants..."
cat > "lib/constants/api.ts" << 'EOF'
export const API_ENDPOINTS = {
  FILES: '/api/files',
  HIGHLIGHTS: '/api/highlights',
} as const;
EOF

cat > "lib/constants/config.ts" << 'EOF'
export const APP_CONFIG = {
  SITE_NAME: 'MeMa V7',
  DESCRIPTION: 'Il Manifesto - Isagog SrL',
} as const;
EOF

# Update tsconfig.json paths
echo "Updating tsconfig.json..."
if command -v jq &> /dev/null; then
    jq '.compilerOptions.paths = {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@types/*": ["./types/*"],
      "@lib/*": ["./lib/*"],
      "@styles/*": ["./styles/*"]
    }' tsconfig.json > tsconfig.tmp.json && mv tsconfig.tmp.json tsconfig.json
else
    echo "Warning: jq is not installed. Please update tsconfig.json paths manually."
fi

# Create index files for better module exports
echo "Creating index files..."
cat > "components/article/panels/index.ts" << 'EOF'
export * from './highlights';
export * from './topics';
export * from './summary';
export * from './types';
EOF

# Clean up empty directories that might be left
echo "Cleaning up..."
find . -type d -empty -delete

echo "Project restructuring complete!"

# Reminder of preserved directories and files
echo "
The following directories and files were preserved:
- Dockerfile and docker-compose.yml
- README.md
- cantina directory
- data directory
- public directory
- configuration files (next.config.js, postcss.config.mjs, etc.)
"