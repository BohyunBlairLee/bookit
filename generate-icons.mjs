import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('./client/public/icon.svg');

async function generateIcons() {
  // Generate 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('./client/public/icon-192x192.png');

  console.log('Generated icon-192x192.png');

  // Generate 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('./client/public/icon-512x512.png');

  console.log('Generated icon-512x512.png');

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('./client/public/favicon.ico');

  console.log('Generated favicon.ico');
}

generateIcons().catch(console.error);
