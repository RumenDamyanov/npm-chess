/**
 * FEN (Forsyth-Edwards Notation) Parser and Generator
 *
 * Utilities for parsing FEN strings to game state and generating
 * FEN strings from game state.
 *
 * FEN Format: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 * 1. Piece placement (rank 8 to rank 1)
 * 2. Active color (w or b)
 * 3. Castling availability (KQkq or -)
 * 4. En passant target square (e.g., e3 or -)
 * 5. Halfmove clock (for fifty-move rule)
 * 6. Fullmove number
 *
 * @module engine/fen
 */

import type { Piece, PieceType, Color, Square, CastlingRights, Fen } from '@/types/index';
import { Board } from './board';

/**
 * FEN Parser and Generator
 */
export class FenParser {
  /**
   * Standard starting position FEN
   */
  public static readonly STARTING_POSITION: Fen =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  /**
   * Parse a FEN string into game state
   *
   * @param fen - FEN string to parse
   * @returns Parsed game state
   * @throws Error if FEN is invalid
   */
  public static parse(fen: Fen): {
    board: Board;
    turn: Color;
    castlingRights: CastlingRights;
    enPassantSquare: Square | null;
    halfMoveClock: number;
    fullMoveNumber: number;
  } {
    const parts = fen.trim().split(/\s+/);

    if (parts.length !== 6) {
      throw new Error(`Invalid FEN: expected 6 parts, got ${parts.length}`);
    }

    const [piecePlacement, activeColor, castling, enPassant, halfMove, fullMove] = parts as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];

    // Parse piece placement
    const board = this.parsePiecePlacement(piecePlacement);

    // Parse active color
    const turn = this.parseActiveColor(activeColor);

    // Parse castling rights
    const castlingRights = this.parseCastlingRights(castling);

    // Parse en passant
    const enPassantSquare = this.parseEnPassant(enPassant);

    // Parse clocks
    const halfMoveClock = this.parseHalfMoveClock(halfMove);
    const fullMoveNumber = this.parseFullMoveNumber(fullMove);

    return {
      board,
      turn,
      castlingRights,
      enPassantSquare,
      halfMoveClock,
      fullMoveNumber,
    };
  }

  /**
   * Generate a FEN string from game state
   *
   * @param board - Chess board
   * @param turn - Active color
   * @param castlingRights - Castling availability
   * @param enPassantSquare - En passant target square
   * @param halfMoveClock - Halfmove clock
   * @param fullMoveNumber - Fullmove number
   * @returns FEN string
   */
  public static generate(
    board: Board,
    turn: Color,
    castlingRights: CastlingRights,
    enPassantSquare: Square | null,
    halfMoveClock: number,
    fullMoveNumber: number
  ): Fen {
    const parts: string[] = [];

    // Generate piece placement
    parts.push(this.generatePiecePlacement(board));

    // Generate active color
    parts.push(turn === 'white' ? 'w' : 'b');

    // Generate castling rights
    parts.push(this.generateCastlingRights(castlingRights));

    // Generate en passant
    parts.push(enPassantSquare ?? '-');

    // Generate clocks
    parts.push(halfMoveClock.toString());
    parts.push(fullMoveNumber.toString());

    return parts.join(' ');
  }

  /**
   * Parse piece placement from FEN
   *
   * @param placement - Piece placement string
   * @returns Board with pieces
   */
  private static parsePiecePlacement(placement: string): Board {
    const board = new Board();
    const ranks = placement.split('/');

    if (ranks.length !== 8) {
      throw new Error(`Invalid FEN: expected 8 ranks, got ${ranks.length}`);
    }

    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const rank = ranks[rankIndex]!;
      let fileIndex = 0;

      for (const char of rank) {
        if (fileIndex >= 8) {
          throw new Error(`Invalid FEN: too many squares in rank ${8 - rankIndex}`);
        }

        // Check if it's a number (empty squares)
        if (/\d/.test(char)) {
          const emptySquares = parseInt(char, 10);
          if (emptySquares < 1 || emptySquares > 8) {
            throw new Error(`Invalid FEN: invalid empty square count '${char}'`);
          }
          fileIndex += emptySquares;
        } else {
          // It's a piece
          const piece = this.charToPiece(char);
          if (!piece) {
            throw new Error(`Invalid FEN: unknown piece character '${char}'`);
          }

          // Convert rank/file to board coordinates
          // FEN rank 8 = board row 7, FEN rank 1 = board row 0
          const row = 7 - rankIndex;
          const col = fileIndex;

          board.setPieceAt(row, col, piece);
          fileIndex++;
        }
      }

      if (fileIndex !== 8) {
        throw new Error(`Invalid FEN: incomplete rank ${8 - rankIndex}`);
      }
    }

    return board;
  }

  /**
   * Generate piece placement string for FEN
   *
   * @param board - Chess board
   * @returns Piece placement string
   */
  private static generatePiecePlacement(board: Board): string {
    const ranks: string[] = [];

    // Iterate from rank 8 to rank 1 (row 7 to row 0)
    for (let row = 7; row >= 0; row--) {
      let rankStr = '';
      let emptyCount = 0;

      for (let col = 0; col < 8; col++) {
        const piece = board.getPieceAt(row, col);

        if (piece) {
          // If we had empty squares, add the count
          if (emptyCount > 0) {
            rankStr += emptyCount.toString();
            emptyCount = 0;
          }
          // Add the piece character
          rankStr += this.pieceToChar(piece);
        } else {
          emptyCount++;
        }
      }

      // Add remaining empty squares
      if (emptyCount > 0) {
        rankStr += emptyCount.toString();
      }

      ranks.push(rankStr);
    }

    return ranks.join('/');
  }

  /**
   * Parse active color from FEN
   *
   * @param color - Color character
   * @returns Color
   */
  private static parseActiveColor(color: string): Color {
    if (color === 'w') return 'white';
    if (color === 'b') return 'black';
    throw new Error(`Invalid FEN: invalid active color '${color}'`);
  }

  /**
   * Parse castling rights from FEN
   *
   * @param castling - Castling string
   * @returns Castling rights
   */
  private static parseCastlingRights(castling: string): CastlingRights {
    const rights: CastlingRights = {
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: false,
      blackQueenside: false,
    };

    if (castling === '-') return rights;

    for (const char of castling) {
      switch (char) {
        case 'K':
          rights.whiteKingside = true;
          break;
        case 'Q':
          rights.whiteQueenside = true;
          break;
        case 'k':
          rights.blackKingside = true;
          break;
        case 'q':
          rights.blackQueenside = true;
          break;
        default:
          throw new Error(`Invalid FEN: invalid castling character '${char}'`);
      }
    }

    return rights;
  }

  /**
   * Generate castling rights string for FEN
   *
   * @param rights - Castling rights
   * @returns Castling string
   */
  private static generateCastlingRights(rights: CastlingRights): string {
    let str = '';

    if (rights.whiteKingside) str += 'K';
    if (rights.whiteQueenside) str += 'Q';
    if (rights.blackKingside) str += 'k';
    if (rights.blackQueenside) str += 'q';

    return str || '-';
  }

  /**
   * Parse en passant square from FEN
   *
   * @param enPassant - En passant string
   * @returns En passant square or null
   */
  private static parseEnPassant(enPassant: string): Square | null {
    if (enPassant === '-') return null;

    // Validate square notation
    if (!/^[a-h][36]$/.test(enPassant)) {
      throw new Error(`Invalid FEN: invalid en passant square '${enPassant}'`);
    }

    return enPassant as Square;
  }

  /**
   * Parse halfmove clock from FEN
   *
   * @param halfMove - Halfmove clock string
   * @returns Halfmove clock
   */
  private static parseHalfMoveClock(halfMove: string): number {
    const clock = parseInt(halfMove, 10);
    if (isNaN(clock) || clock < 0) {
      throw new Error(`Invalid FEN: invalid halfmove clock '${halfMove}'`);
    }
    return clock;
  }

  /**
   * Parse fullmove number from FEN
   *
   * @param fullMove - Fullmove number string
   * @returns Fullmove number
   */
  private static parseFullMoveNumber(fullMove: string): number {
    const number = parseInt(fullMove, 10);
    if (isNaN(number) || number < 1) {
      throw new Error(`Invalid FEN: invalid fullmove number '${fullMove}'`);
    }
    return number;
  }

  /**
   * Convert FEN character to piece
   *
   * @param char - FEN piece character
   * @returns Piece or null
   */
  private static charToPiece(char: string): Piece | null {
    const isUpper = char === char.toUpperCase();
    const color: Color = isUpper ? 'white' : 'black';
    const lowerChar = char.toLowerCase();

    const typeMap: Record<string, PieceType> = {
      p: 'pawn',
      n: 'knight',
      b: 'bishop',
      r: 'rook',
      q: 'queen',
      k: 'king',
    };

    const type = typeMap[lowerChar];
    if (!type) return null;

    return { type, color };
  }

  /**
   * Convert piece to FEN character
   *
   * @param piece - Chess piece
   * @returns FEN character
   */
  private static pieceToChar(piece: Piece): string {
    const charMap: Record<PieceType, string> = {
      pawn: 'p',
      knight: 'n',
      bishop: 'b',
      rook: 'r',
      queen: 'q',
      king: 'k',
    };

    const char = charMap[piece.type];
    return piece.color === 'white' ? char.toUpperCase() : char;
  }

  /**
   * Validate a FEN string
   *
   * @param fen - FEN string to validate
   * @returns True if valid
   */
  public static validate(fen: Fen): boolean {
    try {
      this.parse(fen);
      return true;
    } catch {
      return false;
    }
  }
}
