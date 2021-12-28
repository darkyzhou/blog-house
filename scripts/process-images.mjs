import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const PATHS = ['./static/images/uploads'];
const SUPPORTED_TYPES = new Map(['jpg', 'jpeg', 'png', 'webp', 'avif'].map((x) => [x, 1]));

async function doWork() {
  const infos = await resolveFileInfos();
  if (infos.length <= 0) {
    console.log('process-images.mjs: no images found, skipping');
    return;
  }
  console.log(`process-images.mjs: found ${infos.length} images, ready to optimize`);
  await Promise.all(infos.map((info) => getTask(info)).flat());
  console.log(`process-images.mjg: done`);
}

async function resolveFileInfos() {
  const results = await Promise.all(PATHS.map((p) => getFileInfo(p)));
  return results.flat();
}

async function getFileInfo(dir) {
  const results = [];
  const files = await fs.readdir(dir);
  for (const name of files) {
    const fullPath = path.join(dir, name);
    if (!SUPPORTED_TYPES.has(path.extname(name).substring(1))) {
      console.warn('ignored unsupported image file', fullPath);
      continue;
    }
    if (name.includes('-bloghouse-opt')) {
      console.warn('ignored image file that is already optimized');
      continue;
    }
    const fileName = path.join(dir, path.parse(name).name);
    if (results.find((item) => item.name == fileName)) {
      console.warn('ignored image file with the same name', fullPath);
      continue;
    }
    results.push({
      path: fullPath,
      name: fileName
    });
  }
  return results;
}

function getTask(info) {
  return Promise.all([
    sharp(info.path)
      .toFormat('jpg', { progressive: true, mozjpeg: true })
      .toFile(getOutputFileName(info.name, 'jpg')),
    sharp(info.path).toFormat('webp').toFile(getOutputFileName(info.name, 'webp')),
    sharp(info.path).toFormat('avif', { quality: 70 }).toFile(getOutputFileName(info.name, 'avif'))
  ]);
}

function getOutputFileName(name, ext) {
  return `${name}-bloghouse-opt.${ext}`;
}

doWork().catch((err) => console.error('process-images.mjs: failed', err));
