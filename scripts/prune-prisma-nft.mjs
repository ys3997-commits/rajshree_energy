/**
 * Prisma's generated client uses path.join(process.cwd(), …) / process.cwd()
 * in ways that make Next.js NFT treat the entire repo as a dependency of every
 * route. That inflates each serverless function and pushes Vercel Hobby over
 * the 12-function limit.
 *
 * Run after `prisma generate`.
 */
import fs from "node:fs";
import path from "node:path";

const clientDir = path.join(process.cwd(), "src", "generated", "prisma");

/** Mark cwd lookups so Turbopack/NFT do not walk the whole project. */
function ignoreCwd(source) {
  return source.replace(
    /process\.cwd\(\)/g,
    "(/*turbopackIgnore: true*/ process.cwd())",
  );
}

const STATIC_FALLBACK = `if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    path.join((/*turbopackIgnore: true*/ process.cwd()), "src/generated/prisma"),
    path.join((/*turbopackIgnore: true*/ process.cwd()), "generated/prisma"),
  ]
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]
  config.dirname = alternativePath
  config.isBundled = true
}`;

const DYNAMIC_FALLBACK_RE =
  /if\s*\(\s*!fs\.existsSync\(path\.join\(__dirname,\s*['"]schema\.prisma['"]\)\s*\)\s*\)\s*\{[\s\S]*?config\.isBundled\s*=\s*true\s*\}/;

for (const file of ["index.js", "edge.js"]) {
  const filePath = path.join(clientDir, file);
  if (!fs.existsSync(filePath)) continue;

  let source = fs.readFileSync(filePath, "utf8");

  // Drop cwd-based engine annotations (keep __dirname ones).
  source = source.replace(
    /^\s*path\.join\(\s*process\.cwd\(\)\s*,\s*["'][^"']+["']\s*\)\s*;?\s*$/gm,
    "",
  );

  if (DYNAMIC_FALLBACK_RE.test(source)) {
    source = source.replace(DYNAMIC_FALLBACK_RE, STATIC_FALLBACK);
  } else {
    source = ignoreCwd(source);
  }

  fs.writeFileSync(filePath, source);
  console.log(`pruned Prisma NFT paths in ${file}`);
}

const libraryPath = path.join(clientDir, "runtime", "library.js");
if (fs.existsSync(libraryPath)) {
  let source = fs.readFileSync(libraryPath, "utf8");
  if (!source.includes("turbopackIgnore")) {
    source = ignoreCwd(source);
    fs.writeFileSync(libraryPath, source);
    console.log("pruned Prisma NFT paths in runtime/library.js");
  }
}
