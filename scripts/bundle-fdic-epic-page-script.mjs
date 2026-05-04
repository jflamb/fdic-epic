#!/usr/bin/env node
// Bundle a single fdic-epic page script (e.g. support-intake.js) into a
// standalone, browser-loadable file.
//
// - Imports targeting ./components/* are rewritten to lookups in the
//   existing window.__fdic_modules registry created by the component
//   bundle, so we don't ship duplicate copies of those modules.
// - Imports targeting other sibling .mjs/.js files (page-private helpers
//   like intake-config.mjs) are inlined into the bundle via a small
//   per-bundle local registry. This avoids polluting __fdic_modules with
//   modules that are not shared across pages.
//
// Usage: node scripts/bundle-fdic-epic-page-script.mjs <entry-file>
// Example: node scripts/bundle-fdic-epic-page-script.mjs support-intake.js

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, basename, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = resolve(__dirname, "../components");
const SITE_DIR = resolve(__dirname, "../");

// Side-effect imports must live on a single line so we don't accidentally
// swallow following imports. Clause imports may span multiple lines (e.g.
// multi-line { a, b, c } from "..."), and require a clause + "from" pair.
const sideEffectImportRegex = /^import\s+["']([^"']+)["'];?\s*$/gm;
const clauseImportRegex = /^import\s+([\s\S]+?)\s+from\s+["']([^"']+)["'];?\s*$/gm;
const exportNamedRegex = /^export\s+((?:async\s+)?(?:const|let|var|function\*?|class))\s+([A-Za-z_$][\w$]*)/gm;
const exportListRegex = /^export\s*\{\s*([^}]+)\s*\};?\s*$/gm;

function isComponentImport(absPath) {
  const rel = relative(COMPONENTS_DIR, absPath);
  return !rel.startsWith("..") && !rel.startsWith("/");
}

function componentModuleId(absPath) {
  return relative(COMPONENTS_DIR, absPath).replaceAll("\\", "/");
}

function siblingModuleId(absPath) {
  return relative(SITE_DIR, absPath).replaceAll("\\", "/");
}

function resolveImport(fromAbs, spec) {
  if (!spec.startsWith(".")) {
    throw new Error(`Bare import not supported: ${spec} (in ${fromAbs})`);
  }
  return resolve(dirname(fromAbs), spec);
}

// Build the inlined sibling-module IIFE that mirrors the component-bundle
// pattern. Returns transformed source that registers exports onto a local
// __locals registry.
function transformSibling(absPath, source) {
  const id = siblingModuleId(absPath);
  const importLines = [];
  const exportRegistrations = [];

  // Process side-effect imports first (drop component side-effects, keep
  // sibling side-effects as no-ops since the sibling block is inlined above).
  let body = source.replace(sideEffectImportRegex, (match, spec) => {
    const targetAbs = resolveImport(absPath, spec);
    if (isComponentImport(targetAbs)) {
      return `/* dropped side-effect import "${spec}" — provided by components/index.bundle.js */`;
    }
    return `/* import "${spec}" — sibling block already inlined */`;
  });

  body = body.replace(clauseImportRegex, (match, clause, spec) => {
    const targetAbs = resolveImport(absPath, spec);
    const trimmed = clause.trim();
    if (isComponentImport(targetAbs)) {
      const targetId = componentModuleId(targetAbs);
      if (trimmed.startsWith("{")) {
        const names = trimmed.slice(1, -1).split(",").map((n) => n.trim()).filter(Boolean);
        for (const entry of names) {
          const [orig, aliased] = entry.split(/\s+as\s+/).map((s) => s.trim());
          const local = aliased || orig;
          importLines.push(`const ${local} = window.__fdic_modules["${targetId}"].${orig};`);
        }
      } else if (trimmed.startsWith("*")) {
        const [, , alias] = trimmed.split(/\s+/);
        importLines.push(`const ${alias} = window.__fdic_modules["${targetId}"];`);
      } else {
        importLines.push(`const ${trimmed} = window.__fdic_modules["${targetId}"].default;`);
      }
      return `/* import handled */`;
    }
    const targetId = siblingModuleId(targetAbs);
    if (trimmed.startsWith("{")) {
      const names = trimmed.slice(1, -1).split(",").map((n) => n.trim()).filter(Boolean);
      for (const entry of names) {
        const [orig, aliased] = entry.split(/\s+as\s+/).map((s) => s.trim());
        const local = aliased || orig;
        importLines.push(`const ${local} = __locals["${targetId}"].${orig};`);
      }
    } else if (trimmed.startsWith("*")) {
      const [, , alias] = trimmed.split(/\s+/);
      importLines.push(`const ${alias} = __locals["${targetId}"];`);
    } else {
      importLines.push(`const ${trimmed} = __locals["${targetId}"].default;`);
    }
    return `/* import handled */`;
  });

  body = body.replace(exportNamedRegex, (match, kind, name) => {
    exportRegistrations.push(`__locals["${id}"].${name} = ${name};`);
    return `${kind} ${name}`;
  });

  body = body.replace(exportListRegex, (match, list) => {
    const entries = list.split(",").map((e) => e.trim()).filter(Boolean);
    for (const entry of entries) {
      const [orig, aliased] = entry.split(/\s+as\s+/).map((s) => s.trim());
      const exportedAs = aliased || orig;
      exportRegistrations.push(`__locals["${id}"].${exportedAs} = ${orig};`);
    }
    return `/* export list handled */`;
  });

  const importsBlock = importLines.length ? `  ${importLines.join("\n  ")}\n` : "";
  const exportsBlock = exportRegistrations.length ? `\n  ${exportRegistrations.join("\n  ")}` : "";
  return `// === sibling: ${id} ===\n(function(){\n  __locals["${id}"] = __locals["${id}"] || {};\n${importsBlock}${body}${exportsBlock}\n})();\n`;
}

async function discoverSiblings(entryAbs) {
  // DFS from the entry, collect sibling-module dependencies in dependency
  // order so deps are defined before their users.
  const order = [];
  const visited = new Set();
  async function visit(absPath) {
    if (visited.has(absPath)) return;
    visited.add(absPath);
    const source = await readFile(absPath, "utf8");
    const deps = new Set();
    for (const re of [sideEffectImportRegex, clauseImportRegex]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(source)) !== null) {
        const spec = re === sideEffectImportRegex ? m[1] : m[2];
        const targetAbs = resolveImport(absPath, spec);
        if (!isComponentImport(targetAbs) && targetAbs !== entryAbs) {
          deps.add(targetAbs);
        }
      }
    }
    for (const dep of deps) await visit(dep);
    if (absPath !== entryAbs) order.push({ absPath, source });
  }
  await visit(entryAbs);
  return order;
}

function transformEntry(absPath, source) {
  // Same as the sibling transformer, but does not wrap in an IIFE (the
  // outer bundle wrapper handles that) and does not register exports
  // (the entry has no exports — it's a top-level page script).
  let body = source.replace(sideEffectImportRegex, (match, spec) => {
    const targetAbs = resolveImport(absPath, spec);
    if (isComponentImport(targetAbs)) {
      return `/* dropped side-effect import "${spec}" — provided by components/index.bundle.js */`;
    }
    return `/* import "${spec}" — sibling block already inlined */`;
  });

  body = body.replace(clauseImportRegex, (match, clause, spec) => {
    const targetAbs = resolveImport(absPath, spec);
    const trimmed = clause.trim();
    if (isComponentImport(targetAbs)) {
      const targetId = componentModuleId(targetAbs);
      if (trimmed.startsWith("{")) {
        return trimmed
          .slice(1, -1)
          .split(",").map((n) => n.trim()).filter(Boolean)
          .map((entry) => {
            const [orig, aliased] = entry.split(/\s+as\s+/).map((s) => s.trim());
            return `const ${aliased || orig} = window.__fdic_modules["${targetId}"].${orig};`;
          })
          .join("\n");
      }
      if (trimmed.startsWith("*")) {
        const [, , alias] = trimmed.split(/\s+/);
        return `const ${alias} = window.__fdic_modules["${targetId}"];`;
      }
      return `const ${trimmed} = window.__fdic_modules["${targetId}"].default;`;
    }
    const targetId = siblingModuleId(targetAbs);
    if (trimmed.startsWith("{")) {
      return trimmed
        .slice(1, -1)
        .split(",").map((n) => n.trim()).filter(Boolean)
        .map((entry) => {
          const [orig, aliased] = entry.split(/\s+as\s+/).map((s) => s.trim());
          return `const ${aliased || orig} = __locals["${targetId}"].${orig};`;
        })
        .join("\n");
    }
    if (trimmed.startsWith("*")) {
      const [, , alias] = trimmed.split(/\s+/);
      return `const ${alias} = __locals["${targetId}"];`;
    }
    return `const ${trimmed} = __locals["${targetId}"].default;`;
  });
  return body;
}

const entryArg = process.argv[2];
if (!entryArg) {
  console.error("Usage: node scripts/bundle-fdic-epic-page-script.mjs <entry-file>");
  process.exit(1);
}
const entryAbs = resolve(process.cwd(), entryArg);
const entrySource = await readFile(entryAbs, "utf8");

const siblings = await discoverSiblings(entryAbs);
const siblingBlocks = siblings.map(({ absPath, source }) => transformSibling(absPath, source));
const entryTransformed = transformEntry(entryAbs, entrySource);

const outputBase = basename(entryAbs, extname(entryAbs));
const outputAbs = resolve(SITE_DIR, `${outputBase}.bundle.js`);

const header =
  `/* AUTO-GENERATED by scripts/bundle-fdic-epic-page-script.mjs — do not edit by hand.\n` +
  `   Regenerate with: node scripts/bundle-fdic-epic-page-script.mjs ${relative(process.cwd(), entryAbs)}\n` +
  `   Source: ${relative(process.cwd(), entryAbs)}\n` +
  `   Depends on window.__fdic_modules registry created by components/index.bundle.js.\n*/\n` +
  `(function(){\n` +
  `const __locals = {};\n`;
const footer = `\n})();\n`;

const out = header + siblingBlocks.join("\n") + "\n" + entryTransformed + footer;
await writeFile(outputAbs, out, "utf8");
console.log(
  `Wrote ${relative(process.cwd(), outputAbs)} — ${siblings.length} sibling module${siblings.length === 1 ? "" : "s"} inlined, ${Math.round(out.length / 102.4) / 10} KB`,
);
