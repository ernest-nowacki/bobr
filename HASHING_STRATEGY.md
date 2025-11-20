# Build Hashing Strategy for Smart Test Runner

## Overview
This document documents the strategy used in `scripts/hash-build.ts` to achieve deterministic test caching. The goal is to ensure that `e2e:test` tasks only re-run when the *functional* output of a build changes, ignoring volatile build artifacts (like timestamps, build IDs, or metadata manifests).

## The Problem
Standard Turborepo caching relies on input hashing. If any dependency (e.g., `packages/ui`) changes, the `build` task is invalidated. Consequently, any downstream task (like `e2e:test`) that depends on `build` is also invalidated, even if the build output is effectively identical (e.g., due to tree-shaking unused code).

## The Solution
We decouple the test cache from the build input cache. Instead of depending on the `build` task, the `e2e:test` task depends on a calculated **content hash** of the build directory (`.next`).

This hash is written to a `build.hash` file in each E2E package directory (e.g., `packages/web-e2e/build.hash`). Turborepo is configured to use this file as an input for the `e2e:test` task.

```json
// turbo.json
"e2e:test": {
  "inputs": ["src/**", "package.json", "build.hash"]
}
```

If the application build output hasn't functionally changed (matching `build.hash`) AND the test code hasn't changed, Turborepo will skip the test run and restore the previous result from cache.

## Hashing Rules

We calculate a recursive SHA-256 hash of the `.next` directory, with the following specific **inclusions** and **exclusions**:

### 1. What we Hash (The "Source of Truth")
*   **`static/chunks/`**: Contains the compiled client-side JavaScript and CSS bundles.
*   **`server/chunks/`**: Contains the compiled server-side logic and components.
*   **`static/media/`**: Contains image/font assets.

**Reasoning**: These directories contain the actual executable code and assets of the application. If any business logic, style, or asset changes, the bundler (Turbopack/Webpack) will produce files with different content and/or filenames in these directories. This is our primary safety guarantee.

### 2. What we Ignore (The "Noise")
*   **`BUILD_ID`**: A unique string generated for every build.
*   **`server/pages/`** and **`server/app/`**:
    *   These directories contain entry points (like `page.js`). In Next.js (especially with Turbopack), these are often thin wrappers/manifests that reference chunks.
    *   They can be volatile or contain absolute paths/references that change across builds even if logic doesn't.
    *   *Safety Check*: Since these files delegate to `server/chunks`, any logic change will be captured by the chunk hash.
*   **`*.json` (Manifests)**:
    *   Files like `build-manifest.json`, `prerender-manifest.json`.
    *   These contain mapping data that can change order or include the volatile `BUILD_ID`.
    *   *Safety Check*: If a route mapping changes, the underlying chunk filenames will usually change too.
*   **`static/<BUILD_ID>/`**: Contains build-specific metadata/manifests.
*   **`trace` / `trace-build`**: Performance tracing data (highly volatile).
*   **`cache/`**: Internal Next.js cache (volatile).

## Safety Assessment
*   **Risk of Stale Tests (False Negative)**: Low. For a test to be skipped incorrectly, a code change would have to result in **byte-for-byte identical** output in both `static/chunks` and `server/chunks`. Modern bundlers use content-hashing for filenames, making this extremely unlikely.
*   **Risk of Unnecessary Runs (False Positive)**: Moderate. If the bundler is not perfectly deterministic (e.g., internal IDs change), the chunks might change even if source code didn't. This is safe (tests run unnecessarily) but less efficient.

## Usage
The logic is implemented in `scripts/hash-build.ts` and executed via the root `e2e:test` script:
```bash
turbo run build && bun scripts/hash-build.ts && turbo run e2e:test
```
