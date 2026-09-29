const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const ASSETS = "C:\\Users\\Aron\\.cursor\\projects\\c-Users-Aron-Documents-ayv-wrld-automations\\assets";
const SOURCES = {
  avyro: path.join(ASSETS, "c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_avyro-logo-w-5032c907-3963-4298-9342-8134b64dd3cb.png"),
  orvyn: path.join(ASSETS, "c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_orvyn-logo-w-e257fee3-20d2-415c-a7f5-402cd830966f.png"),
  nexro: path.join(ASSETS, "c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_nexro-logo-w-fa5e2eac-83c1-40e3-9ebd-44f82431408a.png"),
  ravelo: path.join(ASSETS, "c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_ravelo-logo-w-b94c3c9f-e4bf-4126-bdf5-019c968a5aab.png"),
  rovyn: path.join(ASSETS, "c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_rovyn-logo-w-e1fe9262-d2e6-44aa-954f-fe2cac2528fd.png"),
  velto: path.join(ASSETS, "c__Users_Aron_AppData_Roaming_Cursor_User_workspaceStorage_55b5737cbc315e8b939e2198291f0ee8_images_velto-logo-w-b817e519-8371-43cf-a802-1a165a85d106.png"),
};

const LOW = 14;
const HIGH = 242;

function toWhiteMark(data) {
  const pixels = data.length / 4;
  let opaque = 0;
  for (let i = 0; i < pixels; i++) {
    const o = i * 4;
    const luma = Math.round((data[o] + data[o + 1] + data[o + 2]) / 3);
    if (luma <= LOW) {
      data[o + 3] = 0;
      continue;
    }
    data[o] = 255;
    data[o + 1] = 255;
    data[o + 2] = 255;
    if (luma >= HIGH) data[o + 3] = 255;
    else data[o + 3] = Math.round(((luma - LOW) / (HIGH - LOW)) * 255);
    opaque++;
  }
  return opaque;
}

function bounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 8) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const pad = Math.max(8, Math.round(Math.max(maxX - minX, maxY - minY) * 0.04));
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = Math.min(height - 1, maxY + pad);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function processOne(id, src) {
  if (!fs.existsSync(src)) throw new Error(`Missing ${id}: ${src}`);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);
  const opaque = toWhiteMark(pixels);
  const box = bounds(pixels, info.width, info.height);
  const cropped = Buffer.alloc(box.width * box.height * 4);
  for (let y = 0; y < box.height; y++) {
    const srcStart = ((box.top + y) * info.width + box.left) * 4;
    pixels.copy(cropped, y * box.width * 4, srcStart, srcStart + box.width * 4);
  }
  const dir = path.join(ROOT, "public", "brands", id);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "mark-transparent-v3.webp");
  await sharp(cropped, { raw: { width: box.width, height: box.height, channels: 4 } })
    .webp({ lossless: true })
    .toFile(out);

  const previewDir = path.join(ROOT, ".tmp-screens", "logo-new");
  fs.mkdirSync(previewDir, { recursive: true });
  const bg = { r: 12, g: 12, b: 12, alpha: 1 };
  await sharp(cropped, { raw: { width: box.width, height: box.height, channels: 4 } })
    .resize(280, 280, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: bg })
    .png()
    .toFile(path.join(previewDir, `${id}.png`));

  console.log(id, `${info.width}x${info.height}`, "->", `${box.width}x${box.height}`, "opaque", opaque);
}

async function main() {
  for (const [id, src] of Object.entries(SOURCES)) {
    await processOne(id, src);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
