/**
 * Opening Book for Chess Engine
 *
 * Provides a database of standard chess opening moves to improve
 * AI play in the opening phase without expensive calculation.
 *
 * @module ai/opening-book
 */

import type { Game } from '../engine/game.js';

/**
 * Represents a single move in the opening book with metadata
 */
export interface OpeningMove {
  /** Move in algebraic notation (e.g., "Nf3", "e4") */
  move: string;

  /** Weight/frequency of this move (0-100, higher = more common/strong) */
  weight: number;

  /** ECO code (e.g., "C50", "B20") */
  eco?: string;

  /** Opening name (e.g., "Italian Game", "Sicilian Defense") */
  name?: string;

  /** Variation name (e.g., "Najdorf", "Dragon") */
  variation?: string;
}

/**
 * Opening book configuration options
 */
export interface OpeningBookConfig {
  /** Whether to use opening book (default: true) */
  enabled?: boolean;

  /** Maximum depth to use opening book in plies (default: 12) */
  maxDepth?: number;

  /** Whether to randomize move selection based on weights (default: true) */
  randomize?: boolean;

  /** Minimum weight threshold for move selection (default: 5) */
  minWeight?: number;
}

/**
 * Opening book database structure
 */
export interface OpeningBookData {
  /** Version of the opening book */
  version: string;

  /** Maximum depth of opening book (in plies) */
  maxDepth: number;

  /** Map of FEN positions to available moves */
  positions: Record<string, OpeningMove[]>;
}

/**
 * Opening Book class for storing and retrieving chess opening moves
 *
 * @example
 * ```typescript
 * const book = new OpeningBook();
 * await book.load(); // Load default opening book
 *
 * const game = new Game();
 * const move = book.getMove(game);
 * if (move) {
 *   console.log(`Opening book suggests: ${move.move} (${move.name})`);
 * }
 * ```
 */
export class OpeningBook {
  private positions: Map<string, OpeningMove[]> = new Map();
  private config: Required<OpeningBookConfig>;
  private maxDepth: number = 12;
  private version: string = '1.0.0';

  /**
   * Creates a new Opening Book instance
   *
   * @param config - Configuration options for the opening book
   */
  constructor(config: OpeningBookConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxDepth: config.maxDepth ?? 12,
      randomize: config.randomize ?? true,
      minWeight: config.minWeight ?? 5,
    };
  }

  /**
   * Load opening book data from a JSON object
   *
   * @param data - Opening book data to load
   */
  public loadData(data: OpeningBookData): void {
    this.version = data.version;
    this.maxDepth = data.maxDepth;
    this.positions.clear();

    for (const [fen, moves] of Object.entries(data.positions)) {
      this.positions.set(fen, moves);
    }
  }

  /**
   * Get a move from the opening book for the current position
   *
   * @param game - Current game state
   * @returns Opening move with metadata, or null if not found
   */
  public getMove(game: Game): OpeningMove | null {
    if (!this.config.enabled) {
      return null;
    }

    // Check if we're beyond maximum depth
    const ply = game.getHistory().length;
    if (ply >= this.config.maxDepth) {
      return null;
    }

    // Get current position FEN (without move counters for matching)
    const fen = this.normalizeFEN(game.getFen());

    // Lookup moves for this position
    const moves = this.positions.get(fen);
    if (!moves || moves.length === 0) {
      return null;
    }

    // Filter moves by minimum weight
    const validMoves = moves.filter((m) => m.weight >= this.config.minWeight);
    if (validMoves.length === 0) {
      return null;
    }

    // Select move (random weighted or highest weight)
    return this.selectMove(validMoves);
  }

  /**
   * Check if a position exists in the opening book
   *
   * @param fen - FEN string of the position
   * @returns True if position is in the book
   */
  public hasPosition(fen: string): boolean {
    const normalizedFEN = this.normalizeFEN(fen);
    return this.positions.has(normalizedFEN);
  }

  /**
   * Get all available moves for a position
   *
   * @param fen - FEN string of the position
   * @returns Array of opening moves, or empty array if not found
   */
  public getMoves(fen: string): OpeningMove[] {
    const normalizedFEN = this.normalizeFEN(fen);
    return this.positions.get(normalizedFEN) || [];
  }

  /**
   * Get opening book statistics
   *
   * @returns Statistics about the opening book
   */
  public getStats(): {
    version: string;
    maxDepth: number;
    positionCount: number;
    totalMoves: number;
  } {
    let totalMoves = 0;
    for (const moves of this.positions.values()) {
      totalMoves += moves.length;
    }

    return {
      version: this.version,
      maxDepth: this.maxDepth,
      positionCount: this.positions.size,
      totalMoves,
    };
  }

  /**
   * Clear the opening book
   */
  public clear(): void {
    this.positions.clear();
  }

  /**
   * Update configuration
   *
   * @param config - New configuration options
   */
  public configure(config: Partial<OpeningBookConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Normalize FEN string for consistent lookup
   * Removes move counters (halfmove and fullmove) which don't affect position
   *
   * @param fen - Full FEN string
   * @returns Normalized FEN string (first 4 fields only)
   */
  private normalizeFEN(fen: string): string {
    const parts = fen.split(' ');
    // Keep only: board, active color, castling rights, en passant
    return parts.slice(0, 4).join(' ');
  }

  /**
   * Select a move from available moves based on configuration
   *
   * @param moves - Available moves to choose from
   * @returns Selected move
   */
  private selectMove(moves: OpeningMove[]): OpeningMove {
    if (!this.config.randomize) {
      // Always return highest weighted move
      return moves.reduce((best, current) =>
        current.weight > best.weight ? current : best
      );
    }

    // Weighted random selection
    const totalWeight = moves.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;

    for (const move of moves) {
      random -= move.weight;
      if (random <= 0) {
        return move;
      }
    }

    // Fallback to first move (should rarely reach here)
    const firstMove = moves[0];
    if (firstMove) {
      return firstMove;
    }

    // This should never happen as we filter empty arrays earlier
    throw new Error('No moves available for selection');
  }
}

/**
 * Load opening book data from a JSON file path (Node.js only)
 *
 * @param filePath - Path to the JSON file
 * @returns Opening book with loaded data
 */
export async function loadOpeningBookFromFile(
  filePath: string
): Promise<OpeningBook> {
  // Dynamic import for Node.js fs module
  const fs = await import('fs/promises');
  const data = await fs.readFile(filePath, 'utf-8');
  const bookData = JSON.parse(data) as OpeningBookData;
  
  const book = new OpeningBook();
  book.loadData(bookData);
  return book;
}

/**
 * Create a default opening book with common openings
 *
 * @returns Opening book with default data
 */
export function createDefaultOpeningBook(): OpeningBook {
  const book = new OpeningBook();

  // Default opening book data will be loaded here
  // This is a minimal set for demonstration
  // For production, use loadOpeningBookFromFile() to load comprehensive data
  const defaultData: OpeningBookData = {
    version: '1.0.0',
    maxDepth: 12,
    positions: {
      // Starting position
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
        { move: 'e4', weight: 45, eco: 'C00', name: "King's Pawn Opening" },
        { move: 'd4', weight: 40, eco: 'D00', name: "Queen's Pawn Opening" },
        { move: 'Nf3', weight: 10, eco: 'A04', name: 'Réti Opening' },
        { move: 'c4', weight: 5, eco: 'A10', name: 'English Opening' },
      ],

      // After 1. e4
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
        { move: 'c5', weight: 40, eco: 'B20', name: 'Sicilian Defense' },
        { move: 'e5', weight: 30, eco: 'C40', name: "King's Pawn Game" },
        { move: 'c6', weight: 15, eco: 'B10', name: 'Caro-Kann Defense' },
        { move: 'e6', weight: 10, eco: 'C00', name: 'French Defense' },
        { move: 'd6', weight: 5, eco: 'B07', name: 'Pirc Defense' },
      ],

      // After 1. e4 e5
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6': [
        { move: 'Nf3', weight: 70, eco: 'C40', name: "King's Knight Opening" },
        { move: 'Bc4', weight: 15, eco: 'C23', name: "Bishop's Opening" },
        { move: 'Nc3', weight: 10, eco: 'C25', name: 'Vienna Game' },
        { move: 'd4', weight: 5, eco: 'C21', name: 'Center Game' },
      ],

      // After 1. e4 e5 2. Nf3
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': [
        { move: 'Nc6', weight: 80, eco: 'C40', name: "King's Knight Opening" },
        { move: 'Nf6', weight: 15, eco: 'C42', name: 'Petrov Defense' },
        { move: 'd6', weight: 5, eco: 'C41', name: 'Philidor Defense' },
      ],

      // After 1. e4 e5 2. Nf3 Nc6
      'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': [
        { move: 'Bb5', weight: 50, eco: 'C60', name: 'Ruy Lopez' },
        { move: 'Bc4', weight: 30, eco: 'C50', name: 'Italian Game' },
        { move: 'd4', weight: 15, eco: 'C44', name: 'Scotch Game' },
        { move: 'Nc3', weight: 5, eco: 'C46', name: 'Four Knights Game' },
      ],

      // After 1. d4
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3': [
        { move: 'Nf6', weight: 45, eco: 'E00', name: 'Indian Defense' },
        { move: 'd5', weight: 40, eco: 'D00', name: "Queen's Pawn Game" },
        { move: 'e6', weight: 10, eco: 'A40', name: 'Horwitz Defense' },
        { move: 'c5', weight: 5, eco: 'A40', name: 'Benoni Defense' },
      ],

      // After 1. d4 d5
      'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6': [
        { move: 'c4', weight: 70, eco: 'D06', name: "Queen's Gambit" },
        { move: 'Nf3', weight: 20, eco: 'D02', name: 'London System' },
        { move: 'Bf4', weight: 10, eco: 'D00', name: 'London System' },
      ],

      // After 1. d4 Nf6
      'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': [
        { move: 'c4', weight: 60, eco: 'E00', name: 'Indian Game' },
        { move: 'Nf3', weight: 30, eco: 'A45', name: 'Indian Game' },
        { move: 'Bg5', weight: 10, eco: 'A45', name: 'Trompowsky Attack' },
      ],
    },
  };

  book.loadData(defaultData);
  return book;
}
