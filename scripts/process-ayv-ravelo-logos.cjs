const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const SOURCES = {
  ayv: "C:\\Users\\Aron\\.cursor\\projects\\c-Users-Aron-Documents-ayv-wrld-automations\\assets\\C__Users_Aron_.cursor_projects_c-Users-Aron-Documents-ayv-wrld-automations_assets_c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_ayvwrld-logo-48b83f35-7b9f-43cf-a3f9-b16f97c2a8e7.png",
  ravelo: "C:\\Users\\Aron\\.cursor\\projects\\c-Users-Aron-Documents-ayv-wrld-automations\\assets\\C__Users_Aron_.cursor_projects_c-Users-Aron-Documents-ayv-wrld-automations_assets_c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_ravelo-logo-96b28181-ad83-483b-93b5-6749121fd65b.png",
};
const FILES = {
  ayv: path.join(ROOT, "public", "brands", "ayv", "logo.png"),
  ravelo: path.join(ROOT, "public", "brands", "ravelo", "logo.png"),
};
const PREVIEW_DIR = path.join(ROOT, ".tmp-screens", "logo-cream");
const WHITE_THRESHOLD = 242;

function isBlue(r, g, b) {
  return b >= 40 && b >= r + 12 && b >= g + 12;
}

function isNearWhite(r, g, b, threshold = WHITE_THRESHOLD) {
  return r >= threshold && g >= threshold && b >= threshold;
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
    if (!isNearWhite(data[o], data[o + 1], data[o + 2], threshold)) return;
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

function punchRemainingNearWhite(data, width, height, threshold) {
  let punched = 0;
  const pixelCount = width * height;
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    if (!isNearWhite(data[o], data[o + 1], data[o + 2], threshold)) continue;
    data[o + 3] = 0;
    punched++;
  }
  return punched;
}

function unwhiteAntialias(data, width, height) {
  const pixelCount = width * height;
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const minC = Math.min(r, g, b);
    const alpha = 1 - minC / 255;
    if (alpha < 0.04) {
      data[o + 3] = 0;
      continue;
    }
    data[o] = Math.min(255, Math.max(0, Math.round((r - 255 * (1 - alpha)) / alpha)));
    data[o + 1] = Math.min(255, Math.max(0, Math.round((g - 255 * (1 - alpha)) / alpha)));
    data[o + 2] = Math.min(255, Math.max(0, Math.round((b - 255 * (1 - alpha)) / alpha)));
    data[o + 3] = Math.min(255, Math.round(alpha * 255));
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
  const padX = Math.max(6, Math.round((maxX - minX + 1) * 0.04));
  const padY = Math.max(6, Math.round((maxY - minY + 1) * 0.04));
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

async function processLogo(file, kind) {
  const input = fs.readFileSync(file);
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  image.destroy();
  const pixels = Buffer.from(data);
  const before = summarize(pixels, info.width, info.height, `${kind}-before`);
  const punchedEdge = punchFromEdges(pixels, info.width, info.height, WHITE_THRESHOLD);
  const punchedInner = punchRemainingNearWhite(pixels, info.width, info.height, WHITE_THRESHOLD);
  unwhiteAntialias(pixels, info.width, info.height);
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
  const sources = {
    ayv: process.env.AYV_LOGO_SRC || SOURCES.ayv,
    ravelo: process.env.RAVELO_LOGO_SRC || SOURCES.ravelo,
  };

  for (const [kind, dest] of Object.entries(FILES)) {
    const src = sources[kind];
    if (!fs.existsSync(src)) {
      throw new Error(`Missing source for ${kind}: ${src}`);
    }
    fs.copyFileSync(src, dest);
    const result = await processLogo(dest, kind);
    console.log(JSON.stringify(result, null, 2));
    const preview = await writeCreamPreview(dest, kind);
    console.log("preview", preview);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
