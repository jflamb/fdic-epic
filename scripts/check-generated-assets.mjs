import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";

const generatedArtifacts = [
  "components/index.bundle.js",
  "support-intake.bundle.js",
  "faq-index.json",
  "faq.html",
];

for (const artifact of generatedArtifacts) {
  try {
    await access(artifact);
  } catch {
    console.error(`Generated artifact is missing: ${artifact}`);
    process.exit(1);
  }

  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", artifact], {
    encoding: "utf8",
  });

  if (tracked.status !== 0) {
    console.error(`Generated artifact is not tracked by git: ${artifact}`);
    process.exit(1);
  }
}

const result = spawnSync("git", ["status", "--porcelain", "--", ...generatedArtifacts], {
  encoding: "utf8",
});

if (result.error) {
  console.error(`Unable to check generated artifacts: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(result.stderr || "git status failed while checking generated artifacts.");
  process.exit(result.status || 1);
}

const drift = result.stdout.trim();

if (drift) {
  console.error("Generated artifacts are out of date. Run `npm run build` and commit the regenerated files:");
  console.error(drift);
  process.exit(1);
}

console.log("Generated artifacts are current.");
