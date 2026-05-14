const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');

// ─── Critical CSS: only above-the-fold sections ───────────────────────────
const CRITICAL_SOURCES = [
    'src/sections/common/variables.css',
    'src/sections/common/base.css',
    'src/sections/header/header.css',
    'src/sections/hero/hero.css',
];

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')   // remove comments
        .replace(/\s+/g, ' ')               // collapse whitespace
        .replace(/\s*([{}:;,>+~])\s*/g, '$1') // remove space around operators
        .replace(/;}/g, '}')               // remove trailing semicolons
        .trim();
}

const criticalCSS = CRITICAL_SOURCES
    .map(f => fs.readFileSync(path.resolve(__dirname, f), 'utf8'))
    .join('\n');
const criticalCSSMinified = minifyCSS(criticalCSS);
console.log(`Critical CSS: ${criticalCSSMinified.length} bytes (minified)`);

// ─── Helpers ──────────────────────────────────────────────────────────────

function fixCSSPaths(cssContent) {
    cssContent = cssContent.replace(/url\(['"]?\.\.\/(?:fonts|webfonts)\/([^'"]+)['"]?\)/g, 'url("/assets/fonts/$1")');
    cssContent = cssContent.replace(/url\(['"]?\.\.\/([^'"]+)['"]?\)/g, 'url("/$1")');
    cssContent = cssContent.replace(/url\(['"]?(?!\/|\w+:|data:)([^'"]+)['"]?\)/g, 'url("/assets/$1")');
    return cssContent;
}

function addFontDisplaySwap(cssContent) {
    return cssContent.replace(/@font-face\s*\{/g, '@font-face { font-display: swap; ');
}

// Convert a <link rel="stylesheet" href="..."> into an async-loading preload
function makeAsyncLink(href) {
    return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n    <noscript><link rel="stylesheet" href="${href}"></noscript>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────

console.log('\n--- Post-build Start ---');

if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory not found!');
    process.exit(1);
}

const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));
console.log(`Found ${htmlFiles.length} HTML files: ${htmlFiles.join(', ')}`);

htmlFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/g;
    const matches = content.match(cssRegex) || [];
    console.log(`\nProcessing ${file}: found ${matches.length} CSS links`);

    let fontPreloadUpdates = [];

    matches.forEach(fullTag => {
        const hrefMatch = fullTag.match(/href=["']([^"']+)["']/);
        if (!hrefMatch) return;
        const href = hrefMatch[1];
        if (!href.includes('/assets/')) return;

        const cssRelativePath = href.startsWith('/') ? href.slice(1) : href;
        const cssPath = path.resolve(distDir, cssRelativePath);
        const basename = path.basename(href);

        if (!fs.existsSync(cssPath)) {
            console.warn(`  Warning: not found ${cssPath}`);
            return;
        }

        // ── local-fonts: inline as before ──
        if (basename.startsWith('local-fonts')) {
            console.log(`  Inlining (fonts): ${basename}`);
            let css = fs.readFileSync(cssPath, 'utf8');
            css = fixCSSPaths(css);
            css = addFontDisplaySwap(css);
            content = content.replace(fullTag, `<style id="local-fonts">${css}</style>`);
            return;
        }

        // ── everything else: async load ──
        console.log(`  Async: ${basename}`);
        let css = fs.readFileSync(cssPath, 'utf8');
        css = addFontDisplaySwap(css);

        // Collect font URLs for preload URL correction
        const fontUrlRegex = /url\(["']?([^"')]+\.(?:woff2|woff|ttf|otf))["']?\)/g;
        let m;
        while ((m = fontUrlRegex.exec(css)) !== null) {
            fontPreloadUpdates.push({ hashedUrl: m[1], filename: path.basename(m[1]) });
        }

        content = content.replace(fullTag, makeAsyncLink(href));
    });

    // ── Update font preload hrefs to match hashed filenames ──
    fontPreloadUpdates.forEach(({ hashedUrl, filename }) => {
        const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
        const ext = filename.match(/\.[^.]+$/)?.[0] || '';
        const baseName = nameWithoutExt.replace(/-[a-zA-Z0-9]{8}$/, '');

        content = content.replace(/<link[^>]+>/g, tag => {
            if (tag.includes('rel="preload"') &&
                tag.includes('as="font"') &&
                tag.includes(baseName) &&
                tag.includes(ext)) {
                return tag.replace(/href=["'][^"']+["']/, `href="${hashedUrl}"`);
            }
            return tag;
        });
    });

    // ── Inject critical CSS (if not already present) ──
    if (!content.includes('id="critical-css"')) {
        const criticalTag = `<style id="critical-css">${criticalCSSMinified}</style>`;
        // Insert right before </head>
        content = content.replace('</head>', `    ${criticalTag}\n</head>`);
        console.log(`  Injected critical CSS (${criticalCSSMinified.length} bytes)`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`  Done: ${file}`);
});

console.log('\n--- Post-build Finished ---');
