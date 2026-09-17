const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const brandsRoot = path.join(process.cwd(), "public", "brands");
const appDir = path.join(process.cwd(), "app");
const brands = ["ayv", "avyro", "velto", "rovyn", "orvyn", "nexro", "ravelo"];
const kinds = ["icon", "logo", "name"];

const SKIP = new Set(["ayv/name"]);
const ICON_THRESHOLD = 40;
const MARK_THRESHOLD = 8;
const OVERRIDES = {
  // Hairline outline; luma 0 is canvas, AA starts at 1.
  "ayv/logo": 0,
  // Faint outlines sit just above true black; blue crescent is chroma.
  "ravelo/logo": 0,
  // Dark organic layers live around luma 2–5.
  "nexro/logo": 1,
  // Gray swirl lives around luma 33–47.
  "avyro/logo": 16,
  "avyro/name": 16,
  // Dark hex rings live around luma 6–8.
  "rovyn/logo": 4,
  "rovyn/name": 4,
  // Dark companion blobs live around luma 13–16.
  "orvyn/logo": 8,
  "orvyn/name": 8,
  "velto/logo": 12,
  "velto/name": 12,
};
const SKIP_SPECKS = new Set(["ayv/logo", "ravelo/logo"]);

function fileKey(brand, kind) {
  return `${brand}/${kind}`;
}

function thresholdFor(brand, kind) {
  return OVERRIDES[fileKey(brand, kind)] ?? (kind === "icon" ? ICON_THRESHOLD : MARK_THRESHOLD);
}

function isNearBlack(r, g, b, a, threshold) {
  if (a === 0) return true;
  return r <= threshold && g <= threshold && b <= threshold;
}

function punchFromEdges(data, width, height, threshold) {
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * 4;
    if (!isNearBlack(data[o], data[o + 1], data[o + 2], data[o + 3], threshold)) return;
    visited[i] = 1;
    queue[tail++] = i;
  };

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  while (head < tail) {
    const i = queue[head++];
    const x = i % width;
    const y = (i / width) | 0;
    const o = i * 4;
    data[o + 3] = 0;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  return tail;
}

function punchRemainingNearBlack(data, width, height, threshold) {
  const pixelCount = width * height;
  let punched = 0;
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    if (!isNearBlack(data[o], data[o + 1], data[o + 2], data[o + 3], threshold)) continue;
    data[o + 3] = 0;
    punched++;
  }
  return punched;
}

function removeTinySpecks(data, width, height, minArea = 200) {
  const pixelCount = width * height;
  const seen = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let removed = 0;

  for (let start = 0; start < pixelCount; start++) {
    if (seen[start] || data[start * 4 + 3] === 0) continue;

    let head = 0;
    let tail = 0;
    seen[start] = 1;
    queue[tail++] = start;

    while (head < tail) {
      const i = queue[head++];
      const x = i % width;
      const y = (i / width) | 0;
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (seen[ni] || data[ni * 4 + 3] === 0) continue;
        seen[ni] = 1;
        queue[tail++] = ni;
      }
    }

    if (tail >= minArea) continue;
    for (let q = 0; q < tail; q++) {
      data[queue[q] * 4 + 3] = 0;
      removed++;
    }
  }

  return removed;
}

function summarize(data, width, height, label) {
  const pixelCount = width * height;
  let opaque = 0;
  let transparent = 0;
  let minOpaqueLuma = 255;
  let maxOpaqueLuma = 0;
  let corner = [];

  const sample = (x, y) => {
    const o = (y * width + x) * 4;
    return [data[o], data[o + 1], data[o + 2], data[o + 3]];
  };

  corner = [sample(0, 0), sample(width - 1, 0), sample(0, height - 1), sample(width - 1, height - 1)];

  const buckets = { 0: 0, 4: 0, 8: 0, 12: 0, 16: 0, 24: 0, 32: 0, 48: 0, 64: 0 };
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    const a = data[o + 3];
    if (a === 0) {
      transparent++;
      continue;
    }
    opaque++;
    const luma = Math.max(data[o], data[o + 1], data[o + 2]);
    if (luma < minOpaqueLuma) minOpaqueLuma = luma;
    if (luma > maxOpaqueLuma) maxOpaqueLuma = luma;
    for (const t of Object.keys(buckets)) {
      if (luma <= Number(t)) buckets[t]++;
    }
  }

  return {
    label,
    size: `${width}x${height}`,
    opaque,
    transparent,
    opaquePct: ((opaque / pixelCount) * 100).toFixed(1),
    minOpaqueLuma: opaque ? minOpaqueLuma : null,
    maxOpaqueLuma: opaque ? maxOpaqueLuma : null,
    nearBlackOpaque: buckets,
    corners: corner,
  };
}

async function inspect(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return summarize(data, info.width, info.height, path.relative(process.cwd(), file));
}

async function processFile(file, brand, kind) {
  const image = sharp(file).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);
  const threshold = thresholdFor(brand, kind);
  let punched = punchFromEdges(pixels, info.width, info.height, threshold);
  // Enclosed true-black canvas (logo interiors, wordmark counters) never touches the edges.
  if (kind === "name" || kind === "logo") {
    punched += punchRemainingNearBlack(pixels, info.width, info.height, threshold);
  }
  if (!SKIP_SPECKS.has(fileKey(brand, kind))) {
    punched += removeTinySpecks(pixels, info.width, info.height);
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(file);

  const after = summarize(pixels, info.width, info.height, `${brand}/${kind}.png`);
  return { threshold, punched, after };
}

async function writeAppIcons() {
  const ayvIcon = path.join(brandsRoot, "ayv", "icon.png");
  await sharp(ayvIcon).resize(32, 32).png().toFile(path.join(appDir, "icon.png"));
  await sharp(ayvIcon).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
}

async function main() {
  const mode = process.argv[2] || "punch";
  const kindsToProcess = mode === "logos" ? ["logo"] : kinds;
  const writeIcons = mode !== "logos" && mode !== "inspect";

  if (mode === "inspect") {
    for (const brand of brands) {
      for (const kind of kinds) {
        const file = path.join(brandsRoot, brand, `${kind}.png`);
        const stats = await inspect(file);
        console.log(JSON.stringify(stats));
      }
    }
    return;
  }

  for (const brand of brands) {
    for (const kind of kindsToProcess) {
      const file = path.join(brandsRoot, brand, `${kind}.png`);
      if (SKIP.has(fileKey(brand, kind))) {
        console.log(`${brand}/${kind}.png skipped (black-on-black mark; punching would erase it)`);
        continue;
      }
      const result = await processFile(file, brand, kind);
      console.log(
        `${brand}/${kind}.png threshold=${result.threshold} punched=${result.punched} opaque=${result.after.opaque} (${result.after.opaquePct}%) luma=${result.after.minOpaqueLuma}-${result.after.maxOpaqueLuma}`,
      );
    }
  }

  if (writeIcons) {
    await writeAppIcons();
    console.log("wrote app/icon.png and app/apple-icon.png");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
