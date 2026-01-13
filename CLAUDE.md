# CLAUDE.md - whisperly_lib

## Project Overview
`@sudobility/whisperly_lib` is the frontend business logic library for Whisperly. It provides Zustand stores for state management and manager hooks that sync TanStack Query data with local state. This library sits between the API client (whisperly_client) and the UI (whisperly_app).

## Platform Support
- **Web App**: Yes
- **React Native**: Yes
- **Backend (Node.js/Bun)**: No (client-side only)

This library is designed to work in both web and React Native environments. Tests use node environment to ensure no DOM-specific APIs are used.

## Tech Stack
- **Runtime**: Bun
- **Language**: TypeScript 5.9+
- **State Management**: Zustand 5.x
- **Data Fetching**: TanStack Query 5.x (peer dependency)
- **React**: 19.x (peer dependency)
- **Auth**: Firebase (peer dependency)
- **Testing**: Vitest

## Package Manager
**IMPORTANT**: This project uses **Bun**, not npm or yarn.
- Install dependencies: `bun install`
- Run scripts: `bun run <script>`
- Add dependencies: `bun add <package>` or `bun add -d <package>` for dev

## Project Structure
```
src/
├── index.ts              # Main barrel export
├── stores/
│   ├── index.ts          # Stores barrel export
│   ├── projectStore.ts   # Projects state
│   ├── projectStore.test.ts
│   ├── glossaryStore.ts  # Glossaries state (keyed by projectId)
│   ├── glossaryStore.test.ts
│   ├── settingsStore.ts  # User settings state
│   ├── settingsStore.test.ts
│   ├── subscriptionStore.ts  # Subscription state
│   ├── subscriptionStore.test.ts
│   ├── analyticsStore.ts # Analytics state with filters
│   └── analyticsStore.test.ts
├── managers/
│   ├── index.ts              # Managers barrel export
│   ├── useProjectManager.ts  # Syncs projects query to store (entity-scoped)
│   ├── useGlossaryManager.ts # Syncs glossaries to store (entity+project scoped)
│   ├── useSettingsManager.ts # Syncs settings to store (user-scoped)
│   ├── useSubscriptionManager.ts # Syncs subscription (user-scoped)
│   ├── useAnalyticsManager.ts    # Syncs analytics (entity-scoped)
│   └── useTranslationManager.ts  # Translation mutations (public endpoint)
├── hooks/
│   ├── index.ts              # Hooks barrel export
│   ├── useFirebaseAuth.ts    # Firebase auth state
│   └── useWhisperlyClient.ts # Client instantiation
└── utils/
    ├── index.ts              # Utils barrel export
    ├── resetAllStores.ts     # Reset all stores on logout
    └── resetAllStores.test.ts
```

## Key Scripts
```bash
bun run build        # Build TypeScript to dist/
bun run build:watch  # Build in watch mode
bun run typecheck    # Run TypeScript type checking
bun run lint         # Run ESLint
bun run test         # Run tests in watch mode
bun run test:run     # Run tests once
```

## Architecture

### API Structure (Entity-Centric)
The managers follow the entity-centric API structure:
- **Entity-scoped**: Projects, endpoints, glossaries, analytics - require `entitySlug`
- **User-scoped**: Settings, subscription - require `userId`
- **Public**: Translation - requires `orgPath`, `projectName`, `endpointName`

### Store Layer (Zustand)
Each store manages a domain's local state:
```typescript
import { useProjectStore } from '@sudobility/whisperly_lib';

// Access state
const projects = useProjectStore(state => state.projects);
const isLoading = useProjectStore(state => state.isLoading);

// Actions
useProjectStore.getState().setProjects(projects);
useProjectStore.getState().addProject(project);
```

### Manager Layer (Hooks)
Managers connect TanStack Query to Zustand stores with entity-centric parameters:
```typescript
import { useProjectManager } from '@sudobility/whisperly_lib';

function MyComponent({ entitySlug }) {
  const {
    projects,        // From store
    isLoading,       // From query
    createProject,   // Mutation
    refetch,         // Re-fetch data
  } = useProjectManager(client, entitySlug);
}
```

### Auth Hook
```typescript
import { useFirebaseAuth } from '@sudobility/whisperly_lib';

function App() {
  const { user, loading, getIdToken } = useFirebaseAuth();
}
```

## Manager Signatures

### Entity-scoped Managers
```typescript
// Projects (entity-scoped)
useProjectManager(client: WhisperlyClient, entitySlug: string)
useProjectDetail(client: WhisperlyClient, entitySlug: string, projectId: string)

// Glossaries (entity + project scoped)
useGlossaryManager(client: WhisperlyClient, entitySlug: string, projectId: string)

// Analytics (entity-scoped)
useAnalyticsManager(client: WhisperlyClient, entitySlug: string, options?: UseAnalyticsManagerOptions)
```

### User-scoped Managers
```typescript
// Settings (user-scoped)
useSettingsManager(client: WhisperlyClient, userId: string)

// Subscription (user-scoped)
useSubscriptionManager(client: WhisperlyClient, userId: string)
```

### Public Managers
```typescript
// Translation (public endpoint)
const { translate } = useTranslationManager(client);

// Translate params
translate({
  orgPath: 'my-org',
  projectName: 'my-project',
  endpointName: 'translate',
  request: { strings: ['Hello'], target_languages: ['es'] }
});
```

## Store Patterns

### State Shape
Each store follows this pattern:
```typescript
interface StoreState {
  data: DataType | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setData: (data: DataType | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
```

### Selectors
Stores export selector functions for computed values:
```typescript
import { selectMonthlyRemaining } from '@sudobility/whisperly_lib';

const remaining = useSubscriptionStore(selectMonthlyRemaining);
```

### Glossary Store (Special Case)
Glossaries are keyed by projectId:
```typescript
interface GlossaryState {
  glossaries: Record<string, Glossary[]>; // projectId -> glossaries
  // ...
}

// Get glossaries for specific project
const glossaries = useGlossaryStore(selectGlossariesForProject('proj-123'));
```

## Development Guidelines

### Adding New Stores
1. Create store in `src/stores/` following existing pattern
2. Export selectors alongside the store
3. Add to `src/stores/index.ts`
4. Add reset call in `src/utils/resetAllStores.ts`
5. Create comprehensive tests

### Adding New Managers
1. Create manager in `src/managers/`
2. Use corresponding client hook from whisperly_client
3. Pass required scope parameters (entitySlug, userId, etc.)
4. Sync query data to store with useEffect
5. Return combined state + mutations
6. Export from `src/managers/index.ts`

### Manager Pattern (Entity-scoped)
```typescript
export function useProjectManager(client: WhisperlyClient, entitySlug: string) {
  const { setProjects, setLoading } = useProjectStore();
  const { data, isLoading, refetch } = useProjects(client, entitySlug);

  // Sync to store
  useEffect(() => {
    if (data) setProjects(data);
  }, [data, setProjects]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  const createProject = useCreateProject(client, entitySlug);

  return {
    projects: useProjectStore(state => state.projects),
    isLoading,
    createProject,
    refetch,
  };
}
```

## Resetting State
On logout, reset all stores:
```typescript
import { resetAllStores } from '@sudobility/whisperly_lib';

function handleLogout() {
  await signOut(auth);
  resetAllStores();
}
```

## Dependencies
- `@sudobility/whisperly_client` - API client and hooks
- `@sudobility/whisperly_types` - Shared types
- Peer: `react`, `@tanstack/react-query`, `zustand`, `firebase`

## Build Output
- `dist/index.js` - ESM module
- `dist/index.d.ts` - Type declarations
