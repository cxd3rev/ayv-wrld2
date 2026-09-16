const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const srcDir =
  "C:\\Users\\Aron\\.cursor\\projects\\c-Users-Aron-Documents-ayv-wrld-automations\\assets";
const destRoot = path.join(process.cwd(), "public", "brands");
const appDir = path.join(process.cwd(), "app");
const pattern = /(ayv|avyro|velto|rovyn|orvyn|nexro|ravelo)-(icon|logo|name)-/;

async function run() {
  fs.mkdirSync(destRoot, { recursive: true });

  for (const file of fs.readdirSync(srcDir)) {
    const match = file.match(pattern);
    if (!match) continue;

    const [, brand, kind] = match;
    const outDir = path.join(destRoot, brand);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${kind}.png`);

    const trimmed = await sharp(path.join(srcDir, file))
      .trim({
        background: { r: 0, g: 0, b: 0, alpha: 255 },
        threshold: kind === "icon" ? 18 : 5,
      })
      .toBuffer({ resolveWithObject: true });

    const longest = Math.max(trimmed.info.width, trimmed.info.height);
    const pad = Math.max(12, Math.round(longest * 0.08));

    let pipeline = sharp(trimmed.data).extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    if (kind === "icon") {
      pipeline = pipeline.resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    await pipeline.png().toFile(outFile);
    const info = await sharp(outFile).metadata();
    console.log(`${brand}/${kind}.png ${info.width}x${info.height}`);
  }

  const ayvIcon = path.join(destRoot, "ayv", "icon.png");
  if (fs.existsSync(ayvIcon)) {
    await sharp(ayvIcon).resize(32, 32).png().toFile(path.join(appDir, "icon.png"));
    await sharp(ayvIcon).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
    console.log("wrote app/icon.png and app/apple-icon.png");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
