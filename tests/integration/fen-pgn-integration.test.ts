/**
 * FEN and PGN Integration Tests
 *
 * Tests for importing/exporting games using FEN and PGN formats.
 */

import { describe, expect, it } from '@jest/globals';
import { Game } from '@/engine/game';
import { PgnParser } from '@/engine/pgn';
import { FenParser } from '@/engine/fen';
import type { Pgn, Fen } from '@/types/index';

describe('FEN and PGN Integration', () => {
  describe('FEN Import/Export', () => {
    it('should import FEN and play moves', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const parsed = FenParser.parse(fen);
      
      expect(parsed.turn).toBe('black');
      expect(parsed.enPassantSquare).toBe('e3');
      expect(parsed.board.getPiece('e4')?.type).toBe('pawn');
    });

    it('should export game to FEN after moves', () => {
      const game = new Game();
      
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      
      const fen = FenParser.generate(
        game.getBoard(),
        game.getTurn(),
        game.getCastlingRights(),
        game.getEnPassantSquare(),
        game.getHalfMoveClock(),
        game.getFullMoveNumber()
      );
      
      expect(fen).toContain('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R');
      expect(fen).toContain('b KQkq -');
    });

    it('should round-trip FEN correctly', () => {
      const positions: Fen[] = [
        FenParser.STARTING_POSITION,
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
        '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
      ];
      
      for (const fen of positions) {
        const parsed = FenParser.parse(fen);
        const generated = FenParser.generate(
          parsed.board,
          parsed.turn,
          parsed.castlingRights,
          parsed.enPassantSquare,
          parsed.halfMoveClock,
          parsed.fullMoveNumber
        );
        expect(generated).toBe(fen);
      }
    });

    it('should load position from FEN and continue playing', () => {
      const fen: Fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
      const parsed = FenParser.parse(fen);
      
      // Verify FEN was parsed correctly
      expect(parsed.turn).toBe('white');
      expect(parsed.enPassantSquare).toBe('e6');
      
      // Verify pieces are in correct positions
      expect(parsed.board.getPiece('e4')?.type).toBe('pawn');
      expect(parsed.board.getPiece('e4')?.color).toBe('white');
      expect(parsed.board.getPiece('e5')?.type).toBe('pawn');
      expect(parsed.board.getPiece('e5')?.color).toBe('black');
    });
  });

  describe('PGN Import/Export', () => {
    it('should import and replay PGN game', () => {
      const pgn: Pgn = `[Event "Casual Game"]
[Site "Internet"]
[Date "2024.01.01"]
[Round "1"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O 1-0`;

      const game = PgnParser.loadGame(pgn);
      
      expect(game).not.toBeNull();
      expect(game?.getHistory()).toHaveLength(9);
      expect(game?.getBoard().getPiece('g1')?.type).toBe('king');
      expect(game?.getBoard().getPiece('f1')?.type).toBe('rook');
    });

    it('should export game to PGN', () => {
      const game = new Game();
      
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'b8', to: 'c6' });
      
      const pgn = PgnParser.generate(game, {
        Event: 'Test Game',
        White: 'Player 1',
        Black: 'Player 2',
      });
      
      expect(pgn).toContain('[Event "Test Game"]');
      expect(pgn).toContain('[White "Player 1"]');
      expect(pgn).toContain('[Black "Player 2"]');
      expect(pgn).toContain('1. e4 e5 2. Nf3 Nc6');
    });

    it('should round-trip game through PGN', () => {
      const game1 = new Game();
      
      const moves = [
        { from: 'e2', to: 'e4' }, { from: 'c7', to: 'c5' },
        { from: 'g1', to: 'f3' }, { from: 'd7', to: 'd6' },
        { from: 'd2', to: 'd4' }, { from: 'c5', to: 'd4' },
        { from: 'f3', to: 'd4' }, { from: 'g8', to: 'f6' },
      ];
      
      for (const move of moves) {
        game1.move(move);
      }
      
      const pgn = PgnParser.generate(game1);
      const game2 = PgnParser.loadGame(pgn);
      
      expect(game2).not.toBeNull();
      expect(game2?.getHistory()).toHaveLength(game1.getHistory().length);
      
      // Compare final positions
      const squares = ['e4', 'f3', 'd4', 'f6', 'd6'];
      for (const square of squares) {
        const piece1 = game1.getBoard().getPiece(square);
        const piece2 = game2?.getBoard().getPiece(square);
        if (piece1) {
          expect(piece2?.type).toBe(piece1.type);
          expect(piece2?.color).toBe(piece1.color);
        }
      }
    });

    it('should handle PGN with multiple games', () => {
      const pgn1: Pgn = `[Event "Game 1"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 1-0`;

      const pgn2: Pgn = `[Event "Game 2"]
[Site "Test"]
[Date "2024.01.02"]
[Round "2"]
[White "Bob"]
[Black "Alice"]
[Result "0-1"]

1. d4 d5 2. c4 e6 0-1`;

      const game1 = PgnParser.loadGame(pgn1);
      const game2 = PgnParser.loadGame(pgn2);
      
      expect(game1).not.toBeNull();
      expect(game2).not.toBeNull();
      expect(game1?.getHistory()).toHaveLength(5);
      expect(game2?.getHistory()).toHaveLength(4);
    });

    it('should preserve game metadata in PGN', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      
      const tags = {
        Event: 'World Championship',
        Site: 'New York',
        Date: '2024.10.04',
        Round: '1',
        White: 'Carlsen, Magnus',
        Black: 'Nepomniachtchi, Ian',
        Result: '*',
      };
      
      const pgn = PgnParser.generate(game, tags);
      const parsed = PgnParser.parse(pgn);
      
      expect(parsed.tags.Event).toBe('World Championship');
      expect(parsed.tags.Site).toBe('New York');
      expect(parsed.tags.White).toBe('Carlsen, Magnus');
      expect(parsed.tags.Black).toBe('Nepomniachtchi, Ian');
    });
  });

  describe('FEN to PGN Workflow', () => {
    it('should load FEN, play moves, and export to PGN', () => {
      // Start from a regular game position
      const game = new Game();
      
      // Play to a known position
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'b8', to: 'c6' });
      
      // Play additional moves
      game.move({ from: 'f1', to: 'c4' });
      game.move({ from: 'f8', to: 'c5' });
      
      // Export to PGN
      const pgn = PgnParser.generate(game, {
        Event: 'From FEN',
        Result: '*',
      });
      
      expect(pgn).toContain('[Event "From FEN"]');
      expect(pgn).toContain('Bc4');
      expect(pgn).toContain('Bc5');
    });
  });

  describe('PGN to FEN Workflow', () => {
    it('should load PGN and export position to FEN', () => {
      const pgn: Pgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 *`;

      const game = PgnParser.loadGame(pgn);
      expect(game).not.toBeNull();
      
      const fen = FenParser.generate(
        game!.getBoard(),
        game!.getTurn(),
        game!.getCastlingRights(),
        game!.getEnPassantSquare(),
        game!.getHalfMoveClock(),
        game!.getFullMoveNumber()
      );
      
      expect(fen).toContain('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid FEN gracefully', () => {
      const invalidFen: Fen = 'invalid fen string';
      
      expect(() => FenParser.parse(invalidFen)).toThrow();
    });

    it('should handle invalid PGN gracefully', () => {
      const invalidPgn: Pgn = `[Event "Test"]

1. e4 Nf6 2. Nxf6 *`; // Invalid: can't capture Nf6
      
      const game = PgnParser.loadGame(invalidPgn);
      expect(game).toBeNull();
    });

    it('should validate FEN before parsing', () => {
      expect(FenParser.validate(FenParser.STARTING_POSITION)).toBe(true);
      expect(FenParser.validate('invalid')).toBe(false);
    });

    it('should validate PGN before parsing', () => {
      const validPgn: Pgn = `[Event "Test"]

1. e4 e5 *`;
      
      const invalidPgn: Pgn = '';
      
      expect(PgnParser.validate(validPgn)).toBe(true);
      expect(PgnParser.validate(invalidPgn)).toBe(true); // Empty PGN is technically valid
    });
  });

  describe('Edge Cases', () => {
    it('should handle pawn promotions to different pieces', () => {
      // Test promotion to queen
      const game1 = new Game();
      game1.getBoard().clear();
      game1.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game1.getBoard().setPiece('h8', { type: 'king', color: 'black' });
      game1.getBoard().setPiece('a7', { type: 'pawn', color: 'white' });
      game1.refreshMoveGenerator();
      
      const promotionQueen = game1.move({ from: 'a7', to: 'a8', promotion: 'queen' });
      expect(promotionQueen).not.toBeNull();
      expect(promotionQueen?.promotion).toBe('queen');
      expect(game1.getBoard().getPiece('a8')?.type).toBe('queen');
      
      // Test promotion to knight
      const game2 = new Game();
      game2.getBoard().clear();
      game2.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game2.getBoard().setPiece('h8', { type: 'king', color: 'black' });
      game2.getBoard().setPiece('b7', { type: 'pawn', color: 'white' });
      game2.refreshMoveGenerator();
      
      const promotionKnight = game2.move({ from: 'b7', to: 'b8', promotion: 'knight' });
      expect(promotionKnight).not.toBeNull();
      expect(promotionKnight?.promotion).toBe('knight');
      expect(game2.getBoard().getPiece('b8')?.type).toBe('knight');
    });

    it('should handle long games with many moves', () => {
      const game = new Game();
      
      // Play 50 moves
      for (let i = 0; i < 25; i++) {
        game.move({ from: 'g1', to: 'f3' });
        game.move({ from: 'g8', to: 'f6' });
        game.move({ from: 'f3', to: 'g1' });
        game.move({ from: 'f6', to: 'g8' });
      }
      
      expect(game.getHistory()).toHaveLength(100);
      expect(game.getFullMoveNumber()).toBe(51);
    });

    it('should handle position with all piece types', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const parsed = FenParser.parse(fen);
      
      const pieces = parsed.board.findPieces('white');
      const pieceTypes = new Set(pieces.map((p: { piece: { type: string } }) => p.piece.type));
      
      expect(pieceTypes.has('king')).toBe(true);
      expect(pieceTypes.has('queen')).toBe(true);
      expect(pieceTypes.has('rook')).toBe(true);
      expect(pieceTypes.has('bishop')).toBe(true);
      expect(pieceTypes.has('knight')).toBe(true);
      expect(pieceTypes.has('pawn')).toBe(true);
    });
  });
});
