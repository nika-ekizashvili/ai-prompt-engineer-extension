import { copyFileSync, mkdirSync, existsSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create dist structure
const distDir = join(__dirname, 'dist');

// Copy manifest
copyFileSync(
  join(__dirname, 'src/manifest.json'),
  join(distDir, 'manifest.json')
);

// Copy icons
const iconsDir = join(distDir, 'icons');
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

cpSync(
  join(__dirname, 'public/icons'),
  iconsDir,
  { recursive: true }
);

// Create popup.html that loads the popup.js
const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Prompt Engineer</title>
  <link rel="stylesheet" href="assets/popup.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="popup.js"></script>
</body>
</html>`;

writeFileSync(join(distDir, 'popup.html'), popupHtml);

console.log('✓ Extension files copied');
