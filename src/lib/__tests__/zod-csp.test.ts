import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SOURCE_ROOT = "src";
const ZOD_WRAPPER = "src/lib/zod.ts";

function walkSourceFiles(target: string): string[] {
  const fullTarget = join(process.cwd(), target);
  if (!existsSync(fullTarget)) return [];
  const stat = statSync(fullTarget);

  if (stat.isFile()) {
    return /\.(ts|tsx)$/.test(fullTarget) ? [fullTarget] : [];
  }

  return readdirSync(fullTarget).flatMap((entry) => {
    const fullPath = join(fullTarget, entry);
    const entryStat = statSync(fullPath);

    if (entryStat.isDirectory()) {
      return walkSourceFiles(relative(process.cwd(), fullPath));
    }

    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

function readSource(file: string): string {
  return readFileSync(file, "utf8");
}

describe("Zod CSP configuration", () => {
  it("keeps runtime code on the jitless Zod wrapper instead of direct zod imports", () => {
    const directImports = walkSourceFiles(SOURCE_ROOT)
      .map((file) => ({
        file: relative(process.cwd(), file),
        source: readSource(file),
      }))
      .filter(({ file }) => file !== ZOD_WRAPPER)
      .filter(({ file }) => !file.includes("__tests__/"))
      .filter(({ source }) =>
        /from\s+["']zod["']|require\(["']zod["']\)/.test(source),
      )
      .map(({ file }) => file)
      .sort();

    expect(directImports).toEqual([]);
  });

  it("configures Zod without runtime eval/JIT before schemas are created", () => {
    const wrapperSource = readSource(join(process.cwd(), ZOD_WRAPPER));

    expect(wrapperSource).toContain('from "zod"');
    expect(wrapperSource).toContain("jitless: true");
  });
});
