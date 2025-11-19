import { readdir, stat, writeFile, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";

const ROOT = process.cwd();

// Configuration: Map e2e packages to the apps they test
const MAPPING = {
  "packages/web-e2e": "apps/web",
  "packages/docs-e2e": "apps/docs",
};

async function getDirectoryHash(dir: string): Promise<string> {
  const hash = createHash("sha256");
  
  if (!existsSync(dir)) {
    return "missing";
  }

  let buildId = "";
  try {
    buildId = await readFile(join(dir, "BUILD_ID"), "utf-8");
    buildId = buildId.trim();
  } catch (e) {}

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    // Sort for determinism
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const path = join(currentDir, entry.name);
      const relPath = relative(dir, path);
      
      // Skip volatile files
      if (
        relPath === "cache" ||
        relPath.startsWith("cache/") ||
        relPath === "dev" ||
        relPath.startsWith("dev/") ||
        relPath === "BUILD_ID" ||
        relPath === "trace" ||
        relPath === "trace-build" ||
        relPath.endsWith(".json") ||
        relPath.startsWith("server/pages/") || 
        relPath.startsWith("server/app/") ||
        (buildId && relPath.startsWith(`static/${buildId}`)) ||
        relPath.includes(".next/static") // Kept as fallback, though likely incorrect usage
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile()) {
        // Add relative path to hash to detect moves
        hash.update(relative(dir, path));
        
        // Add content hash
        const content = await readFile(path);
        hash.update(content);
      }
    }
  }

  await walk(dir);
  return hash.digest("hex");
}

async function main() {
  console.log("🔄 Syncing build hashes...");
  
  for (const [e2ePkg, appDir] of Object.entries(MAPPING)) {
    const buildDir = join(ROOT, appDir, ".next");
    const hashFile = join(ROOT, e2ePkg, "build.hash");
    
    const buildHash = await getDirectoryHash(buildDir);
    
    let currentHash = "";
    try {
      currentHash = await readFile(hashFile, "utf-8");
    } catch (e) {}

    if (buildHash !== currentHash) {
      console.log(`📝 Updating hash for ${e2ePkg} (was ${currentHash.slice(0,8)}, now ${buildHash.slice(0,8)})`);
      await writeFile(hashFile, buildHash);
    } else {
      console.log(`✅ Hash matched for ${e2ePkg} (${buildHash.slice(0,8)})`);
    }
  }
}

main().catch(console.error);
