#!/usr/bin/env node

/**
 * Install the packed tarball in a clean project and load both entry points.
 */

const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;
const packedName = execSync('npm pack --ignore-scripts', {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .pop();

if (!packedName || !/^[@\w.-]+\.tgz$/.test(packedName)) {
  throw new Error('npm pack did not report a tarball name');
}

const tarball = path.join(root, packedName);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-chess-smoke-'));

try {
  fs.writeFileSync(
    path.join(temp, 'package.json'),
    `${JSON.stringify({ name: 'chess-smoke', private: true, version: '1.0.0' }, null, 2)}\n`
  );
  execFileSync('npm', ['install', '--ignore-scripts', '--no-save', '--no-package-lock', tarball], {
    cwd: temp,
    stdio: 'inherit',
  });

  const checks = [
    "const assert = require('assert');",
    "const mod = require('@rumenx/chess');",
    "const engine = require('@rumenx/chess/engine');",
    "assert.strictEqual(typeof mod.Game, 'function');",
    "assert.strictEqual(typeof engine.Board, 'function');",
    `assert.strictEqual(mod.VERSION, ${JSON.stringify(version)});`,
    "console.log('cjs', mod.VERSION);",
    '',
  ].join('\n');
  fs.writeFileSync(path.join(temp, 'check-cjs.cjs'), checks);
  fs.writeFileSync(
    path.join(temp, 'check-esm.mjs'),
    [
      "import assert from 'node:assert';",
      "import * as mod from '@rumenx/chess';",
      "import * as engine from '@rumenx/chess/engine';",
      "assert.strictEqual(typeof mod.Game, 'function');",
      "assert.strictEqual(typeof engine.Board, 'function');",
      `assert.strictEqual(mod.VERSION, ${JSON.stringify(version)});`,
      "console.log('esm', mod.VERSION);",
      '',
    ].join('\n')
  );

  execFileSync('node', ['check-cjs.cjs'], { cwd: temp, stdio: 'inherit' });
  execFileSync('node', ['check-esm.mjs'], { cwd: temp, stdio: 'inherit' });
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
  fs.rmSync(tarball, { force: true });
}
