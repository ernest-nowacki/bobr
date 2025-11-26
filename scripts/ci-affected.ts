import { $ } from "bun";

// ------------------------------------------------------------------------------
// CI Affected Workflow Script
// ------------------------------------------------------------------------------
// This script orchestrates the "Smart CI" process using Turborepo's filtering
// capabilities. It ensures we only build and test what has actually changed.
//
// Workflow:
// 1. Identify affected packages by comparing against a base git reference.
// 2. Build only the affected packages and their dependencies.
// 3. Calculate build hashes to further optimize (e.g. skip e2e if binary identical).
// 4. Run E2E tests only for the affected apps.
// ------------------------------------------------------------------------------

// Determine the base commit/branch to compare against.
// - In CI (GitHub Actions), this is passed via the TURBO_BASE env var.
// - Locally, it defaults to "origin/main".
const BASE = process.env.TURBO_BASE || "origin/main";

console.log(
  "================================================================="
);
console.log("🚀 Starting Smart CI Workflow");
console.log(`🎯 Comparing against base: ${BASE}`);
console.log(
  "================================================================="
);

try {
  // 1. Build Affected Packages
  // The filter "...[$BASE]..." is powerful:
  // - `[...]`: Finds packages changed since the commit/ref $BASE.
  // - Leading `...`: Includes dependencies of changed packages (needed for build).
  // - Trailing `...`: Includes dependents of changed packages (apps using the lib).
  console.log("\n🏗️  Step 1: Building affected packages...");
  await $`turbo run build --filter="...[${BASE}]..." --output-logs=new-only`;

  // 2. Calculate Build Hashes
  // Runs a custom script that hashes the build outputs (.next folders).
  // This is used by the e2e:test task to decide if it can skip execution based on
  // whether the actual build artifact changed (not just the source code).
  console.log("\n🔐 Step 2: Calculating build hashes...");
  await $`bun scripts/hash-build.ts`;

  // 3. Run E2E Tests
  // Uses the same filter to ensuring we only run tests that are related to the changes.
  console.log("\n🧪 Step 3: Running E2E tests for affected apps...");
  await $`turbo run e2e:test --filter="...[${BASE}]..."`;

  console.log("\n✅ CI Workflow completed successfully!");
} catch (error) {
  console.error("\n❌ CI Workflow failed!");
  process.exit(1);
}
