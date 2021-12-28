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
  console.log(`process-images.mjs: done`);
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
      const nameToCheck = `${name.substring(0, name.lastIndexOf('-bloghouse-opt'))}.${path.extname(
        name
      )}`;
      if (files.includes(nameToCheck)) {
        console.warn('find already optimized image, deleted', fullPath);
        fs.rm(fullPath);
        continue;
      }
      console.warn('find already optimized image, ignored', fullPath);
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
  const jpgName = getOutputFileName(info.name, 'jpg');
  const webpName = getOutputFileName(info.name, 'webp');
  const avifName = getOutputFileName(info.name, 'avif');
  return Promise.all([
    sharp(info.path)
      .toFormat('jpg', { progressive: true, mozjpeg: true })
      .toFile(jpgName)
      .then(() => console.log('optimized image file saved to ', jpgName)),
    sharp(info.path)
      .toFormat('webp')
      .toFile(webpName)
      .then(() => console.log('optimized image file saved to ', webpName)),
    sharp(info.path)
      .toFormat('avif', { quality: 70 })
      .toFile(avifName)
      .then(() => console.log('optimized image file saved to ', avifName))
  ]);
}

function getOutputFileName(name, ext) {
  return `${name}-bloghouse-opt.${ext}`;
}

doWork().catch((err) => console.error('process-images.mjs: failed', err));
