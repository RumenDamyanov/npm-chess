/**
 * Move Generator
 *
 * Generates legal chess moves and validates move legality.
 * Handles check detection, checkmate, stalemate, and special moves.
 *
 * @module engine/moves
 */

import type {
  Move,
  Square,
  Color,
  PieceType,
  CastlingRights,
  MoveOptions,
  MoveValidation,
} from '@/types/index';
import type { Board } from './board';
import { getPseudoLegalMoves, isKingInCheck, isSquareUnderAttack } from './pieces';

/**
 * Move Generator class
 *
 * Generates all legal moves for a position and validates move legality.
 */
export class MoveGenerator {
  private board: Board;
  private castlingRights: CastlingRights;
  private enPassantSquare: Square | null;

  /**
   * Create a new move generator
   *
   * @param board - The chess board
   * @param castlingRights - Castling rights for both colors
   * @param enPassantSquare - Current en passant target square
   */
  constructor(board: Board, castlingRights: CastlingRights, enPassantSquare: Square | null = null) {
    this.board = board;
    this.castlingRights = castlingRights;
    this.enPassantSquare = enPassantSquare;
  }

  /**
   * Generate all legal moves for a color
   *
   * @param color - Color to generate moves for
   * @returns Array of legal moves
   */
  public generateLegalMoves(color: Color): Move[] {
    const legalMoves: Move[] = [];
    const pieces = this.board.findPieces(color);

    for (const { square } of pieces) {
      const movesFromSquare = this.generateLegalMovesFrom(square, color);
      legalMoves.push(...movesFromSquare);
    }

    return legalMoves;
  }

  /**
   * Generate legal moves from a specific square
   *
   * @param from - Starting square
   * @param color - Color of the piece
   * @returns Array of legal moves
   */
  public generateLegalMovesFrom(from: Square, color: Color): Move[] {
    const piece = this.board.getPiece(from);
    if (!piece || piece?.color !== color) {
      return [];
    }

    const fromCoords = this.board.squareToCoords(from);
    if (!fromCoords) return [];

    // Get pseudo-legal moves (ignoring check)
    const pseudoLegalMoves = getPseudoLegalMoves(this.board, fromCoords, piece.type, color);

    const legalMoves: Move[] = [];

    // Filter out moves that leave king in check
    for (const toCoords of pseudoLegalMoves) {
      const to = this.board.coordsToSquare(toCoords.row, toCoords.col);
      if (!to) continue;

      if (this.isMoveLegal(from, to, color)) {
        const captured = this.board.getPiece(to);
        const move: Move = {
          from,
          to,
          piece,
          captured: captured ?? undefined,
        };

        // Check if pawn promotion is possible
        if (piece.type === 'pawn' && this.isPawnPromotionRank(toCoords.row, color)) {
          // Generate moves for each promotion piece
          for (const promotion of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
            legalMoves.push({ ...move, promotion });
          }
        } else {
          legalMoves.push(move);
        }
      }
    }

    // Add en passant captures
    if (piece.type === 'pawn' && this.enPassantSquare) {
      const enPassantMove = this.getEnPassantMove(from, color);
      if (enPassantMove) {
        legalMoves.push(enPassantMove);
      }
    }

    // Add castling moves
    if (piece.type === 'king') {
      const castlingMoves = this.getCastlingMoves(color);
      legalMoves.push(...castlingMoves);
    }

    return legalMoves;
  }

  /**
   * Check if a move is legal (doesn't leave king in check)
   *
   * @param from - Starting square
   * @param to - Destination square
   * @param color - Color making the move
   * @returns True if the move is legal
   */
  public isMoveLegal(from: Square, to: Square, color: Color): boolean {
    // Make the move on a cloned board
    const clonedBoard = this.board.clone();
    clonedBoard.movePiece(from, to);

    // Check if king is in check after the move
    return !isKingInCheck(clonedBoard, color);
  }

  /**
   * Validate a move
   *
   * @param move - Move options to validate
   * @param color - Color making the move
   * @returns Validation result
   */
  public validateMove(move: MoveOptions, color: Color): MoveValidation {
    const { from, to, promotion } = move;

    // Check if squares are valid
    if (!this.board.isValidSquare(from) || !this.board.isValidSquare(to)) {
      return { valid: false, error: 'Invalid square' };
    }

    // Check if there's a piece at the starting square
    const piece = this.board.getPiece(from);
    if (!piece) {
      return { valid: false, error: 'No piece at starting square' };
    }

    // Check if the piece belongs to the player
    if (piece.color !== color) {
      return { valid: false, error: 'Not your piece' };
    }

    // Check if destination is the same as source
    if (from === to) {
      return { valid: false, error: 'Cannot move to the same square' };
    }

    // Generate legal moves for this piece
    const legalMoves = this.generateLegalMovesFrom(from, color);

    // Check if the requested move is in the legal moves
    const matchingMove = legalMoves.find((m) => {
      if (m.from !== from || m.to !== to) return false;
      // If promotion is required, check it matches
      if (promotion) return m.promotion === promotion;
      // If no promotion specified, accept any move to that square
      return true;
    });

    if (!matchingMove) {
      return { valid: false, error: 'Illegal move' };
    }

    // Check if promotion is required but not provided
    if (piece.type === 'pawn' && this.isPawnPromotionRequired(from, to, color) && !promotion) {
      return { valid: false, error: 'Pawn promotion required' };
    }

    return { valid: true };
  }

  /**
   * Check if the game is in checkmate
   *
   * @param color - Color to check for checkmate
   * @returns True if the color is in checkmate
   */
  public isCheckmate(color: Color): boolean {
    // Must be in check
    if (!isKingInCheck(this.board, color)) {
      return false;
    }

    // No legal moves available
    return this.generateLegalMoves(color).length === 0;
  }

  /**
   * Check if the game is in stalemate
   *
   * @param color - Color to check for stalemate
   * @returns True if the color is in stalemate
   */
  public isStalemate(color: Color): boolean {
    // Not in check
    if (isKingInCheck(this.board, color)) {
      return false;
    }

    // No legal moves available
    return this.generateLegalMoves(color).length === 0;
  }

  /**
   * Get en passant capture move if available
   *
   * @param from - Pawn square
   * @param color - Pawn color
   * @returns En passant move or null
   */
  private getEnPassantMove(from: Square, color: Color): Move | null {
    if (!this.enPassantSquare) return null;

    const fromCoords = this.board.squareToCoords(from);
    const enPassantCoords = this.board.squareToCoords(this.enPassantSquare);
    if (!fromCoords || !enPassantCoords) return null;

    // Check if pawn can capture en passant
    const direction = color === 'white' ? 1 : -1;
    const canCapture =
      enPassantCoords.row === fromCoords.row + direction &&
      Math.abs(enPassantCoords.col - fromCoords.col) === 1;

    if (!canCapture) return null;

    // Check if move is legal (doesn't leave king in check)
    if (!this.isMoveLegal(from, this.enPassantSquare, color)) {
      return null;
    }

    const capturedPawnRank = color === 'white' ? enPassantCoords.row - 1 : enPassantCoords.row + 1;
    const capturedPawnSquare = this.board.coordsToSquare(capturedPawnRank, enPassantCoords.col);
    const capturedPawn = capturedPawnSquare ? this.board.getPiece(capturedPawnSquare) : null;

    return {
      from,
      to: this.enPassantSquare,
      piece: { type: 'pawn', color },
      captured: capturedPawn ?? undefined,
      enPassant: true,
    };
  }

  /**
   * Get castling moves if available
   *
   * @param color - King color
   * @returns Array of castling moves
   */
  private getCastlingMoves(color: Color): Move[] {
    const moves: Move[] = [];

    if (color === 'white') {
      // White kingside castling
      if (this.canCastleKingside('white')) {
        moves.push({
          from: 'e1',
          to: 'g1',
          piece: { type: 'king', color: 'white' },
          castling: 'kingside',
        });
      }

      // White queenside castling
      if (this.canCastleQueenside('white')) {
        moves.push({
          from: 'e1',
          to: 'c1',
          piece: { type: 'king', color: 'white' },
          castling: 'queenside',
        });
      }
    } else {
      // Black kingside castling
      if (this.canCastleKingside('black')) {
        moves.push({
          from: 'e8',
          to: 'g8',
          piece: { type: 'king', color: 'black' },
          castling: 'kingside',
        });
      }

      // Black queenside castling
      if (this.canCastleQueenside('black')) {
        moves.push({
          from: 'e8',
          to: 'c8',
          piece: { type: 'king', color: 'black' },
          castling: 'queenside',
        });
      }
    }

    return moves;
  }

  /**
   * Check if kingside castling is possible
   *
   * @param color - King color
   * @returns True if kingside castling is legal
   */
  private canCastleKingside(color: Color): boolean {
    const hasRights =
      color === 'white' ? this.castlingRights.whiteKingside : this.castlingRights.blackKingside;

    if (!hasRights) return false;

    const rank = color === 'white' ? '1' : '8';
    const kingSquare = `e${rank}`;
    const rookSquare = `h${rank}`;

    // Check if king and rook are in place
    const king = this.board.getPiece(kingSquare);
    const rook = this.board.getPiece(rookSquare);

    if (!king || king?.type !== 'king' || king?.color !== color) return false;
    if (!rook || rook?.type !== 'rook' || rook?.color !== color) return false;

    // Check if squares between king and rook are empty
    if (!this.board.isEmpty(`f${rank}`) || !this.board.isEmpty(`g${rank}`)) {
      return false;
    }

    // King cannot be in check
    if (isKingInCheck(this.board, color)) return false;

    // Squares the king passes through cannot be under attack
    const opponentColor = color === 'white' ? 'black' : 'white';
    const f = this.board.squareToCoords(`f${rank}`);
    const g = this.board.squareToCoords(`g${rank}`);

    if (!f || !g) return false;

    if (
      isSquareUnderAttack(this.board, f, opponentColor) ||
      isSquareUnderAttack(this.board, g, opponentColor)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Check if queenside castling is possible
   *
   * @param color - King color
   * @returns True if queenside castling is legal
   */
  private canCastleQueenside(color: Color): boolean {
    const hasRights =
      color === 'white' ? this.castlingRights.whiteQueenside : this.castlingRights.blackQueenside;

    if (!hasRights) return false;

    const rank = color === 'white' ? '1' : '8';
    const kingSquare = `e${rank}`;
    const rookSquare = `a${rank}`;

    // Check if king and rook are in place
    const king = this.board.getPiece(kingSquare);
    const rook = this.board.getPiece(rookSquare);

    if (!king || king?.type !== 'king' || king?.color !== color) return false;
    if (!rook || rook?.type !== 'rook' || rook?.color !== color) return false;

    // Check if squares between king and rook are empty
    if (
      !this.board.isEmpty(`b${rank}`) ||
      !this.board.isEmpty(`c${rank}`) ||
      !this.board.isEmpty(`d${rank}`)
    ) {
      return false;
    }

    // King cannot be in check
    if (isKingInCheck(this.board, color)) return false;

    // Squares the king passes through cannot be under attack
    const opponentColor = color === 'white' ? 'black' : 'white';
    const c = this.board.squareToCoords(`c${rank}`);
    const d = this.board.squareToCoords(`d${rank}`);

    if (!c || !d) return false;

    if (
      isSquareUnderAttack(this.board, c, opponentColor) ||
      isSquareUnderAttack(this.board, d, opponentColor)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Check if a rank is a pawn promotion rank
   *
   * @param rank - Rank index (0-7)
   * @param color - Pawn color
   * @returns True if pawns of this color promote on this rank
   */
  private isPawnPromotionRank(rank: number, color: Color): boolean {
    return (color === 'white' && rank === 7) || (color === 'black' && rank === 0);
  }

  /**
   * Check if a pawn move requires promotion
   *
   * @param from - Starting square
   * @param to - Destination square
   * @param color - Pawn color
   * @returns True if promotion is required
   */
  private isPawnPromotionRequired(from: Square, to: Square, color: Color): boolean {
    const piece = this.board.getPiece(from);
    if (!piece || piece?.type !== 'pawn') return false;

    const toCoords = this.board.squareToCoords(to);
    if (!toCoords) return false;

    return this.isPawnPromotionRank(toCoords.row, color);
  }
}
