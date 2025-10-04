/**
 * Chess Board
 *
 * Represents an 8x8 chess board with piece placement and board operations.
 *
 * @module engine/board
 */

import type { Piece, Color, PieceType, Square, Coordinates } from '@/types/index';

/**
 * Chess Board class
 *
 * Manages the 8x8 board state and piece placement.
 * Uses 0-indexed array: board[row][col] where row 0 = rank 1, col 0 = file 'a'
 */
export class Board {
  private board: (Piece | null)[][];

  /**
   * Create a new board
   * @param initialBoard - Optional initial board state (default: empty board)
   */
  constructor(initialBoard?: (Piece | null)[][]) {
    if (initialBoard) {
      this.board = initialBoard.map((row) => [...row]);
    } else {
      this.board = this.createEmptyBoard();
    }
  }

  /**
   * Create an empty 8x8 board
   */
  private createEmptyBoard(): (Piece | null)[][] {
    return Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
  }

  /**
   * Set up the standard chess starting position
   */
  public setupStartingPosition(): void {
    this.board = this.createEmptyBoard();

    // Set up pawns
    for (let col = 0; col < 8; col++) {
      this.board[1]![col] = { type: 'pawn', color: 'white' };
      this.board[6]![col] = { type: 'pawn', color: 'black' };
    }

    // Set up white pieces (rank 1)
    const whitePieces: PieceType[] = [
      'rook',
      'knight',
      'bishop',
      'queen',
      'king',
      'bishop',
      'knight',
      'rook',
    ];
    for (let col = 0; col < 8; col++) {
      this.board[0]![col] = { type: whitePieces[col]!, color: 'white' };
    }

    // Set up black pieces (rank 8)
    const blackPieces: PieceType[] = [
      'rook',
      'knight',
      'bishop',
      'queen',
      'king',
      'bishop',
      'knight',
      'rook',
    ];
    for (let col = 0; col < 8; col++) {
      this.board[7]![col] = { type: blackPieces[col]!, color: 'black' };
    }
  }

  /**
   * Get piece at a square
   * @param square - Chess square notation (e.g., "e4")
   * @returns The piece at the square, or null if empty
   */
  public getPiece(square: Square): Piece | null {
    const coords = this.squareToCoords(square);
    if (!coords) return null;
    return this.board[coords.row]?.[coords.col] ?? null;
  }

  /**
   * Get piece at coordinates
   * @param row - Row index (0-7)
   * @param col - Column index (0-7)
   * @returns The piece at the coordinates, or null if empty
   */
  public getPieceAt(row: number, col: number): Piece | null {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row]?.[col] ?? null;
  }

  /**
   * Set piece at a square
   * @param square - Chess square notation (e.g., "e4")
   * @param piece - The piece to place, or null to clear
   */
  public setPiece(square: Square, piece: Piece | null): void {
    const coords = this.squareToCoords(square);
    if (!coords) return;
    this.board[coords.row]![coords.col] = piece;
  }

  /**
   * Set piece at coordinates
   * @param row - Row index (0-7)
   * @param col - Column index (0-7)
   * @param piece - The piece to place, or null to clear
   */
  public setPieceAt(row: number, col: number, piece: Piece | null): void {
    if (row < 0 || row > 7 || col < 0 || col > 7) return;
    this.board[row]![col] = piece;
  }

  /**
   * Move a piece from one square to another
   * @param from - Source square
   * @param to - Destination square
   * @returns The captured piece, if any
   */
  public movePiece(from: Square, to: Square): Piece | null {
    const fromCoords = this.squareToCoords(from);
    const toCoords = this.squareToCoords(to);

    if (!fromCoords || !toCoords) return null;

    const piece = this.getPieceAt(fromCoords.row, fromCoords.col);
    const captured = this.getPieceAt(toCoords.row, toCoords.col);

    this.setPieceAt(toCoords.row, toCoords.col, piece);
    this.setPieceAt(fromCoords.row, fromCoords.col, null);

    return captured;
  }

  /**
   * Convert square notation to board coordinates
   * @param square - Chess square notation (e.g., "e4")
   * @returns Coordinates {row, col} or null if invalid
   */
  public squareToCoords(square: Square): Coordinates | null {
    if (!square || square.length !== 2) return null;

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
   * Convert board coordinates to square notation
   * @param row - Row index (0-7)
   * @param col - Column index (0-7)
   * @returns Square notation (e.g., "e4") or null if invalid
   */
  public coordsToSquare(row: number, col: number): Square | null {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;

    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = (row + 1).toString();

    return file + rank;
  }

  /**
   * Check if a square is valid
   * @param square - Chess square notation
   * @returns True if the square is valid
   */
  public isValidSquare(square: Square): boolean {
    return this.squareToCoords(square) !== null;
  }

  /**
   * Check if coordinates are valid
   * @param row - Row index
   * @param col - Column index
   * @returns True if coordinates are within board bounds
   */
  public isValidCoords(row: number, col: number): boolean {
    return row >= 0 && row <= 7 && col >= 0 && col <= 7;
  }

  /**
   * Find all pieces of a specific color
   * @param color - Piece color to find
   * @returns Array of {square, piece} objects
   */
  public findPieces(color: Color): Array<{ square: Square; piece: Piece }> {
    const pieces: Array<{ square: Square; piece: Piece }> = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row]?.[col];
        if (piece && piece.color === color) {
          const square = this.coordsToSquare(row, col);
          if (square) {
            pieces.push({ square, piece });
          }
        }
      }
    }

    return pieces;
  }

  /**
   * Find the king of a specific color
   * @param color - King color to find
   * @returns Square where the king is located, or null if not found
   */
  public findKing(color: Color): Square | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row]?.[col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return this.coordsToSquare(row, col);
        }
      }
    }
    return null;
  }

  /**
   * Clone the board
   * @returns A deep copy of the board
   */
  public clone(): Board {
    const clonedBoard = this.board.map((row) =>
      row.map((piece) => (piece ? { ...piece } : null))
    );
    return new Board(clonedBoard);
  }

  /**
   * Clear the board (remove all pieces)
   */
  public clear(): void {
    this.board = this.createEmptyBoard();
  }

  /**
   * Get the raw board array (for internal use)
   * @returns The 2D board array
   */
  public getBoard(): (Piece | null)[][] {
    return this.board;
  }

  /**
   * Check if a square is empty
   * @param square - Chess square notation
   * @returns True if the square is empty
   */
  public isEmpty(square: Square): boolean {
    return this.getPiece(square) === null;
  }

  /**
   * Check if a square is occupied by a specific color
   * @param square - Chess square notation
   * @param color - Piece color to check
   * @returns True if the square has a piece of the specified color
   */
  public isOccupiedBy(square: Square, color: Color): boolean {
    const piece = this.getPiece(square);
    return piece !== null && piece.color === color;
  }

  /**
   * Get board as ASCII art (for debugging)
   * @returns String representation of the board
   */
  public toAscii(): string {
    const pieceSymbols: Record<string, string> = {
      'white-king': '♔',
      'white-queen': '♕',
      'white-rook': '♖',
      'white-bishop': '♗',
      'white-knight': '♘',
      'white-pawn': '♙',
      'black-king': '♚',
      'black-queen': '♛',
      'black-rook': '♜',
      'black-bishop': '♝',
      'black-knight': '♞',
      'black-pawn': '♟',
    };

    let result = '\n  ┌───┬───┬───┬───┬───┬───┬───┬───┐\n';

    for (let row = 7; row >= 0; row--) {
      result += `${row + 1} │`;
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row]?.[col];
        if (piece) {
          const symbol = pieceSymbols[`${piece.color}-${piece.type}`] || ' ';
          result += ` ${symbol} │`;
        } else {
          result += '   │';
        }
      }
      result += `\n  ${row > 0 ? '├───┼───┼───┼───┼───┼───┼───┼───┤' : '└───┴───┴───┴───┴───┴───┴───┴───┘'}\n`;
    }

    result += '    a   b   c   d   e   f   g   h\n';
    return result;
  }

  /**
   * Get a simple string representation (for testing)
   * @returns String representation using piece abbreviations
   */
  public toString(): string {
    const pieceChars: Record<string, string> = {
      'white-king': 'K',
      'white-queen': 'Q',
      'white-rook': 'R',
      'white-bishop': 'B',
      'white-knight': 'N',
      'white-pawn': 'P',
      'black-king': 'k',
      'black-queen': 'q',
      'black-rook': 'r',
      'black-bishop': 'b',
      'black-knight': 'n',
      'black-pawn': 'p',
    };

    let result = '';
    for (let row = 7; row >= 0; row--) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row]?.[col];
        if (piece) {
          result += pieceChars[`${piece.color}-${piece.type}`] || '.';
        } else {
          result += '.';
        }
      }
      if (row > 0) result += '\n';
    }
    return result;
  }
}
