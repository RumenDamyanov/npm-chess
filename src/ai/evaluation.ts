/**
 * Position Evaluation Functions
 *
 * Evaluates chess positions for AI move selection.
 * Returns scores from white's perspective (positive = white advantage).
 *
 * @module ai/evaluation
 */

import type { Color, Piece, PieceType, Square } from '@/types/index';
import type { Board } from '@/engine/board';

/**
 * Piece values in centipawns (1 pawn = 100)
 */
export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000, // King is invaluable
};

/**
 * Piece-Square Tables
 *
 * Values for piece positioning. Higher values indicate better squares.
 * Tables are from white's perspective (a1 = bottom-left).
 */

// Pawn piece-square table
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Knight piece-square table
const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

// Bishop piece-square table
const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

// Rook piece-square table
const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

// Queen piece-square table
const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

// King piece-square table (middlegame)
const KING_MIDDLE_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

// King piece-square table (endgame)
const KING_END_TABLE = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

/**
 * Piece-square table mapping
 */
const PIECE_TABLES: Record<PieceType, number[][]> = {
  pawn: PAWN_TABLE,
  knight: KNIGHT_TABLE,
  bishop: BISHOP_TABLE,
  rook: ROOK_TABLE,
  queen: QUEEN_TABLE,
  king: KING_MIDDLE_TABLE, // We'll switch to endgame table when appropriate
};

/**
 * Evaluate material balance
 *
 * @param board - Chess board
 * @param color - Color to evaluate for
 * @returns Material score (positive = advantage)
 */
export function evaluateMaterial(board: Board, color: Color): number {
  const pieces = board.findPieces(color);
  const opponentPieces = board.findPieces(color === 'white' ? 'black' : 'white');

  let score = 0;

  // Count our material
  for (const { piece } of pieces) {
    score += PIECE_VALUES[piece.type];
  }

  // Subtract opponent material
  for (const { piece } of opponentPieces) {
    score -= PIECE_VALUES[piece.type];
  }

  return score;
}

/**
 * Get piece-square table value for a piece
 *
 * @param piece - Chess piece
 * @param square - Square location
 * @param isEndgame - Whether position is endgame
 * @returns Positional value
 */
export function getPieceSquareValue(
  piece: Piece,
  square: Square,
  isEndgame: boolean = false
): number {
  const coords = squareToCoords(square);
  if (!coords) return 0;

  let { row } = coords;
  const { col } = coords;

  // Flip table for black pieces (they play from top)
  if (piece.color === 'black') {
    row = 7 - row;
  }

  // Use endgame king table if appropriate
  const table = piece.type === 'king' && isEndgame ? KING_END_TABLE : PIECE_TABLES[piece.type];

  const value = table[row]?.[col] ?? 0;

  // Negate for black pieces
  return piece.color === 'white' ? value : -value;
}

/**
 * Evaluate piece positioning
 *
 * @param board - Chess board
 * @param isEndgame - Whether position is endgame
 * @returns Positional score
 */
export function evaluatePosition(board: Board, isEndgame: boolean = false): number {
  let score = 0;

  // Evaluate all pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = coordsToSquare(row, col);
      if (!square) continue;

      const piece = board.getPiece(square);
      if (piece) {
        score += getPieceSquareValue(piece, square, isEndgame);
      }
    }
  }

  return score;
}

/**
 * Determine if position is endgame
 *
 * Endgame is when:
 * - Both sides have no queens, OR
 * - Every side which has a queen has additionally no other pieces or one minor piece maximum
 *
 * @param board - Chess board
 * @returns True if endgame
 */
export function isEndgame(board: Board): boolean {
  const whitePieces = board.findPieces('white');
  const blackPieces = board.findPieces('black');

  let whiteQueens = 0;
  let whiteMinor = 0; // Knights and bishops
  let whiteRooks = 0;

  let blackQueens = 0;
  let blackMinor = 0;
  let blackRooks = 0;

  for (const { piece } of whitePieces) {
    if (piece.type === 'queen') whiteQueens++;
    else if (piece.type === 'knight' || piece.type === 'bishop') whiteMinor++;
    else if (piece.type === 'rook') whiteRooks++;
  }

  for (const { piece } of blackPieces) {
    if (piece.type === 'queen') blackQueens++;
    else if (piece.type === 'knight' || piece.type === 'bishop') blackMinor++;
    else if (piece.type === 'rook') blackRooks++;
  }

  // No queens on either side
  if (whiteQueens === 0 && blackQueens === 0) {
    return true;
  }

  // Queen with minimal material
  if (
    whiteQueens > 0 &&
    whiteMinor + whiteRooks <= 1 &&
    blackQueens > 0 &&
    blackMinor + blackRooks <= 1
  ) {
    return true;
  }

  return false;
}

/**
 * Evaluate complete position
 *
 * @param board - Chess board
 * @param color - Color to evaluate for
 * @returns Total evaluation score
 */
export function evaluateBoard(board: Board, color: Color): number {
  const endgame = isEndgame(board);

  // Material evaluation
  const materialScore = evaluateMaterial(board, color);

  // Positional evaluation
  const positionScore = evaluatePosition(board, endgame);

  // Total score (material is more important than position)
  return materialScore + positionScore * 0.1;
}

/**
 * Helper: Convert square to coordinates
 */
function squareToCoords(square: Square): { row: number; col: number } | null {
  if (!square?.length || square.length !== 2) return null;

  const file = square.charAt(0);
  const rank = square.charAt(1);

  const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = parseInt(rank, 10) - 1;

  if (col < 0 || col > 7 || row < 0 || row > 7 || isNaN(row)) {
    return null;
  }

  return { row, col };
}

/**
 * Helper: Convert coordinates to square
 */
function coordsToSquare(row: number, col: number): Square | null {
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;

  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = (row + 1).toString();

  return file + rank;
}
