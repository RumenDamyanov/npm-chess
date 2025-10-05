/**
 * PGN (Portable Game Notation) Parser and Generator
 *
 * Handles parsing and generation of PGN format chess games.
 * Supports PGN tags, Standard Algebraic Notation (SAN), and basic comments.
 *
 * @module engine/pgn
 */

import type { Pgn, Move, Square, PieceType } from '@/types/index';
import { Game } from './game';

/**
 * PGN tag pairs
 */
export interface PgnTags {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  [key: string]: string | undefined;
}

/**
 * Parsed PGN game
 */
export interface PgnGame {
  tags: PgnTags;
  moves: string[];
  result?: string;
}

/**
 * PGN Parser and Generator
 *
 * Static utility class for working with PGN notation.
 */
export class PgnParser {
  /**
   * Parse a PGN string into tags and moves
   */
  public static parse(pgn: Pgn): PgnGame {
    const lines = pgn.split('\n');
    const tags: PgnTags = {};
    const moveText: string[] = [];
    let inMoveSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        if (Object.keys(tags).length > 0) {
          inMoveSection = true;
        }
        continue;
      }

      // Parse tag pairs
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        const tagMatch = trimmedLine.match(/\[(\w+)\s+"([^"]*)"\]/);
        if (tagMatch) {
          const [, key, value] = tagMatch;
          if (key && value !== undefined) {
            tags[key] = value;
          }
        }
      } else if (inMoveSection) {
        // Collect move text
        moveText.push(trimmedLine);
      }
    }

    // Parse moves from move text
    const fullMoveText = moveText.join(' ');
    const moves = this.parseMoveText(fullMoveText);
    const result = tags.Result;

    return { tags, moves, result };
  }

  /**
   * Parse move text into individual moves
   */
  private static parseMoveText(moveText: string): string[] {
    const moves: string[] = [];

    // Remove comments in braces
    let cleanText = moveText.replace(/\{[^}]*\}/g, '');

    // Remove variations in parentheses
    cleanText = this.removeVariations(cleanText);

    // Remove result markers
    cleanText = cleanText.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '');

    // Split by move numbers and extract moves
    const tokens = cleanText.split(/\s+/).filter((token) => token.length > 0);

    for (const token of tokens) {
      // Skip move numbers (e.g., "1.", "2.", "10...")
      if (/^\d+\.+$/.test(token)) {
        continue;
      }

      // Skip result indicators
      if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) {
        continue;
      }

      // Valid move in SAN notation
      if (this.isValidSanMove(token)) {
        moves.push(token);
      }
    }

    return moves;
  }

  /**
   * Remove nested variations from move text
   */
  private static removeVariations(text: string): string {
    const result = text;
    let depth = 0;
    let cleaned = '';

    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
      } else if (depth === 0) {
        cleaned += char;
      }
    }

    return cleaned;
  }

  /**
   * Check if a token is a valid SAN move
   */
  private static isValidSanMove(token: string): boolean {
    // Remove check/checkmate indicators
    const move = token.replace(/[+#]$/, '');

    // Castling
    if (/^O-O(-O)?$/.test(move)) {
      return true;
    }

    // Regular moves: [Piece][file/rank disambiguation][x][destination][=promotion]
    // Examples: e4, Nf3, Bxc4, exd5, e8=Q, Nbd7, R1a3
    if (/^[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQ])?$/.test(move)) {
      return true;
    }

    return false;
  }

  /**
   * Generate PGN string from game
   */
  public static generate(game: Game, tags: PgnTags = {}): Pgn {
    const lines: string[] = [];

    // Generate tag pairs
    const defaultTags: PgnTags = {
      Event: tags.Event ?? '?',
      Site: tags.Site ?? '?',
      Date: tags.Date ?? '????.??.??',
      Round: tags.Round ?? '?',
      White: tags.White ?? '?',
      Black: tags.Black ?? '?',
      Result: tags.Result ?? this.getResultString(game),
    };

    // Add all tags
    const allTags = { ...defaultTags, ...tags };
    const sevenRosterTags = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];

    // Seven Tag Roster first
    for (const key of sevenRosterTags) {
      const value = allTags[key];
      if (value !== undefined) {
        lines.push(`[${key} "${value}"]`);
      }
    }

    // Additional tags
    for (const [key, value] of Object.entries(allTags)) {
      if (!sevenRosterTags.includes(key) && value !== undefined) {
        lines.push(`[${key} "${value}"]`);
      }
    }

    // Empty line before moves
    lines.push('');

    // Generate moves
    const moveText = this.generateMoveText(game);
    lines.push(moveText);

    return lines.join('\n');
  }

  /**
   * Generate move text in PGN format
   */
  private static generateMoveText(game: Game): string {
    const history = game.getHistory();
    const lines: string[] = [];
    let currentLine = '';
    const maxLineLength = 80;

    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      if (!move) continue;

      let moveStr = '';

      // Add move number for white's moves
      if (i % 2 === 0) {
        const moveNumber = Math.floor(i / 2) + 1;
        moveStr = `${moveNumber}. ${move.san ?? this.moveToSan(move)}`;
      } else {
        moveStr = move.san ?? this.moveToSan(move);
      }

      // Check if adding this move would exceed line length
      if (currentLine && currentLine.length + moveStr.length + 1 > maxLineLength) {
        lines.push(currentLine);
        currentLine = moveStr;
      } else {
        currentLine = currentLine ? `${currentLine} ${moveStr}` : moveStr;
      }
    }

    // Add remaining moves
    if (currentLine) {
      lines.push(currentLine);
    }

    // Add result
    const result = this.getResultString(game);
    if (lines.length > 0) {
      lines[lines.length - 1] += ` ${result}`;
    } else {
      lines.push(result);
    }

    return lines.join('\n');
  }

  /**
   * Get result string from game status
   */
  private static getResultString(game: Game): string {
    const status = game.getStatus();

    if (status === 'checkmate') {
      return game.getTurn() === 'white' ? '0-1' : '1-0';
    }

    if (
      status === 'stalemate' ||
      status === 'draw' ||
      status === 'insufficient_material' ||
      status === 'threefold_repetition' ||
      status === 'fifty_move_rule'
    ) {
      return '1/2-1/2';
    }

    return '*';
  }

  /**
   * Convert a Move object to SAN notation
   */
  private static moveToSan(move: Move): string {
    // If SAN is already provided, use it
    if (move.san) {
      return move.san;
    }

    // Castling
    if (move.castling) {
      return move.castling === 'kingside' ? 'O-O' : 'O-O-O';
    }

    let san = '';

    // Piece notation (not for pawns)
    if (move.piece.type !== 'pawn') {
      san += move.piece.type[0]?.toUpperCase() ?? '';
    }

    // Add disambiguation if needed (simplified - would need game context for proper disambiguation)
    // For now, we'll skip disambiguation logic

    // Capture notation
    if (move.captured) {
      if (move.piece.type === 'pawn') {
        san += move.from[0]; // Add file for pawn captures
      }
      san += 'x';
    }

    // Destination square
    san += move.to;

    // Promotion
    if (move.promotion) {
      san += '=' + move.promotion[0]?.toUpperCase();
    }

    // Check/checkmate indicators
    if (move.checkmate) {
      san += '#';
    } else if (move.check) {
      san += '+';
    }

    return san;
  }

  /**
   * Apply a SAN move to a game
   */
  public static applySanMove(game: Game, san: string): boolean {
    // Remove check/checkmate indicators
    const cleanSan = san.replace(/[+#]$/, '');

    // Handle castling
    if (cleanSan === 'O-O') {
      return this.tryCastling(game, 'kingside');
    }
    if (cleanSan === 'O-O-O') {
      return this.tryCastling(game, 'queenside');
    }

    // Parse regular move
    const moveInfo = this.parseSanMove(cleanSan);
    if (!moveInfo) {
      return false;
    }

    // Find matching legal move
    const legalMoves = game.getLegalMoves();
    for (const move of legalMoves) {
      if (this.matchesMoveCriteria(move, moveInfo)) {
        const result = game.move({
          from: move.from,
          to: move.to,
          promotion: moveInfo.promotion,
        });
        return result !== null;
      }
    }

    return false;
  }

  /**
   * Try to castle
   */
  private static tryCastling(game: Game, side: 'kingside' | 'queenside'): boolean {
    const turn = game.getTurn();
    const rank = turn === 'white' ? '1' : '8';
    const kingSquare: Square = `e${rank}`;
    const kingTo: Square = side === 'kingside' ? `g${rank}` : `c${rank}`;

    const board = game.getBoard();
    const king = board.getPiece(kingSquare);

    if (king?.type !== 'king' || king.color !== turn) {
      return false;
    }

    const result = game.move({ from: kingSquare, to: kingTo });
    return result !== null;
  }

  /**
   * Parse SAN move into components
   */
  private static parseSanMove(san: string): {
    pieceType: PieceType;
    toSquare: Square;
    fromFile?: string;
    fromRank?: string;
    capture: boolean;
    promotion?: PieceType;
  } | null {
    // Piece type
    let pieceType: PieceType = 'pawn';
    let rest = san;

    if (/^[NBRQK]/.test(san)) {
      const pieceChar = san[0];
      pieceType = this.pieceCharToType(pieceChar ?? '');
      rest = san.slice(1);
    }

    // Capture
    const capture = rest.includes('x');
    rest = rest.replace('x', '');

    // Promotion
    let promotion: PieceType | undefined;
    const promotionMatch = rest.match(/=([NBRQ])$/);
    if (promotionMatch) {
      promotion = this.pieceCharToType(promotionMatch[1] ?? '');
      rest = rest.replace(/=[NBRQ]$/, '');
    }

    // Destination square (always last 2 characters)
    if (rest.length < 2) {
      return null;
    }
    const toSquare: Square = rest.slice(-2);

    // Disambiguation (file and/or rank)
    const disambiguation = rest.slice(0, -2);
    let fromFile: string | undefined;
    let fromRank: string | undefined;

    if (disambiguation.length > 0) {
      if (/[a-h]/.test(disambiguation)) {
        fromFile = disambiguation.match(/[a-h]/)?.[0];
      }
      if (/[1-8]/.test(disambiguation)) {
        fromRank = disambiguation.match(/[1-8]/)?.[0];
      }
    }

    return {
      pieceType,
      toSquare,
      fromFile,
      fromRank,
      capture,
      promotion,
    };
  }

  /**
   * Convert piece character to PieceType
   */
  private static pieceCharToType(char: string): PieceType {
    const map: Record<string, PieceType> = {
      K: 'king',
      Q: 'queen',
      R: 'rook',
      B: 'bishop',
      N: 'knight',
      P: 'pawn',
    };
    return map[char] ?? 'pawn';
  }

  /**
   * Check if a move matches the parsed SAN criteria
   */
  private static matchesMoveCriteria(
    move: Move,
    criteria: {
      pieceType: PieceType;
      toSquare: Square;
      fromFile?: string;
      fromRank?: string;
      capture: boolean;
      promotion?: PieceType;
    }
  ): boolean {
    // Check piece type
    if (move.piece.type !== criteria.pieceType) {
      return false;
    }

    // Check destination
    if (move.to !== criteria.toSquare) {
      return false;
    }

    // Check capture
    if (criteria.capture && !move.captured && !move.enPassant) {
      return false;
    }

    // Check disambiguation
    if (criteria.fromFile && move.from[0] !== criteria.fromFile) {
      return false;
    }
    if (criteria.fromRank && move.from[1] !== criteria.fromRank) {
      return false;
    }

    // Check promotion
    if (criteria.promotion && move.promotion !== criteria.promotion) {
      return false;
    }

    return true;
  }

  /**
   * Load a game from PGN
   */
  public static loadGame(pgn: Pgn): Game | null {
    try {
      const parsed = this.parse(pgn);
      const game = new Game();

      // Apply all moves
      for (const san of parsed.moves) {
        const success = this.applySanMove(game, san);
        if (!success) {
          return null;
        }
      }

      return game;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate PGN string
   */
  public static validate(pgn: Pgn): boolean {
    try {
      this.parse(pgn);
      return true;
    } catch {
      return false;
    }
  }
}
