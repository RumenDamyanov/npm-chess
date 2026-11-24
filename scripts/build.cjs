#!/usr/bin/env node

/**
 * Dual ESM/CJS build.
 * tsc leaves extensionless relative imports and `@/` path aliases. Node can
 * load the published files only after those specifiers point at real files
 * and each dist folder has its own package.json type.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

const aliases = [
  ['@/engine/', 'engine/'],
  ['@/ai/', 'ai/'],
  ['@/api/', 'api/'],
  ['@/types/', 'types/'],
  ['@/utils/', 'utils/'],
  ['@/', ''],
];

console.log('Building @rumenx/chess\n');

fs.rmSync(dist, { recursive: true, force: true });

console.log('Building TypeScript declarations...');
execSync('tsc --project tsconfig.json --emitDeclarationOnly --outDir dist/types', {
  cwd: root,
  stdio: 'inherit',
});

console.log('Building ESM modules...');
execSync('tsc --project tsconfig.json --outDir dist/esm', {
  cwd: root,
  stdio: 'inherit',
});

console.log('Building CommonJS modules...');
execSync('tsc --project tsconfig.cjs.json', {
  cwd: root,
  stdio: 'inherit',
});

rewriteSpecifiers(path.join(dist, 'esm'), ['.js', '.d.ts'], path.join(dist, 'esm'));
rewriteSpecifiers(path.join(dist, 'cjs'), ['.js'], path.join(dist, 'cjs'));
rewriteSpecifiers(path.join(dist, 'types'), ['.d.ts'], path.join(dist, 'types'));

fs.writeFileSync(
  path.join(dist, 'esm', 'package.json'),
  `${JSON.stringify({ type: 'module' }, null, 2)}\n`
);
fs.writeFileSync(
  path.join(dist, 'cjs', 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`
);

console.log('Build completed.');

function rewriteSpecifiers(directory, extensions, distRoot) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      rewriteSpecifiers(filePath, extensions, distRoot);
      continue;
    }
    if (!extensions.some((extension) => entry.name.endsWith(extension))) {
      continue;
    }

    const updated = fs
      .readFileSync(filePath, 'utf8')
      .replace(
        /(\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])([^'"]+)\2/g,
        (match, prefix, quote, specifier) => {
          const resolved = resolveSpecifier(filePath, specifier, distRoot);
          if (!resolved || resolved === specifier) {
            return match;
          }
          return `${prefix}${quote}${resolved}${quote}`;
        }
      );
    fs.writeFileSync(filePath, updated);
  }
}

function resolveSpecifier(fromFile, specifier, distRoot) {
  if (specifier.startsWith('@/')) {
    const mapped = aliases.find(([prefix]) => specifier.startsWith(prefix));
    if (!mapped) {
      return null;
    }
    const rest = `${mapped[1]}${specifier.slice(mapped[0].length)}`;
    return relativeSpecifier(fromFile, path.join(distRoot, rest));
  }

  if (!specifier.startsWith('.')) {
    return null;
  }
  if (path.extname(specifier)) {
    return specifier;
  }
  return relativeSpecifier(fromFile, path.resolve(path.dirname(fromFile), specifier));
}

function relativeSpecifier(fromFile, absoluteTarget) {
  let specifier = path.relative(path.dirname(fromFile), absoluteTarget);
  specifier = specifier.split(path.sep).join('/');
  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`;
  }
  if (path.extname(specifier)) {
    return specifier;
  }
  if (fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory()) {
    return `${specifier}/index.js`;
  }
  return `${specifier}.js`;
}
