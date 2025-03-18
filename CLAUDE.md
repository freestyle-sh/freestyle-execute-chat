# Freestyle Chat Developer Guidelines

## Build and Development Commands
- `bun dev` - Start dev server with turbopack
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run eslint
- `bunx tsc --noEmit` - Type check without emitting files

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` prefix (e.g., `@/components/ui/button`)
- Group imports: React/Next.js, external libraries, internal components/utilities
- Use named exports/imports by default

### Components
- Use client components with "use client" directive when needed
- Follow shadcn/ui patterns for component structure
- Use TypeScript for all components with proper prop typing

### Naming Conventions
- PascalCase for components and component files
- camelCase for functions, variables, and utility files
- Descriptive names that reflect component/function purpose

### State Management
- Use React hooks for local state
- Use Zustand with persist middleware for shared/persistent state
- Follow the store pattern in `src/lib/stores/`

### Styling
- Use Tailwind CSS with the `cn()` utility for conditional classes
- Follow design system tokens for colors, spacing, etc.
- Use shadcn/ui component variants for consistent styling

### Best Practices
- Handle hydration safely with mounted checks for client components
- Use proper error boundaries and loading states
- Keep components focused and composable
- Extract reusable logic to custom hooks