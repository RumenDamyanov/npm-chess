/**
 * PGN Parser and Generator Tests
 *
 * Tests for parsing and generating PGN notation.
 */

import { describe, expect, it } from '@jest/globals';
import { PgnParser } from '@/engine/pgn';
import { Game } from '@/engine/game';
import type { Pgn } from '@/types/index';

describe('PgnParser', () => {
  describe('parse', () => {
    it('should parse basic PGN with Seven Tag Roster', () => {
      const pgn: Pgn = `[Event "F/S Return Match"]
[Site "Belgrade, Serbia JUG"]
[Date "1992.11.04"]
[Round "29"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1/2-1/2`;

      const result = PgnParser.parse(pgn);

      expect(result.tags.Event).toBe('F/S Return Match');
      expect(result.tags.Site).toBe('Belgrade, Serbia JUG');
      expect(result.tags.Date).toBe('1992.11.04');
      expect(result.tags.Round).toBe('29');
      expect(result.tags.White).toBe('Fischer, Robert J.');
      expect(result.tags.Black).toBe('Spassky, Boris V.');
      expect(result.tags.Result).toBe('1/2-1/2');
      expect(result.result).toBe('1/2-1/2');
    });

    it('should parse moves correctly', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toHaveLength(6);
      expect(result.moves[0]).toBe('e4');
      expect(result.moves[1]).toBe('e5');
      expect(result.moves[2]).toBe('Nf3');
      expect(result.moves[3]).toBe('Nc6');
      expect(result.moves[4]).toBe('Bb5');
      expect(result.moves[5]).toBe('a6');
    });

    it('should parse moves with captures', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 d5 2. exd5 Qxd5 *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('exd5');
      expect(result.moves).toContain('Qxd5');
    });

    it('should parse castling moves', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O O-O *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('O-O');
      expect(result.moves.filter((m: string) => m === 'O-O')).toHaveLength(2);
    });

    it('should parse queenside castling', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. d4 d5 2. Nc3 Nc6 3. Bf4 Bf5 4. Qd2 Qd7 5. O-O-O O-O-O *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('O-O-O');
    });

    it('should parse moves with check indicators', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7+ *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('Qxf7+');
    });

    it('should parse moves with checkmate indicators', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('Qxf7#');
      expect(result.result).toBe('1-0');
    });

    it('should parse pawn promotion', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 d5 2. exd5 e5 3. d6 e4 4. d7 e3 5. d8=Q *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('d8=Q');
    });

    it('should handle comments in braces', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 {Best by test} e5 2. Nf3 {Developing} Nc6 *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toHaveLength(4);
      expect(result.moves[0]).toBe('e4');
      expect(result.moves[1]).toBe('e5');
    });

    it('should handle variations in parentheses', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 (1... c5 2. Nf3) 2. Nf3 Nc6 *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toHaveLength(4);
      expect(result.moves).not.toContain('c5');
    });

    it('should parse disambiguation moves', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Nbd4 *`;

      const result = PgnParser.parse(pgn);

      expect(result.moves).toContain('Nbd4');
    });

    it('should handle result variations', () => {
      const pgnWhiteWins: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Qh5 Ke7 3. Qxe5# 1-0`;

      const resultWhite = PgnParser.parse(pgnWhiteWins);
      expect(resultWhite.result).toBe('1-0');

      const pgnBlackWins: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "0-1"]

1. f3 e5 2. g4 Qh4# 0-1`;

      const resultBlack = PgnParser.parse(pgnBlackWins);
      expect(resultBlack.result).toBe('0-1');
    });
  });

  describe('generate', () => {
    it('should generate basic PGN from game', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });

      const pgn = PgnParser.generate(game, {
        Event: 'Test Event',
        White: 'Player 1',
        Black: 'Player 2',
      });

      expect(pgn).toContain('[Event "Test Event"]');
      expect(pgn).toContain('[White "Player 1"]');
      expect(pgn).toContain('[Black "Player 2"]');
      expect(pgn).toContain('1. e4 e5');
    });

    it('should generate default tags', () => {
      const game = new Game();
      const pgn = PgnParser.generate(game);

      expect(pgn).toContain('[Event "?"]');
      expect(pgn).toContain('[Site "?"]');
      expect(pgn).toContain('[Date "????.??.??"]');
      expect(pgn).toContain('[Round "?"]');
      expect(pgn).toContain('[White "?"]');
      expect(pgn).toContain('[Black "?"]');
    });

    it('should include result based on game status', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });

      const pgn = PgnParser.generate(game);

      expect(pgn).toContain('[Result "*"]');
      expect(pgn).toContain('*');
    });

    it('should wrap long move sequences', () => {
      const game = new Game();

      // Play several moves
      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
        { from: 'b8', to: 'c6' },
        { from: 'f1', to: 'c4' },
        { from: 'f8', to: 'c5' },
        { from: 'c2', to: 'c3' },
        { from: 'g8', to: 'f6' },
        { from: 'd2', to: 'd4' },
        { from: 'e5', to: 'd4' },
      ];

      for (const move of moves) {
        game.move(move);
      }

      const pgn = PgnParser.generate(game);

      // Should contain multiple lines of moves
      const lines = pgn.split('\n');
      const moveLines = lines.filter((line: string) => line.match(/^\d+\./));
      expect(moveLines.length).toBeGreaterThan(0);
    });
  });

  describe('applySanMove', () => {
    it('should apply simple pawn moves', () => {
      const game = new Game();
      const result = PgnParser.applySanMove(game, 'e4');

      expect(result).toBe(true);
      expect(game.getBoard().getPiece('e4')?.type).toBe('pawn');
    });

    it('should apply knight moves', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });

      const result = PgnParser.applySanMove(game, 'Nf3');

      expect(result).toBe(true);
      expect(game.getBoard().getPiece('f3')?.type).toBe('knight');
    });

    it('should apply castling kingside', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'b8', to: 'c6' });
      game.move({ from: 'f1', to: 'c4' });
      game.move({ from: 'g8', to: 'f6' });

      const result = PgnParser.applySanMove(game, 'O-O');

      expect(result).toBe(true);
      expect(game.getBoard().getPiece('g1')?.type).toBe('king');
      expect(game.getBoard().getPiece('f1')?.type).toBe('rook');
    });

    it('should apply captures', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'd7', to: 'd5' });

      const result = PgnParser.applySanMove(game, 'exd5');

      expect(result).toBe(true);
      expect(game.getBoard().getPiece('d5')?.type).toBe('pawn');
      expect(game.getBoard().getPiece('e4')).toBeNull();
    });

    it('should return false for invalid moves', () => {
      const game = new Game();
      const result = PgnParser.applySanMove(game, 'Nf6'); // Illegal move

      expect(result).toBe(false);
    });
  });

  describe('loadGame', () => {
    it('should load game from PGN', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 *`;

      const game = PgnParser.loadGame(pgn);

      expect(game).not.toBeNull();
      expect(game?.getHistory()).toHaveLength(4);
      expect(game?.getBoard().getPiece('e4')?.type).toBe('pawn');
      expect(game?.getBoard().getPiece('f3')?.type).toBe('knight');
    });

    it('should return null for invalid PGN', () => {
      const pgn: Pgn = `[Event "Test"]

1. e4 Nf6 2. Nxf6 *`; // Invalid: can't capture knight on f6

      const game = PgnParser.loadGame(pgn);

      expect(game).toBeNull();
    });

    it('should load Scholar\'s Mate', () => {
      const pgn: Pgn = `[Event "Scholar's Mate"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

      const game = PgnParser.loadGame(pgn);

      expect(game).not.toBeNull();
      expect(game?.getStatus()).toBe('checkmate');
    });
  });

  describe('validate', () => {
    it('should validate correct PGN', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 *`;

      expect(PgnParser.validate(pgn)).toBe(true);
    });

    it('should validate empty PGN', () => {
      const pgn: Pgn = '';

      expect(PgnParser.validate(pgn)).toBe(true);
    });

    it('should validate PGN without moves', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]`;

      expect(PgnParser.validate(pgn)).toBe(true);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain game state through generate/load cycle with single move', () => {
      const game1 = new Game();
      const move1 = game1.move({ from: 'e2', to: 'e4' });
      
      expect(move1?.san).toBe('e4');

      const pgn = PgnParser.generate(game1);
      const game2 = PgnParser.loadGame(pgn);

      expect(game2).not.toBeNull();
      expect(game2?.getHistory()).toHaveLength(1);
    });

    it('should maintain game state through generate/load cycle with two moves', () => {
      const game1 = new Game();
      game1.move({ from: 'e2', to: 'e4' });
      game1.move({ from: 'e7', to: 'e5' });

      const pgn = PgnParser.generate(game1);
      const game2 = PgnParser.loadGame(pgn);

      expect(game2).not.toBeNull();
      expect(game2?.getHistory()).toHaveLength(2);
    });

    it('should maintain game state through generate/load cycle with three moves', () => {
      const game1 = new Game();
      game1.move({ from: 'e2', to: 'e4' });
      game1.move({ from: 'e7', to: 'e5' });
      const move3 = game1.move({ from: 'g1', to: 'f3' });
      
      expect(move3?.san).toBe('Nf3');

      const pgn = PgnParser.generate(game1);
      const game2 = PgnParser.loadGame(pgn);

      expect(game2).not.toBeNull();
      expect(game2?.getHistory()).toHaveLength(3);
    });

    it('should maintain game state through generate/load cycle', () => {
      const game1 = new Game();
      game1.move({ from: 'e2', to: 'e4' });
      game1.move({ from: 'e7', to: 'e5' });
      game1.move({ from: 'g1', to: 'f3' });
      game1.move({ from: 'b8', to: 'c6' });

      const pgn = PgnParser.generate(game1);
      const game2 = PgnParser.loadGame(pgn);

      expect(game2).not.toBeNull();
      expect(game2?.getHistory()).toHaveLength(4);
      expect(game2?.getTurn()).toBe(game1.getTurn());

      // Verify board positions match
      const squares = ['e4', 'e5', 'f3', 'c6'];
      for (const square of squares) {
        const piece1 = game1.getBoard().getPiece(square);
        const piece2 = game2?.getBoard().getPiece(square);
        expect(piece2?.type).toBe(piece1?.type);
        expect(piece2?.color).toBe(piece1?.color);
      }
    });
  });
});
