const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sources = [
  path.join(root, 'Fish - DataSet', 'fish_images'),
  path.join(root, 'Plant - DataSet', 'plant'),
];
const destRoot = path.join(root, 'frontend', 'public', 'species', 'gallery');
const manifestPath = path.join(root, 'frontend', 'src', 'data', 'galleryManifest.json');

function folderSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function copyImages(fromDir, toDir) {
  if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });
  const files = fs.readdirSync(fromDir)
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file) && !file.startsWith('_thumb'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const preferred = ['img_1.jpg', 'img_2.jpg', 'img_3.jpg', 'img_1.jpeg', 'img_2.jpeg', 'img_3.jpeg'];
  const chosen = [];
  preferred.forEach((name) => {
    if (files.includes(name)) chosen.push(name);
  });
  files.forEach((file) => {
    if (!chosen.includes(file) && chosen.length < 3) chosen.push(file);
  });

  return chosen.slice(0, 3).map((file, index) => {
    const target = `${index + 1}.jpg`;
    fs.copyFileSync(path.join(fromDir, file), path.join(toDir, target));
    return target;
  });
}

const gallery = {};
if (!fs.existsSync(destRoot)) fs.mkdirSync(destRoot, { recursive: true });
sources.forEach((source) => {
  if (!fs.existsSync(source)) return;
  fs.readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      const slug = folderSlug(entry.name);
      if (!slug) return;
      const copied = copyImages(path.join(source, entry.name), path.join(destRoot, slug));
      if (copied.length) gallery[slug] = copied.map((_, index) => `/species/gallery/${slug}/${index + 1}.jpg`);
    });
});

fs.readdirSync(destRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .forEach((entry) => {
    const slug = folderSlug(entry.name);
    const files = [1, 2, 3]
      .map((index) => `/species/gallery/${slug}/${index}.jpg`)
      .filter((_, index) => fs.existsSync(path.join(destRoot, entry.name, `${index + 1}.jpg`)));
    if (files.length) gallery[slug] = files;
  });

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(gallery, null, 2)}\n`);
console.log(`Synced ${Object.keys(gallery).length} galleries to public/species/gallery`);
