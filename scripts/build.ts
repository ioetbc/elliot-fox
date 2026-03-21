import {$} from "bun";

// Clean dist directory
await $`rm -rf dist`;
await $`mkdir -p dist`;

// Build frontend (HTML with bundled JS/CSS)
const buildResult = await Bun.build({
  entrypoints: ["./client/index.html"],
  outdir: "./dist",
  minify: true,
  splitting: true,
  target: "browser",
});

if (!buildResult.success) {
  console.error("Frontend build failed:");
  for (const log of buildResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("Frontend built successfully");

// Build worker for Cloudflare Pages
const workerResult = await Bun.build({
  entrypoints: ["./worker/index.ts"],
  outdir: "./dist",
  minify: true,
  target: "browser", // Cloudflare Workers use web APIs
  external: ["__STATIC_CONTENT_MANIFEST"],
  naming: "_worker.js",
});

if (!workerResult.success) {
  console.error("Worker build failed:");
  for (const log of workerResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("Worker built successfully");
console.log("Build complete! Output in ./dist");
