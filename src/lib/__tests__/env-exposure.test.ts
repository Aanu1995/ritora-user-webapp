import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ENV_EXAMPLE_PATH = join(process.cwd(), ".env.example");
const SOURCE_ROOTS = ["src", "next.config.ts"];
const SYSTEM_ENV_KEYS = new Set(["CI", "NODE_ENV"]);

function walkSourceFiles(target: string): string[] {
  if (!existsSync(target)) {
    return [];
  }

  if (statSync(target).isFile()) {
    return /\.(ts|tsx)$/.test(target) ? [target] : [];
  }

  return readdirSync(target).flatMap((entry) => {
    const fullPath = join(target, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return ["node_modules", ".next", "coverage"].includes(entry)
        ? []
        : walkSourceFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

function readEnvExampleKeys(): Set<string> {
  const source = readFileSync(ENV_EXAMPLE_PATH, "utf8");
  return new Set(
    [...source.matchAll(/^([A-Z0-9_]+)=/gm)].map((match) => match[1]),
  );
}

function readUsedEnvKeys(): Set<string> {
  const keys = new Set<string>();
  for (const file of SOURCE_ROOTS.flatMap(walkSourceFiles)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
      keys.add(match[1]);
    }
  }
  return keys;
}

describe("frontend environment variable exposure", () => {
  it("documents every frontend-owned environment variable used by source code", () => {
    const exampleKeys = readEnvExampleKeys();
    const missing = [...readUsedEnvKeys()]
      .filter((key) => !SYSTEM_ENV_KEYS.has(key))
      .filter((key) => !exampleKeys.has(key))
      .sort();

    expect(missing).toEqual([]);
  });
});
