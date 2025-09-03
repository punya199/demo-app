# Technology Stack

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS 4.1.4 + Emotion for CSS-in-JS
- **UI Library**: Ant Design 5.x
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query) 5.x
- **Routing**: React Router DOM 7.x
- **HTTP Client**: Axios with interceptors

## Development Tools
- **Package Manager**: Yarn 4.9.1 (required)
- **Linting**: ESLint 9.x with TypeScript support
- **Formatting**: Prettier with Tailwind plugin
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Release**: Semantic Release with conventional commits

## Key Libraries
- **Animation**: Framer Motion
- **Icons**: Lucide React, React Icons, Ant Design Icons
- **Utilities**: Lodash, Day.js, UUID, Change Case
- **Forms**: React Number Format, React Select
- **Image Processing**: html-to-image

## Common Commands

### Development
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn preview      # Preview production build
```

### Code Quality
```bash
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
yarn format:check # Check formatting without changes
```

### Environment Requirements
- Node.js >= 20.0.0
- Yarn 4.9.1 (managed via packageManager field)

## Build Configuration
- **Target**: ES2020
- **JSX**: React JSX with Emotion support
- **Module Resolution**: Bundler mode
- **Path Aliases**: `@/*` maps to `./src/*`
- **Asset Handling**: Supports all common image formats including WebP