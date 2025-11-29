/**
 * Piece Movement Patterns
 *
 * Defines movement patterns and rules for each chess piece type.
 *
 * @module engine/pieces
 */

import type { PieceType, Color, Coordinates } from '@/types/index';
import type { Board } from './board';

/**
 * Direction vectors for piece movement
 * [rowDelta, colDelta]
 */
const DIRECTIONS = {
  // Orthogonal (Rook-like)
  ORTHOGONAL: [
    [-1, 0], // North
    [1, 0], // South
    [0, -1], // West
    [0, 1], // East
  ],
  // Diagonal (Bishop-like)
  DIAGONAL: [
    [-1, -1], // Northwest
    [-1, 1], // Northeast
    [1, -1], // Southwest
    [1, 1], // Southeast
  ],
  // Knight moves
  KNIGHT: [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ],
  // King/Queen (all 8 directions)
  ALL: [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ],
} as const;

/**
 * Get pseudo-legal moves for a piece
 * (Moves that follow piece movement rules but may leave king in check)
 *
 * @param board - The chess board
 * @param from - Starting coordinates
 * @param pieceType - Type of piece
 * @param color - Color of piece
 * @returns Array of destination coordinates
 */
export function getPseudoLegalMoves(
  board: Board,
  from: Coordinates,
  pieceType: PieceType,
  color: Color
): Coordinates[] {
  switch (pieceType) {
    case 'pawn':
      return getPawnMoves(board, from, color);
    case 'knight':
      return getKnightMoves(board, from, color);
    case 'bishop':
      return getBishopMoves(board, from, color);
    case 'rook':
      return getRookMoves(board, from, color);
    case 'queen':
      return getQueenMoves(board, from, color);
    case 'king':
      return getKingMoves(board, from, color);
    default:
      return [];
  }
}

/**
 * Get pawn moves
 */
function getPawnMoves(board: Board, from: Coordinates, color: Color): Coordinates[] {
  const moves: Coordinates[] = [];
  const direction = color === 'white' ? 1 : -1; // White moves up (+row), black moves down (-row)
  const startRank = color === 'white' ? 1 : 6;
  const { row, col } = from;

  // Forward one square
  const oneForward = { row: row + direction, col };
  if (
    board.isValidCoords(oneForward.row, oneForward.col) &&
    board.getPieceAt(oneForward.row, oneForward.col) === null
  ) {
    moves.push(oneForward);

    // Forward two squares (from starting position)
    if (row === startRank) {
      const twoForward = { row: row + direction * 2, col };
      if (
        board.isValidCoords(twoForward.row, twoForward.col) &&
        board.getPieceAt(twoForward.row, twoForward.col) === null
      ) {
        moves.push(twoForward);
      }
    }
  }

  // Diagonal captures
  const captureOffsets = [-1, 1];
  for (const offset of captureOffsets) {
    const captureSquare = { row: row + direction, col: col + offset };
    if (board.isValidCoords(captureSquare.row, captureSquare.col)) {
      const targetPiece = board.getPieceAt(captureSquare.row, captureSquare.col);
      // Can capture enemy piece (or en passant, handled separately)
      if (targetPiece && targetPiece.color !== color) {
        moves.push(captureSquare);
      }
    }
  }

  return moves;
}

/**
 * Get knight moves
 */
function getKnightMoves(board: Board, from: Coordinates, color: Color): Coordinates[] {
  return getJumpMoves(board, from, color, DIRECTIONS.KNIGHT);
}

/**
 * Get bishop moves
 */
function getBishopMoves(board: Board, from: Coordinates, color: Color): Coordinates[] {
  return getSlidingMoves(board, from, color, DIRECTIONS.DIAGONAL);
}

/**
 * Get rook moves
 */
function getRookMoves(board: Board, from: Coordinates, color: Color): Coordinates[] {
  return getSlidingMoves(board, from, color, DIRECTIONS.ORTHOGONAL);
}

/**
 * Get queen moves
 */
function getQueenMoves(board: Board, from: Coordinates, color: Color): Coordinates[] {
  return getSlidingMoves(board, from, color, DIRECTIONS.ALL);
}

/**
 * Get king moves
 */
function getKingMoves(board: Board, from: Coordinates, color: Color): Coordinates[] {
  return getJumpMoves(board, from, color, DIRECTIONS.ALL);
}

/**
 * Get sliding piece moves (Bishop, Rook, Queen)
 * Slides in directions until hitting a piece or board edge
 */
function getSlidingMoves(
  board: Board,
  from: Coordinates,
  color: Color,
  directions: readonly (readonly [number, number])[]
): Coordinates[] {
  const moves: Coordinates[] = [];
  const { row, col } = from;

  for (const [dRow, dCol] of directions) {
    let currentRow = row + dRow;
    let currentCol = col + dCol;

    while (board.isValidCoords(currentRow, currentCol)) {
      const targetPiece = board.getPieceAt(currentRow, currentCol);

      if (targetPiece === null) {
        // Empty square - can move here
        moves.push({ row: currentRow, col: currentCol });
      } else {
        // Hit a piece
        if (targetPiece.color !== color) {
          // Enemy piece - can capture
          moves.push({ row: currentRow, col: currentCol });
        }
        // Stop sliding in this direction (can't jump over pieces)
        break;
      }

      currentRow += dRow;
      currentCol += dCol;
    }
  }

  return moves;
}

/**
 * Get jump piece moves (Knight, King)
 * Moves to specific squares without sliding
 */
function getJumpMoves(
  board: Board,
  from: Coordinates,
  color: Color,
  directions: readonly (readonly [number, number])[]
): Coordinates[] {
  const moves: Coordinates[] = [];
  const { row, col } = from;

  for (const [dRow, dCol] of directions) {
    const targetRow = row + dRow;
    const targetCol = col + dCol;

    if (board.isValidCoords(targetRow, targetCol)) {
      const targetPiece = board.getPieceAt(targetRow, targetCol);

      // Can move to empty square or capture enemy piece
      if (targetPiece === null || targetPiece?.color !== color) {
        moves.push({ row: targetRow, col: targetCol });
      }
    }
  }

  return moves;
}

/**
 * Check if a square is under attack by a specific color
 *
 * @param board - The chess board
 * @param square - Target square coordinates
 * @param attackingColor - Color of attacking pieces
 * @returns True if the square is under attack
 */
export function isSquareUnderAttack(
  board: Board,
  square: Coordinates,
  attackingColor: Color
): boolean {
  const { row, col } = square;

  // Check for pawn attacks
  const pawnDirection = attackingColor === 'white' ? 1 : -1;
  const pawnAttackOffsets = [-1, 1];
  for (const offset of pawnAttackOffsets) {
    const pawnRow = row - pawnDirection; // Reverse direction to find attacking pawn
    const pawnCol = col + offset;
    if (board.isValidCoords(pawnRow, pawnCol)) {
      const piece = board.getPieceAt(pawnRow, pawnCol);
      if (piece?.type === 'pawn' && piece?.color === attackingColor) {
        return true;
      }
    }
  }

  // Check for knight attacks
  for (const [dRow, dCol] of DIRECTIONS.KNIGHT) {
    const knightRow = row + dRow;
    const knightCol = col + dCol;
    if (board.isValidCoords(knightRow, knightCol)) {
      const piece = board.getPieceAt(knightRow, knightCol);
      if (piece?.type === 'knight' && piece?.color === attackingColor) {
        return true;
      }
    }
  }

  // Check for king attacks
  for (const [dRow, dCol] of DIRECTIONS.ALL) {
    const kingRow = row + dRow;
    const kingCol = col + dCol;
    if (board.isValidCoords(kingRow, kingCol)) {
      const piece = board.getPieceAt(kingRow, kingCol);
      if (piece?.type === 'king' && piece?.color === attackingColor) {
        return true;
      }
    }
  }

  // Check for sliding piece attacks (bishop, rook, queen)
  // Bishop-like (diagonal)
  for (const [dRow, dCol] of DIRECTIONS.DIAGONAL) {
    let currentRow = row + dRow;
    let currentCol = col + dCol;

    while (board.isValidCoords(currentRow, currentCol)) {
      const piece = board.getPieceAt(currentRow, currentCol);
      if (piece) {
        if (piece.color === attackingColor && (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break; // Hit a piece, stop searching this direction
      }
      currentRow += dRow;
      currentCol += dCol;
    }
  }

  // Rook-like (orthogonal)
  for (const [dRow, dCol] of DIRECTIONS.ORTHOGONAL) {
    let currentRow = row + dRow;
    let currentCol = col + dCol;

    while (board.isValidCoords(currentRow, currentCol)) {
      const piece = board.getPieceAt(currentRow, currentCol);
      if (piece) {
        if (piece.color === attackingColor && (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break; // Hit a piece, stop searching this direction
      }
      currentRow += dRow;
      currentCol += dCol;
    }
  }

  return false;
}

/**
 * Check if the king of a specific color is in check
 *
 * @param board - The chess board
 * @param kingColor - Color of the king to check
 * @returns True if the king is in check
 */
export function isKingInCheck(board: Board, kingColor: Color): boolean {
  const kingSquare = board.findKing(kingColor);
  if (!kingSquare) {
    return false; // King not found (shouldn't happen in valid game)
  }

  const kingCoords = board.squareToCoords(kingSquare);
  if (!kingCoords) {
    return false;
  }

  const opponentColor = kingColor === 'white' ? 'black' : 'white';
  return isSquareUnderAttack(board, kingCoords, opponentColor);
}
