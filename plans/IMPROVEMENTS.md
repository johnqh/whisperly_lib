# Improvement Plans for @sudobility/whisperly_lib

## Priority 1 - High Impact

### 1. Add Tests for Manager Hooks
- Current test coverage only includes 4 store test files and 1 utility test (`resetAllStores.test.ts`).
- Zero test coverage for all 6 manager hooks: `useProjectManager`, `useProjectDetail`, `useDictionaryManager`, `useSettingsManager`, `useAnalyticsManager`, `useTranslationManager`, and `useLanguagesManager`.
- Manager hooks contain significant logic: `useEffect` synchronization between TanStack Query and Zustand stores, `useCallback` wrapped mutations, defensive array guards, and composite `isLoading` state computation.
- The `useProjectManager` alone has 5 callback functions, 3 useEffects, and a composite loading state -- all untested.
- Testing would require mocking `WhisperlyClient`, wrapping in `QueryClientProvider`, and verifying store sync behavior.

### 2. Add JSDoc to All Manager Interfaces and Hook Exports
- Config interfaces (`UseProjectManagerConfig`, `UseDictionaryManagerConfig`, etc.) have no JSDoc explaining what each field does, what format `entitySlug` should be in, or when `autoFetch` should be disabled.
- Result interfaces (`UseProjectManagerResult`, `UseDictionaryManagerResult`, etc.) have no JSDoc on their action methods explaining side effects (e.g., `createProject` both creates via API and adds to local store).
- Store selectors (e.g., `selectDictionariesForProject`, `selectSelectedProject`) lack JSDoc explaining return types and usage patterns.
- The `useFirebaseAuth` hook has no JSDoc on its return type or when `getIdToken` might return `undefined`.

### 3. Remove Redundant Defensive Array Guards in useProjectManager
- `useProjectManager` has two separate defensive checks that `projects` is an array (lines 56 and 143), suggesting an underlying trust issue with the store data.
- The root cause should be identified and fixed (possibly the store or query returning non-array data), rather than adding defensive guards at the manager level.
- If the guards are truly needed, they should be consolidated into a single check with a documented reason.

## Priority 2 - Medium Impact

### 4. Add Tests for useFirebaseAuth Hook
- `useFirebaseAuth.ts` is a critical authentication hook but has no test coverage.
- It manages Firebase auth state, user lifecycle events, and token retrieval -- all of which should be tested with mocked Firebase instances.
- Edge cases to test: user sign-in, sign-out, token refresh failure, component unmount during auth state change.

### 5. Improve Store Error State Management
- All 4 stores follow the same pattern where `error` is a `string | null`, losing the original error object's stack trace and type information.
- The `useEffect` that syncs errors (`setError(projectsQuery.error.message)`) only captures the error message, not the error type (e.g., `WhisperlyApiError` with `statusCode`).
- Managers could preserve the full error object or at minimum include the status code in the error state, enabling UI components to show more specific error messages (e.g., "Not Found" vs "Server Error").

### 6. Reduce Manager Boilerplate with Shared Factory Pattern
- All 6 managers follow the identical pattern: create client with `useMemo`, extract store actions, call query hooks, sync via `useEffect` (data, loading, error), wrap mutations with `useCallback`.
- A shared `createManager` factory function or higher-order hook could eliminate the repetitive boilerplate while keeping the same public API.
- This would reduce the risk of inconsistencies between managers (e.g., one manager might forget to sync errors).

## Priority 3 - Nice to Have

### 7. Add Optimistic Update Support to Mutation Managers
- Currently, mutations (create, update, delete) only update the store after the API call succeeds.
- Adding optimistic updates (update store immediately, rollback on failure) would improve perceived performance for operations like project updates or dictionary edits.
- TanStack Query has built-in `onMutate`/`onError`/`onSettled` callbacks that could be leveraged.

### 8. Add Store Persistence Options
- All Zustand stores use in-memory state only, meaning all data is lost on page refresh.
- Adding optional `persist` middleware (similar to what `mixr_client` does with `createRecipeStore`) would improve UX for settings and selected project state.
- This should be opt-in via configuration to avoid issues in server-side rendering contexts.
