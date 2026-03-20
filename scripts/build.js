/**
 * Build script for the extension using esbuild
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Ensure build directory exists
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
}

if (!fs.existsSync('build/icons')) {
  fs.mkdirSync('build/icons', { recursive: true });
}

// Build configuration
const buildConfig = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch,
  target: 'es2020',
  format: 'iife',
  logLevel: 'info',
};

// Build configurations
const builds = [
  {
    ...buildConfig,
    entryPoints: ['src/background/index.ts'],
    outfile: 'build/background.js',
  },
  {
    ...buildConfig,
    entryPoints: ['src/content/index.ts'],
    outfile: 'build/content.js',
  },
  {
    ...buildConfig,
    entryPoints: ['src/popup/popup.ts'],
    outfile: 'build/popup.js',
  },
];

// Build all entry points
async function buildAll() {
  if (isWatch) {
    // Use context API for watch mode
    const contexts = await Promise.all(
      builds.map((config) => esbuild.context(config))
    );
    await Promise.all(contexts.map((ctx) => ctx.watch()));
  } else {
    // Regular build
    await Promise.all(
      builds.map((config) => esbuild.build(config))
    );
  }
}

// Copy static files
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

function copyStaticFiles() {
  // Copy manifest
  copyFile('public/manifest.json', 'build/manifest.json');

  // Copy popup HTML and CSS
  copyFile('src/popup/popup.html', 'build/popup.html');
  copyFile('src/popup/popup.css', 'build/popup.css');

  // Copy icon files
  const iconSizes = [16, 48, 128];
  iconSizes.forEach(size => {
    const srcPath = `public/icons/icon${size}.svg`;
    const destPath = `build/icons/icon${size}.svg`;
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    } else {
      console.warn(`Warning: Icon file not found: ${srcPath}`);
      console.log(`Run: node generate-icons.js`);
    }
  });
}

// Run build
buildAll()
  .then(() => {
    copyStaticFiles();
    console.log('\n✓ Build complete!');
    if (isWatch) {
      console.log('Watching for changes...\n');
    }
  })
  .catch(() => process.exit(1));
