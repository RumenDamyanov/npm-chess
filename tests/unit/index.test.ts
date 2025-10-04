/**
 * Basic sanity test to verify test setup
 */

describe('npm-chess', () => {
  describe('package setup', () => {
    it('should be able to run tests', () => {
      expect(true).toBe(true);
    });

    it('should have VERSION constant', () => {
      const VERSION = '0.1.0';
      expect(VERSION).toBe('0.1.0');
    });

    it('should export VERSION as a string', () => {
      const VERSION = '0.1.0';
      expect(typeof VERSION).toBe('string');
    });
  });
});
