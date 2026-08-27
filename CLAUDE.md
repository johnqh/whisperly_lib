# CLAUDE.md - whisperly_lib

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it.

## Project Overview

`@sudobility/whisperly_lib` is the frontend business logic library for Whisperly. It provides Zustand stores for state management and manager hooks that sync TanStack Query data with local state. This library sits between the API client (`whisperly_client`) and the UI (`whisperly_app`).

**Platform**: Web + React Native (no DOM APIs). Tests use node environment.

## Package Manager

**Bun** (not npm/yarn): `bun install`, `bun run <script>`, `bun add <package>`

## Project Structure

```
src/
├── index.ts                          # Barrel export (all public API)
├── stores/
│   ├── index.ts                      # Stores barrel export
│   ├── projectStore.ts               # Projects state (flat array, selected ID)
│   ├── projectStore.test.ts
│   ├── dictionaryStore.ts            # Dictionary state (keyed by projectId)
│   ├── dictionaryStore.test.ts
│   ├── settingsStore.ts              # User settings state
│   ├── settingsStore.test.ts
│   ├── analyticsStore.ts             # Analytics state with filters
│   └── analyticsStore.test.ts
├── managers/
│   ├── index.ts                      # Managers barrel export
│   ├── useProjectManager.ts          # useProjectManager + useProjectDetail
│   ├── useDictionaryManager.ts       # Dictionary CRUD (entity+project scoped)
│   ├── useSettingsManager.ts         # Settings read/update (user-scoped)
│   ├── useAnalyticsManager.ts        # Analytics with date filters (entity-scoped)
│   ├── useTranslationManager.ts      # Translation mutation (public)
│   └── useLanguagesManager.ts        # Project + available languages (entity+project scoped)
├── hooks/
│   ├── index.ts
│   ├── useFirebaseAuth.ts            # Firebase auth state listener
│   └── useWhisperlyClient.ts         # Client instantiation helper
└── utils/
    ├── index.ts
    ├── resetAllStores.ts             # Reset all stores on logout
    └── resetAllStores.test.ts
```

## Key Scripts

```bash
bun run build        # Build TypeScript to dist/
bun run build:watch  # Build in watch mode
bun run typecheck    # TypeScript type checking
bun run lint         # ESLint
bun run test:run     # Run tests once
```

## Architecture

```
UI Components (whisperly_app)
        ↓ uses
Manager Hooks (whisperly_lib)  ←→  TanStack Query (whisperly_client hooks)
        ↓ syncs to
Zustand Stores (whisperly_lib)
```

### Data Flow
1. Manager creates `WhisperlyClient` internally via `useMemo`
2. Manager calls TanStack Query hooks from `whisperly_client`
3. Query data syncs to Zustand store via `useEffect`
4. Manager returns store state + mutation actions
5. On logout, `resetAllStores()` clears all stores

## Manager Signatures

All managers take a config object with `baseUrl` and `getIdToken` plus scope-specific fields.

### Entity-Scoped Managers

```typescript
// Projects — requires entitySlug
useProjectManager({ baseUrl, getIdToken, entitySlug, autoFetch? }): UseProjectManagerResult
// Returns: projects, isLoading, error, createProject, updateProject, deleteProject,
//          generateApiKey, deleteApiKey, refetch, isCreating, isUpdating, isDeleting

// Single project detail — requires entitySlug + projectId
useProjectDetail({ baseUrl, getIdToken, entitySlug, projectId }): UseProjectDetailResult
// Returns: project, isLoading, error, refetch

// Dictionary — requires entitySlug + projectId
useDictionaryManager({ baseUrl, getIdToken, entitySlug, projectId }): UseDictionaryManagerResult
// Returns: dictionaries, isLoading, error, createDictionary, updateDictionary,
//          deleteDictionary, refetch, isCreating, isUpdating, isDeleting

// Analytics — requires entitySlug + optional date filters
useAnalyticsManager({ baseUrl, getIdToken, entitySlug, startDate?, endDate?, projectId? }): UseAnalyticsManagerResult
// Returns: analytics, isLoading, error, refetch

// Languages — requires entitySlug + projectId
useLanguagesManager({ baseUrl, getIdToken, entitySlug, projectId }): UseLanguagesManagerResult
// Returns: projectLanguages, availableLanguages, isLoading, updateLanguages
```

### User-Scoped Managers

```typescript
// Settings — requires userId
useSettingsManager({ baseUrl, getIdToken, userId }): UseSettingsManagerResult
// Returns: settings, isLoading, error, updateSettings, isUpdating
```

### Public Managers

```typescript
// Translation — no auth required
useTranslationManager({ baseUrl, testMode? }): { translate, isTranslating }

// TranslateParams: { orgPath, projectName, request: TranslationRequest, apiKey? }
const result = await translate({ orgPath: 'my-org', projectName: 'my-project', request: { strings: ['Hello'], target_languages: ['es'] } });
```

## Store Pattern

All 4 stores follow the same Zustand pattern:

```typescript
interface StoreState {
  data: DataType | null;
  isLoading: boolean;
  error: string | null;
  setData: (data) => void;
  setLoading: (isLoading) => void;
  setError: (error) => void;
  reset: () => void;
}
```

### Exported Selectors

```typescript
// Project store
selectProjects, selectSelectedProjectId, selectSelectedProject, selectProjectIsLoading, selectProjectError

// Dictionary store (special: keyed by projectId)
selectDictionariesForProject(projectId)  // returns a selector function
selectSelectedDictionaryId, selectDictionaryIsLoading, selectDictionaryError

// Settings store
selectSettings, selectOrganizationName, selectOrganizationPath, selectSettingsIsLoading, selectSettingsError

// Analytics store
selectAnalytics, selectAggregate, selectByProject, selectByDate, selectDateRange, selectFilterProjectId, selectAnalyticsIsLoading, selectAnalyticsError
```

### Dictionary Store (Special Case)

Dictionaries are keyed by `projectId` to prevent cross-project contamination:

```typescript
// State shape
dictionaries: Record<string, DictionarySearchResponse[]>  // projectId → dictionaries

// Usage with selector factory
const dictionaries = useDictionaryStore(selectDictionariesForProject('proj-123'));
```

## Manager Pattern (How It Works)

Each manager internally:
1. Creates `WhisperlyClient` with `useMemo` (stable reference)
2. Extracts store actions
3. Calls TanStack Query hooks from `whisperly_client`
4. Syncs query → store via 3 `useEffect`s (data, loading, error)
5. Wraps mutations with `useCallback` for stability
6. Combines `isLoading` from store + all mutation pending states

## Auth Hook

```typescript
const { user, loading, getIdToken } = useFirebaseAuth();
// user: Firebase User | null
// getIdToken: () => Promise<string | undefined>
```

## Adding New Features

### New Store
1. Create `src/stores/newStore.ts` following existing pattern (state + actions + selectors)
2. Export from `src/stores/index.ts`
3. Add `useNewStore.getState().reset()` call in `src/utils/resetAllStores.ts`
4. Write tests in `src/stores/newStore.test.ts`

### New Manager
1. Create `src/managers/useNewManager.ts`
2. Define `Config` and `Result` interfaces
3. Use `useMemo` for client creation, `useCallback` for actions
4. Sync TanStack Query data to store via `useEffect`
5. Export from `src/managers/index.ts` and `src/index.ts`

## Dependencies

- `@sudobility/whisperly_client` — API client and hooks
- `@sudobility/whisperly_types` — shared types (re-exported for convenience)
- Peer: `react`, `@tanstack/react-query`, `zustand`, `firebase`

## Build Output

- `dist/index.js` — ESM module
- `dist/index.d.ts` — Type declarations

## Git Workflow

- Do not use feature branches for code changes. Always stay on the current branch.
