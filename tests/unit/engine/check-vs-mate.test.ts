/**
 * Regression test: Bb5+ is check, NOT checkmate
 *
 * Position after 1. d4 Nh6 2. e3 c5 3. f4 e6 4. Nf3 Qb6 5. g4 Qxb2
 * 6. Bxb2 d5 7. Ne5 f5 8. gxf5 Nf7 9. Nxf7 e5 10. Nxh8 Kd7
 * 11. fxe5 Bd6 12. exd6 Ke8 13. Bb5+
 *
 * Black king on e8 is in check from Bb5 but has escapes (Kd8, Kf8)
 * and blocks (Bd7, Nc6, Nd7, etc.) — this is NOT checkmate.
 */
import { Game } from '@/engine/game';

describe('check vs checkmate regression', () => {
  const GAME_MOVES: [string, string][] = [
    ['d2', 'd4'],
    ['g8', 'h6'], // 1. d4 Nh6
    ['e2', 'e3'],
    ['c7', 'c5'], // 2. e3 c5
    ['f2', 'f4'],
    ['e7', 'e6'], // 3. f4 e6
    ['g1', 'f3'],
    ['d8', 'b6'], // 4. Nf3 Qb6
    ['g2', 'g4'],
    ['b6', 'b2'], // 5. g4 Qxb2
    ['c1', 'b2'],
    ['d7', 'd5'], // 6. Bxb2 d5
    ['f3', 'e5'],
    ['f7', 'f5'], // 7. Ne5 f5
    ['g4', 'f5'],
    ['h6', 'f7'], // 8. gxf5 Nf7
    ['e5', 'f7'],
    ['e6', 'e5'], // 9. Nxf7 e5
    ['f7', 'h8'],
    ['e8', 'd7'], // 10. Nxh8 Kd7
    ['f4', 'e5'],
    ['f8', 'd6'], // 11. fxe5 Bd6
    ['e5', 'd6'],
    ['d7', 'e8'], // 12. exd6 Ke8
    ['f1', 'b5'], // 13. Bb5+
  ];

  function playMoves(game: Game): void {
    for (const [from, to] of GAME_MOVES) {
      const result = game.move({ from, to });
      expect(result).not.toBeNull();
    }
  }

  it('Bb5+ should be check, not checkmate', () => {
    const game = new Game();
    playMoves(game);

    expect(game.getStatus()).toBe('check');
    expect(game.isGameOver()).toBe(false);
    expect(game.getTurn()).toBe('black');

    const legalMoves = game.getLegalMoves();
    expect(legalMoves.length).toBeGreaterThan(0);
  });

  it('check status should not be treated as game over', () => {
    const game = new Game();
    playMoves(game);

    const fen = game.getFen();
    const game2 = new Game();
    game2.loadFen(fen);

    expect(game2.getStatus()).not.toBe('checkmate');
    expect(game2.isGameOver()).toBe(false);
    expect(game2.getLegalMoves().length).toBeGreaterThan(0);
  });

  it('actual checkmate should still be detected', () => {
    const game = new Game();
    // Scholar's mate: 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    const scholarMate: [string, string][] = [
      ['e2', 'e4'],
      ['e7', 'e5'],
      ['f1', 'c4'],
      ['b8', 'c6'],
      ['d1', 'h5'],
      ['g8', 'f6'],
      ['h5', 'f7'],
    ];
    for (const [from, to] of scholarMate) {
      const result = game.move({ from, to });
      expect(result).not.toBeNull();
    }

    expect(game.getStatus()).toBe('checkmate');
    expect(game.isGameOver()).toBe(true);
    expect(game.getLegalMoves().length).toBe(0);
  });
});
