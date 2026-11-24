/**
 * Basic sanity test to verify test setup
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from '@jest/globals';
import { VERSION } from '../../src/index';

const packageVersion = JSON.parse(
  readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
).version;

describe('npm-chess', () => {
  describe('package setup', () => {
    it('should be able to run tests', () => {
      expect(true).toBe(true);
    });

    it('should export the package version', () => {
      expect(VERSION).toBe(packageVersion);
      expect(typeof VERSION).toBe('string');
    });
  });
});
