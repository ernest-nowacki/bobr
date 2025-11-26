# Turborepo Build/Test Optimization Demo

This repository demonstrates advanced build and test caching optimizations using Turborepo and Next.js with Turbopack. The goal is to achieve **deterministic builds** and **intelligent test caching** that respects tree-shaking and only invalidates tests when the actual build output changes.

## Purpose

This project tests whether we can optimize Turborepo caching to:

1. Avoid unnecessary rebuilds when changes in shared packages don't affect consuming apps
2. Reuse test cache when build outputs remain identical (even if builds ran)
3. Leverage tree-shaking to ensure unused code doesn't affect build artifacts

## Architecture

- **Apps**: `apps/web` and `apps/docs` (Next.js applications)
- **Shared Package**: `packages/ui` (`@repo/ui`) - shared UI components and utilities
- **E2E Tests**: `packages/web-e2e` and `packages/docs-e2e` - test packages that depend on build outputs

### Current Usage Pattern

- `apps/web` imports `sub` from `@repo/ui/utils`
- `apps/docs` imports `add` from `@repo/ui/utils`
- Both apps import from the **barrel file** `@repo/ui/utils/index.ts` which exports both `add` and `sub`

## How It Works

### Tree-Shaking with Barrel Files

The optimization leverages Next.js `optimizePackageImports` and package-level `sideEffects: false` to enable aggressive tree-shaking:

1. **Barrel File Exports**: `packages/ui/src/utils/index.ts` exports both `add` and `sub`
2. **Selective Imports**: Each app only imports what it uses (`web` → `sub`, `docs` → `add`)
3. **Tree-Shaking**: Next.js/Turbopack removes unused exports from the final bundle
4. **Result**: Changing `add.ts` only affects `docs` build output, not `web` build output

### Smart Test Caching

The `scripts/hash-build.ts` script calculates content hashes of build outputs (`.next` directories) and writes them to `build.hash` files. The `e2e:test` task uses these hashes as inputs instead of depending on `^build`:

- If build output changes → hash changes → `build.hash` updates → e2e test cache invalidates
- If build output is identical → hash unchanged → `build.hash` unchanged → e2e test cache hits

## Testing

### Basic Test: Cache Verification

Run the e2e tests twice in a row:

```bash
bun e2e:test
bun e2e:test
```

**Expected Result**:

- **First run**: All builds and tests run (4 tasks total)
- **Second run**: All tasks use cache (4 cached results)

### Advanced Test: Selective Invalidation

Modify the `add` method in `packages/ui/src/utils/add.ts`:

```bash
# Edit packages/ui/src/utils/add.ts (change the implementation)
bun e2e:test
```

**Expected Result**:

1. **Builds**: Both `web` and `docs` rebuild (cache miss - correct, as Turborepo tracks dependency changes)
2. **Build Outputs**:
   - `docs` build output changes (uses `add`)
   - `web` build output remains identical (doesn't use `add`, tree-shaking removes it)
3. **E2E Tests**:
   - `docs-e2e` runs fresh (its `build.hash` changed)
   - `web-e2e` uses cache (its `build.hash` unchanged)

This demonstrates that even though both apps rebuild, only the app that actually uses the changed code has its test cache invalidated.

## How Barrel Files Work

Barrel files (`index.ts`) re-export multiple modules from a single entry point. With proper tree-shaking:

- **Without tree-shaking**: Importing `{ sub }` from `@repo/ui/utils` would bundle both `add` and `sub`
- **With tree-shaking**: Only `sub` is included in the bundle, `add` is eliminated

The key configuration enabling this:

1. **Package config** (`packages/ui/package.json`): `"sideEffects": false`
2. **Next.js config**: `optimizePackageImports: ["@repo/ui"]`
3. **Build tool**: Turbopack (`--turbo` flag) for production builds

## Scripts

- `bun e2e:test` - Runs builds, syncs build hashes, then runs e2e tests
- `bun build` - Builds all apps and packages
- `bun dev` - Starts development servers

## Technical Details

See `spec/OPTIMIZATION_PLAN.md` for the detailed implementation plan and rationale.
See `spec/HASHING_STRATEGY.md` for the hashing strategy used to calculate the build hash..
