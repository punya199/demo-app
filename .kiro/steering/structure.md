# Project Structure

## Root Directory Organization
```
├── src/                    # Source code
├── public/                 # Static assets served directly
├── dist/                   # Build output
├── .kiro/                  # Kiro AI assistant configuration
├── .husky/                 # Git hooks
└── node_modules/           # Dependencies
```

## Source Code Structure (`src/`)
```
src/
├── components/             # Reusable UI components
│   ├── magicui/           # Third-party UI components
│   └── *.tsx              # Individual components
├── pages/                 # Route-based page components
│   ├── project/           # Feature-specific pages
│   │   ├── checkbill/     # Bill splitting feature
│   │   ├── omama-game/    # Card game feature
│   │   └── random-card/   # Random card generator
│   └── house-rent/        # House rental management
├── layouts/               # Layout components
├── config/                # Application configuration
├── utils/                 # Utility functions and helpers
├── lib/                   # Third-party library configurations
├── assets/                # Static assets (images, etc.)
└── service.ts             # API service definitions
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `PageHouseRent.tsx`)
- **Utilities**: kebab-case (e.g., `api-client.ts`)
- **Pages**: Prefixed with "Page" (e.g., `PageCreateBill.tsx`)
- **Interfaces**: Prefixed with "I" (e.g., `IAuthorizeProps`)

### Import Organization
- External libraries first
- Internal utilities and configs
- Components and pages
- Relative imports last

### Component Patterns
- **Lazy Loading**: Pages use React.lazy() for code splitting
- **Authorization**: Protected routes wrapped with `<Authorize>` component
- **State Management**: Zustand stores in utils/ directory
- **API Calls**: TanStack Query hooks in service.ts

### Asset Management
- **Images**: Stored in both `src/assets/images/` and `public/images/`
- **Card Assets**: Organized by suit and value (e.g., `clubs_A.webp`)
- **Formats**: Prefer WebP for images, fallback to PNG

### Configuration
- **Environment**: Runtime config via `window._env_` or import.meta.env
- **Paths**: Centralized in `src/config/app-paths.ts`
- **API**: Base configuration in `src/config/app-config.ts`

### Feature Organization
- Each major feature has its own directory under `pages/`
- Feature-specific components, services, and stores co-located
- Shared utilities in top-level `utils/` directory