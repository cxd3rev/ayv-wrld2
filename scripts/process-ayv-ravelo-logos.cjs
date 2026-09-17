const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ESPRESSO = { r: 8, g: 5, b: 3 };
const ROOT = process.cwd();
const FILES = {
  ayv: path.join(ROOT, "public", "brands", "ayv", "logo.png"),
  ravelo: path.join(ROOT, "public", "brands", "ravelo", "logo.png"),
};
const PREVIEW_DIR = path.join(ROOT, ".tmp-screens", "logo-cream");

function isBlue(r, g, b) {
  // Keep the crescent and its chromatic fade as blue — not espresso.
  return b >= 10 && b >= r + 6 && b >= g + 6;
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
    if (data[o + 3] === 0) {
      visited[i] = 1;
      return;
    }
    if (data[o] > threshold || data[o + 1] > threshold || data[o + 2] > threshold) return;
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
    data[i * 4 + 3] = 0;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  return tail;
}

function punchRemainingTrueBlack(data, width, height) {
  let punched = 0;
  const pixelCount = width * height;
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    if (data[o] === 0 && data[o + 1] === 0 && data[o + 2] === 0) {
      data[o + 3] = 0;
      punched++;
    }
  }
  return punched;
}

function dilateEspresso(data, width, height, radius = 1) {
  const src = Buffer.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (src[i + 3] !== 0) continue;
      let found = false;
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = (ny * width + nx) * 4;
          if (src[ni + 3] === 0) continue;
          if (isBlue(src[ni], src[ni + 1], src[ni + 2])) continue;
          data[i] = src[ni];
          data[i + 1] = src[ni + 1];
          data[i + 2] = src[ni + 2];
          data[i + 3] = src[ni + 3];
          found = true;
          break;
        }
      }
    }
  }
}

function boundingBox(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { left: 0, top: 0, width, height };
  const padX = Math.max(8, Math.round((maxX - minX + 1) * 0.08));
  const padY = Math.max(8, Math.round((maxY - minY + 1) * 0.08));
  const left = Math.max(0, minX - padX);
  const top = Math.max(0, minY - padY);
  const right = Math.min(width - 1, maxX + padX);
  const bottom = Math.min(height - 1, maxY + padY);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function summarize(data, width, height, label) {
  const pixelCount = width * height;
  let opaque = 0;
  let transparent = 0;
  let minL = 255;
  let maxL = 0;
  let blue = 0;
  let dark = 0;
  let light = 0;
  let aSum = 0;
  const sample = (x, y) => {
    const o = (y * width + x) * 4;
    return [data[o], data[o + 1], data[o + 2], data[o + 3]];
  };
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    const a = data[o + 3];
    if (a === 0) {
      transparent++;
      continue;
    }
    opaque++;
    aSum += a;
    const luma = Math.max(data[o], data[o + 1], data[o + 2]);
    if (luma < minL) minL = luma;
    if (luma > maxL) maxL = luma;
    if (isBlue(data[o], data[o + 1], data[o + 2])) blue++;
    else if (luma <= 40) dark++;
    else light++;
  }
  return {
    label,
    size: `${width}x${height}`,
    opaque,
    transparent,
    opaquePct: ((opaque / pixelCount) * 100).toFixed(2),
    minL: opaque ? minL : null,
    maxL: opaque ? maxL : null,
    avgA: opaque ? Math.round(aSum / opaque) : 0,
    blue,
    dark,
    light,
    corners: [sample(0, 0), sample(width - 1, 0), sample(0, height - 1), sample(width - 1, height - 1)],
  };
}

function dilateMask(mask, width, height, radius) {
  const src = Buffer.from(mask);
  const out = Buffer.alloc(mask.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (src[i]) {
        out[i] = 1;
        continue;
      }
      let hit = 0;
      for (let dy = -radius; dy <= radius && !hit; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (src[ny * width + nx]) {
            hit = 1;
            break;
          }
        }
      }
      out[i] = hit;
    }
  }
  return out;
}

function recolorAyv(data, width, height) {
  const pixelCount = width * height;
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    const luma = Math.max(data[o], data[o + 1], data[o + 2]);
    if (luma < 1) {
      data[o + 3] = 0;
      continue;
    }
    // Light-on-black hairline becomes a solid espresso stroke on cream.
    data[o] = ESPRESSO.r;
    data[o + 1] = ESPRESSO.g;
    data[o + 2] = ESPRESSO.b;
    data[o + 3] = 255;
  }
}

function recolorRavelo(data, width, height) {
  const pixelCount = width * height;
  const blueMask = Buffer.alloc(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    if (isBlue(data[o], data[o + 1], data[o + 2])) blueMask[i] = 1;
  }
  const blueHalo = dilateMask(blueMask, width, height, 4);

  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    if (blueMask[i]) {
      data[o + 3] = 255;
      continue;
    }
    // Near-black fade around the crescent would otherwise become a dark box.
    if (blueHalo[i]) {
      data[o + 3] = 0;
      continue;
    }
    const luma = Math.max(data[o], data[o + 1], data[o + 2]);
    if (luma < 1) {
      data[o + 3] = 0;
      continue;
    }
    data[o] = ESPRESSO.r;
    data[o + 1] = ESPRESSO.g;
    data[o + 2] = ESPRESSO.b;
    data[o + 3] = 255;
  }
}

async function processLogo(file, kind) {
  const input = fs.readFileSync(file);
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  image.destroy();
  const pixels = Buffer.from(data);
  const before = summarize(pixels, info.width, info.height, `${kind}-before`);
  const punchedEdge = punchFromEdges(pixels, info.width, info.height, 0);
  const punchedInner = punchRemainingTrueBlack(pixels, info.width, info.height);
  if (kind === "ayv") recolorAyv(pixels, info.width, info.height);
  else recolorRavelo(pixels, info.width, info.height);
  dilateEspresso(pixels, info.width, info.height, kind === "ayv" ? 2 : 1);
  const box = boundingBox(pixels, info.width, info.height);
  const cropped = Buffer.alloc(box.width * box.height * 4);
  for (let y = 0; y < box.height; y++) {
    const srcStart = ((box.top + y) * info.width + box.left) * 4;
    pixels.copy(cropped, y * box.width * 4, srcStart, srcStart + box.width * 4);
  }
  const tmp = `${file}.tmp.png`;
  await sharp(cropped, {
    raw: { width: box.width, height: box.height, channels: 4 },
  })
    .png()
    .toFile(tmp);
  fs.copyFileSync(tmp, file);
  fs.unlinkSync(tmp);

  const after = summarize(cropped, box.width, box.height, `${kind}-after`);
  return { punchedEdge, punchedInner, box, before, after };
}

async function writeCreamPreview(file, name) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cream = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 4;
    const a = data[o + 3] / 255;
    cream[o] = Math.round(data[o] * a + 250 * (1 - a));
    cream[o + 1] = Math.round(data[o + 1] * a + 250 * (1 - a));
    cream[o + 2] = Math.round(data[o + 2] * a + 249 * (1 - a));
    cream[o + 3] = 255;
  }
  const out = path.join(PREVIEW_DIR, `${name}.png`);
  await sharp(cream, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(out);
  return out;
}

async function main() {
  for (const [kind, file] of Object.entries(FILES)) {
    const result = await processLogo(file, kind);
    console.log(JSON.stringify(result, null, 2));
    const preview = await writeCreamPreview(file, kind);
    console.log("preview", preview);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
