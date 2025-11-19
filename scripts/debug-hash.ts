import { readdir, stat, writeFile, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

const ROOT = process.cwd();
const MAPPING = {
  "packages/web-e2e": "apps/web",
};

async function debugHash(dir: string) {
  if (!existsSync(dir)) {
    console.log("Missing dir:", dir);
    return;
  }

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const path = join(currentDir, entry.name);
      const relPath = relative(dir, path);
      
      // SAME LOGIC AS hash-build.ts
      if (
        relPath === "cache" ||
        relPath.startsWith("cache/") ||
        relPath === "BUILD_ID" ||
        relPath === "trace" ||
        relPath === "trace-build" ||
        relPath.endsWith(".json") ||
        relPath.startsWith("server/pages/") || 
        relPath.startsWith("server/app/") ||
        relPath.includes(".next/static") // <--- The suspect line
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile()) {
        console.log("Hashing:", relPath);
      }
    }
  }

  await walk(dir);
}

async function main() {
  for (const [e2ePkg, appDir] of Object.entries(MAPPING)) {
    const buildDir = join(ROOT, appDir, ".next");
    console.log(`--- Debugging ${appDir} ---`);
    await debugHash(buildDir);
  }
}

main().catch(console.error);

