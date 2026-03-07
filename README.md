# @sudobility/whisperly_lib

Frontend business logic library for Whisperly with Zustand stores and manager hooks.

## Installation

```bash
bun add @sudobility/whisperly_lib
```

## Usage

```typescript
import { useProjectManager, useTranslationManager } from "@sudobility/whisperly_lib";

const { projects, isLoading, createProject } = useProjectManager({
  baseUrl,
  getIdToken,
  entitySlug,
});

const { translate, isTranslating } = useTranslationManager({ baseUrl });
const result = await translate({
  orgPath: "my-org",
  projectName: "my-project",
  request: { strings: ["Hello"], target_languages: ["es"] },
});
```

## API

### Manager Hooks

- `useProjectManager` -- Project CRUD with auto-fetch
- `useProjectDetail` -- Single project detail
- `useDictionaryManager` -- Dictionary CRUD (entity+project scoped)
- `useAnalyticsManager` -- Analytics with date filters
- `useSettingsManager` -- User settings
- `useLanguagesManager` -- Project + available languages
- `useTranslationManager` -- Translation mutation (public, no auth)

### Zustand Stores

`projectStore`, `dictionaryStore`, `settingsStore`, `analyticsStore` -- with selectors and `resetAllStores()` for logout cleanup.

### Auth Hook

`useFirebaseAuth()` -- Firebase auth state listener returning `{ user, loading, getIdToken }`.

## Development

```bash
bun run build        # Build ESM
bun run test:run     # Run tests once
bun run typecheck    # TypeScript check
```

## Related Packages

- `whisperly_types` -- Shared type definitions
- `whisperly_client` -- API client SDK
- `whisperly_api` -- Backend API server
- `whisperly_app` -- Web application consumer

## License

BUSL-1.1
