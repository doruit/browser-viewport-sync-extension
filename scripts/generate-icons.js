/**
 * Generate simple placeholder icons for the extension
 * Run with: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for a simple sync icon
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3498db"/>
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Desktop icon -->
    <rect x="${-size*0.35}" y="${-size*0.25}" width="${size*0.3}" height="${size*0.2}" fill="white" stroke="white" stroke-width="${size*0.02}"/>
    <!-- Mobile icon -->
    <rect x="${size*0.05}" y="${-size*0.25}" width="${size*0.15}" height="${size*0.25}" fill="white" stroke="white" stroke-width="${size*0.02}" rx="${size*0.01}"/>
    <!-- Sync arrows -->
    <path d="M ${-size*0.15} ${size*0.1} L ${size*0.05} ${size*0.1}" stroke="white" stroke-width="${size*0.03}" fill="none" marker-end="url(#arrow)"/>
    <path d="M ${size*0.05} ${size*0.2} L ${-size*0.15} ${size*0.2}" stroke="white" stroke-width="${size*0.03}" fill="none" marker-end="url(#arrow2)"/>
  </g>
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="white" />
    </marker>
    <marker id="arrow2" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M9,0 L9,6 L0,3 z" fill="white" />
    </marker>
  </defs>
</svg>`;
}

// Generate icons of different sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`Generated ${filename}`);
});

console.log('\nℹ️  SVG icons generated. To convert to PNG:');
console.log('   Install ImageMagick or use an online converter');
console.log('   Or keep the SVG files and update manifest.json to use .svg instead of .png');
