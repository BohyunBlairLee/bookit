import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const svgBuffer = readFileSync('./resources/icon.png.svg');

// Android icon sizes
const androidSizes = [
  { size: 36, folder: 'drawable-ldpi' },
  { size: 48, folder: 'drawable-mdpi' },
  { size: 72, folder: 'drawable-hdpi' },
  { size: 96, folder: 'drawable-xhdpi' },
  { size: 144, folder: 'drawable-xxhdpi' },
  { size: 192, folder: 'drawable-xxxhdpi' },
];

// iOS icon sizes
const iosSizes = [
  { size: 20, scale: 1, name: 'AppIcon-20x20@1x.png' },
  { size: 40, scale: 2, name: 'AppIcon-20x20@2x.png' },
  { size: 60, scale: 3, name: 'AppIcon-20x20@3x.png' },
  { size: 29, scale: 1, name: 'AppIcon-29x29@1x.png' },
  { size: 58, scale: 2, name: 'AppIcon-29x29@2x.png' },
  { size: 87, scale: 3, name: 'AppIcon-29x29@3x.png' },
  { size: 40, scale: 1, name: 'AppIcon-40x40@1x.png' },
  { size: 80, scale: 2, name: 'AppIcon-40x40@2x.png' },
  { size: 120, scale: 3, name: 'AppIcon-40x40@3x.png' },
  { size: 76, scale: 1, name: 'AppIcon-76x76@1x.png' },
  { size: 152, scale: 2, name: 'AppIcon-76x76@2x.png' },
  { size: 167, scale: 2, name: 'AppIcon-83.5x83.5@2x.png' },
  { size: 1024, scale: 1, name: 'AppIcon-1024x1024@1x.png' },
];

async function generateAndroidIcons() {
  console.log('Generating Android icons...');

  for (const { size, folder } of androidSizes) {
    const dir = `./android/app/src/main/res/${folder}`;
    mkdirSync(dir, { recursive: true });

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(dir, 'ic_launcher.png'));

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(dir, 'ic_launcher_round.png'));

    console.log(`Generated ${folder}/ic_launcher.png (${size}x${size})`);
  }
}

async function generateiOSIcons() {
  console.log('\nGenerating iOS icons...');

  const dir = './ios/App/App/Assets.xcassets/AppIcon.appiconset';
  mkdirSync(dir, { recursive: true });

  for (const { size, name } of iosSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(dir, name));

    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Generate Contents.json for iOS
  const contents = {
    images: iosSizes.map(({ size, scale, name }) => ({
      filename: name,
      idiom: size >= 76 ? 'ipad' : 'iphone',
      scale: `${scale}x`,
      size: `${size / scale}x${size / scale}`
    })),
    info: {
      author: 'capacitor',
      version: 1
    }
  };

  await import('fs').then(fs =>
    fs.promises.writeFile(
      join(dir, 'Contents.json'),
      JSON.stringify(contents, null, 2)
    )
  );

  console.log('Generated Contents.json');
}

async function generateSplashScreens() {
  console.log('\nGenerating splash screens...');

  // Android splash
  const androidSplashDir = './android/app/src/main/res/drawable';
  mkdirSync(androidSplashDir, { recursive: true });

  await sharp(svgBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(join(androidSplashDir, 'splash.png'));

  console.log('Generated Android splash screen');

  // iOS splash
  const iosSplashDir = './ios/App/App/Assets.xcassets/Splash.imageset';
  mkdirSync(iosSplashDir, { recursive: true });

  await sharp(svgBuffer)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(join(iosSplashDir, 'splash.png'));

  const splashContents = {
    images: [
      {
        filename: 'splash.png',
        idiom: 'universal',
        scale: '1x'
      }
    ],
    info: {
      author: 'capacitor',
      version: 1
    }
  };

  await import('fs').then(fs =>
    fs.promises.writeFile(
      join(iosSplashDir, 'Contents.json'),
      JSON.stringify(splashContents, null, 2)
    )
  );

  console.log('Generated iOS splash screen');
}

async function main() {
  try {
    await generateAndroidIcons();
    await generateiOSIcons();
    await generateSplashScreens();
    console.log('\n✅ All icons and splash screens generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
