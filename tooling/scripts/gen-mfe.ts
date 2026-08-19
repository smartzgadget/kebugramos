import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: pnpm gen:mfe <mfe-name> e.g. pnpm gen:mfe mfe-kebuchat");
  process.exit(1);
}
if (!name.startsWith("mfe-")) {
  console.error("MFE name must start with mfe-");
  process.exit(1);
}
const target = path.join("apps", name);
if (fs.existsSync(target)) {
  console.error(`Exists: ${target}`);
  process.exit(1);
}
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(
  path.join(target, "package.json"),
  JSON.stringify({ name: `@kebugram/${name}`, private: true, version: "0.1.0", scripts: { build: "next build", dev: "next dev", lint: "next lint", typecheck: "tsc --noEmit" } }, null, 2)
);
fs.writeFileSync(path.join(target, "README.md"), `# ${name}\nRemote MFE — exposes ./App and ./Widget via Module Federation.\n`);
console.log(`Created ${target}`);
