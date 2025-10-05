/**
 * Type Definitions
 *
 * TypeScript type definitions for the chess engine.
 *
 * @module types
 */

/**
 * Chess piece colors
 */
export type Color = 'white' | 'black';

/**
 * Chess piece types
 */
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

/**
 * Chess piece
 */
export interface Piece {
  type: PieceType;
  color: Color;
}

/**
 * Chess square notation (a1-h8)
 */
export type Square = string;

/**
 * Board position (0-63 for internal use)
 */
export type Position = number;

/**
 * File letters (a-h)
 */
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

/**
 * Rank numbers (1-8)
 */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Chess move with full details
 */
export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castling?: 'kingside' | 'queenside';
  enPassant?: boolean;
  san?: string; // Standard Algebraic Notation (e.g., "Nf3", "e4")
  check?: boolean;
  checkmate?: boolean;
}

/**
 * Move validation result
 */
export interface MoveValidation {
  valid: boolean;
  error?: string;
}

/**
 * Game status
 */
export type GameStatus =
  | 'active'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'fifty_move_rule';

/**
 * Game state
 */
export interface GameState {
  board: (Piece | null)[][];
  turn: Color;
  status: GameStatus;
  moveHistory: Move[];
  halfMoveClock: number;
  fullMoveNumber: number;
  castlingRights: CastlingRights;
  enPassantSquare: Square | null;
}

/**
 * Castling rights
 */
export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

/**
 * FEN string
 */
export type Fen = string;

/**
 * PGN string
 */
export type Pgn = string;

/**
 * Coordinates for a square (row, col)
 */
export interface Coordinates {
  row: number; // 0-7 (rank 1-8)
  col: number; // 0-7 (file a-h)
}

/**
 * Move options for game.move()
 */
export interface MoveOptions {
  from: Square;
  to: Square;
  promotion?: PieceType;
}

/**
 * Game configuration options
 */
export interface GameConfig {
  fen?: Fen;
  validateMoves?: boolean;
}

// Re-export all types
export // Core types are already exported above
 type {};
