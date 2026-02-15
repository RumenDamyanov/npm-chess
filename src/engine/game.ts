/**
 * Game State Management
 *
 * Manages complete chess game state including board, moves, history, and rules.
 *
 * @module engine/game
 */

import type {
  Color,
  GameStatus,
  Move,
  MoveOptions,
  CastlingRights,
  Square,
  GameConfig,
  Piece,
} from '@/types/index';
import { Board } from './board';
import { MoveGenerator } from './moves';
import { isKingInCheck } from './pieces';
import { FenParser } from './fen';

/**
 * Game class
 *
 * Manages the complete state of a chess game including board position,
 * turn management, move history, and game status.
 */
export class Game {
  private board: Board;
  private moveGenerator: MoveGenerator;
  private currentTurn: Color;
  private moveHistory: Move[];
  private castlingRights: CastlingRights;
  private enPassantSquare: Square | null;
  private halfMoveClock: number; // For fifty-move rule
  private fullMoveNumber: number; // Starts at 1, increments after black's move
  private gameStatus: GameStatus;
  private positionHistory: Map<string, number>; // For threefold repetition

  /**
   * Create a new game
   *
   * @param config - Optional game configuration
   */
  constructor(config?: GameConfig) {
    this.board = new Board();
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.castlingRights = {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    };
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameStatus = 'active';
    this.positionHistory = new Map();

    // Set up starting position unless FEN is provided
    if (!config?.fen) {
      this.board.setupStartingPosition();
      this.recordPosition();
    }

    this.moveGenerator = new MoveGenerator(this.board, this.castlingRights, this.enPassantSquare);
  }

  /**
   * Make a move
   *
   * @param moveOptions - Move to make
   * @returns The executed move or null if invalid
   */
  public move(moveOptions: MoveOptions): Move | null {
    // Validate the move
    const validation = this.moveGenerator.validateMove(moveOptions, this.currentTurn);
    if (!validation.valid) {
      return null;
    }

    const { from, to, promotion } = moveOptions;
    const piece = this.board.getPiece(from);
    if (!piece) return null;

    const capturedPiece = this.board.getPiece(to);

    // Handle special moves
    const isEnPassant = this.isEnPassantCapture(from, to);
    const isCastling = this.isCastlingMove(from, to);

    // Build the move object
    const move: Move = {
      from,
      to,
      piece,
      captured: capturedPiece ?? undefined,
      promotion,
      enPassant: isEnPassant ?? undefined,
      castling: isCastling ?? undefined,
    };

    // Generate SAN notation before executing the move
    let san = this.generateSan(move);

    // Execute the move
    this.executeMove(move);

    // Update game state
    this.updateGameState(move);

    // Record the position for repetition detection
    this.recordPosition();

    // Check game ending conditions
    this.updateGameStatus();

    // Add check/checkmate indicators after game status is updated
    const opponent = this.currentTurn;
    const isCheck = isKingInCheck(this.board, opponent);
    const isCheckmate = this.gameStatus === 'checkmate';

    if (isCheckmate) {
      san += '#';
      move.checkmate = true;
    } else if (isCheck) {
      san += '+';
      move.check = true;
    }

    // Add SAN to the move
    move.san = san;

    // Add move to history
    this.moveHistory.push(move);

    return move;
  }

  /**
   * Get all legal moves for the current player
   *
   * @returns Array of legal moves
   */
  public getLegalMoves(): Move[] {
    return this.moveGenerator.generateLegalMoves(this.currentTurn);
  }

  /**
   * Get legal moves from a specific square
   *
   * @param square - Square to get moves from
   * @returns Array of legal moves
   */
  public getLegalMovesFrom(square: Square): Move[] {
    return this.moveGenerator.generateLegalMovesFrom(square, this.currentTurn);
  }

  /**
   * Undo the last move
   *
   * @returns The undone move or null if no moves to undo
   */
  public undo(): Move | null {
    if (this.moveHistory.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const move = this.moveHistory.pop()!;

    // Restore the piece to its original position
    this.board.setPiece(move.from, move.piece);

    // Handle captures
    if (move.captured) {
      if (move.enPassant) {
        // En passant: restore captured pawn to its actual square
        const capturedPawnRank = move.piece.color === 'white' ? '5' : '4';
        const file = move.to.charAt(0);
        this.board.setPiece(`${file}${capturedPawnRank}` as Square, move.captured);
        this.board.setPiece(move.to, null);
      } else {
        // Normal capture: restore captured piece
        this.board.setPiece(move.to, move.captured);
      }
    } else {
      // No capture: clear destination square
      this.board.setPiece(move.to, null);
    }

    // Handle castling
    if (move.castling) {
      this.undoCastling(move);
    }

    // Restore game state from previous move or initial state
    if (this.moveHistory.length > 0) {
      const previousMove = this.moveHistory[this.moveHistory.length - 1];
      if (previousMove) {
        this.restoreGameStateFromMove(previousMove);
      }
    } else {
      this.restoreInitialGameState();
    }

    // Switch turn back
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

    // Update move generator
    this.moveGenerator = new MoveGenerator(this.board, this.castlingRights, this.enPassantSquare);

    // Update game status
    this.updateGameStatus();

    return move;
  }

  /**
   * Get current game status
   *
   * @returns Current game status
   */
  public getStatus(): GameStatus {
    return this.gameStatus;
  }

  /**
   * Get current turn
   *
   * @returns Color of current player
   */
  public getTurn(): Color {
    return this.currentTurn;
  }

  /**
   * Get move history
   *
   * @returns Array of all moves played
   */
  public getHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get current board
   *
   * @returns The current board
   */
  public getBoard(): Board {
    return this.board;
  }

  /**
   * Get current position
   *
   * @returns Position object with all game state
   */
  public getPosition(): {
    board: (Piece | null)[][];
    turn: Color;
    castlingRights: CastlingRights;
    enPassantSquare: Square | null;
    halfMoveClock: number;
    fullMoveNumber: number;
  } {
    return {
      board: this.board.getBoard(),
      turn: this.currentTurn,
      castlingRights: { ...this.castlingRights },
      enPassantSquare: this.enPassantSquare,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
    };
  }

  /**
   * Check if the game is over
   *
   * @returns True if game is over
   */
  public isGameOver(): boolean {
    return this.gameStatus !== 'active' && this.gameStatus !== 'check';
  }

  /**
   * Check if current player is in check
   *
   * @returns True if in check
   */
  public isInCheck(): boolean {
    return isKingInCheck(this.board, this.currentTurn);
  }

  /**
   * Get castling rights
   *
   * @returns Current castling rights
   */
  public getCastlingRights(): CastlingRights {
    return { ...this.castlingRights };
  }

  /**
   * Get en passant target square
   *
   * @returns En passant square or null
   */
  public getEnPassantSquare(): Square | null {
    return this.enPassantSquare;
  }

  /**
   * Get half move clock (for fifty-move rule)
   *
   * @returns Number of half moves since last capture or pawn move
   */
  public getHalfMoveClock(): number {
    return this.halfMoveClock;
  }

  /**
   * Get full move number
   *
   * @returns Current full move number
   */
  public getFullMoveNumber(): number {
    return this.fullMoveNumber;
  }

  /**
   * Reset the game to starting position
   */
  public reset(): void {
    this.board.setupStartingPosition();
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.castlingRights = {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    };
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameStatus = 'active';
    this.positionHistory.clear();
    this.recordPosition();
    this.moveGenerator = new MoveGenerator(this.board, this.castlingRights, this.enPassantSquare);
  }

  /**
   * Refresh the move generator (useful after manual board changes)
   */
  public refreshMoveGenerator(): void {
    this.moveGenerator = new MoveGenerator(this.board, this.castlingRights, this.enPassantSquare);
    this.updateGameStatus();
  }

  /**
   * Load a position from FEN notation
   *
   * @param fen - FEN string to load
   */
  public loadFen(fen: string): void {
    const data = FenParser.parse(fen);

    this.board = data.board;
    this.currentTurn = data.turn;
    this.castlingRights = data.castlingRights;
    this.enPassantSquare = data.enPassantSquare;
    this.halfMoveClock = data.halfMoveClock;
    this.fullMoveNumber = data.fullMoveNumber;
    this.moveHistory = [];
    this.gameStatus = 'active';
    this.positionHistory.clear();
    this.recordPosition();

    this.moveGenerator = new MoveGenerator(this.board, this.castlingRights, this.enPassantSquare);
    this.updateGameStatus();
  }

  /**
   * Get the current position as FEN notation
   *
   * @returns FEN string representing the current position
   */
  public getFen(): string {
    return FenParser.generate(
      this.board,
      this.currentTurn,
      this.castlingRights,
      this.enPassantSquare,
      this.halfMoveClock,
      this.fullMoveNumber
    );
  }

  /**
   * Execute a move on the board
   *
   * @param move - Move to execute
   */
  private executeMove(move: Move): void {
    // Handle en passant capture
    if (move.enPassant) {
      const capturedPawnRank = move.piece.color === 'white' ? '5' : '4';
      const file = move.to.charAt(0);
      this.board.setPiece(`${file}${capturedPawnRank}` as Square, null);
    }

    // Handle castling
    if (move.castling) {
      this.executeCastling(move);
      return;
    }

    // Handle promotion
    if (move.promotion) {
      this.board.setPiece(move.to, { type: move.promotion, color: move.piece.color });
      this.board.setPiece(move.from, null);
    } else {
      // Normal move
      this.board.movePiece(move.from, move.to);
    }
  }

  /**
   * Execute castling move
   *
   * @param move - Castling move
   */
  private executeCastling(move: Move): void {
    // Move the king
    this.board.movePiece(move.from, move.to);

    // Move the rook
    const rank = move.piece.color === 'white' ? '1' : '8';
    if (move.castling === 'kingside') {
      this.board.movePiece(`h${rank}` as Square, `f${rank}` as Square);
    } else {
      this.board.movePiece(`a${rank}` as Square, `d${rank}` as Square);
    }
  }

  /**
   * Undo castling move
   *
   * @param move - Castling move to undo
   */
  private undoCastling(move: Move): void {
    const rank = move.piece.color === 'white' ? '1' : '8';
    if (move.castling === 'kingside') {
      // Move rook back
      this.board.movePiece(`f${rank}` as Square, `h${rank}` as Square);
    } else {
      // Move rook back
      this.board.movePiece(`d${rank}` as Square, `a${rank}` as Square);
    }
  }

  /**
   * Update game state after a move
   *
   * @param move - The move that was made
   */
  private updateGameState(move: Move): void {
    // Update half move clock
    if (move.piece.type === 'pawn' || move.captured) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    // Update en passant square
    if (move.piece.type === 'pawn') {
      const fromRank = parseInt(move.from.charAt(1));
      const toRank = parseInt(move.to.charAt(1));
      if (Math.abs(toRank - fromRank) === 2) {
        // Pawn moved two squares
        const targetRank = move.piece.color === 'white' ? fromRank + 1 : fromRank - 1;
        this.enPassantSquare = `${move.from.charAt(0)}${targetRank}` as Square;
      } else {
        this.enPassantSquare = null;
      }
    } else {
      this.enPassantSquare = null;
    }

    // Update castling rights
    this.updateCastlingRights(move);

    // Update turn and move number
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    if (this.currentTurn === 'white') {
      this.fullMoveNumber++;
    }

    // Update move generator with new state
    this.moveGenerator = new MoveGenerator(this.board, this.castlingRights, this.enPassantSquare);
  }

  /**
   * Update castling rights based on a move
   *
   * @param move - The move that was made
   */
  private updateCastlingRights(move: Move): void {
    // King moves lose both castling rights
    if (move.piece.type === 'king') {
      if (move.piece.color === 'white') {
        this.castlingRights.whiteKingside = false;
        this.castlingRights.whiteQueenside = false;
      } else {
        this.castlingRights.blackKingside = false;
        this.castlingRights.blackQueenside = false;
      }
    }

    // Rook moves lose castling rights for that side
    if (move.piece.type === 'rook') {
      if (move.from === 'a1') this.castlingRights.whiteQueenside = false;
      if (move.from === 'h1') this.castlingRights.whiteKingside = false;
      if (move.from === 'a8') this.castlingRights.blackQueenside = false;
      if (move.from === 'h8') this.castlingRights.blackKingside = false;
    }

    // Capturing a rook loses castling rights
    if (move.captured?.type === 'rook') {
      if (move.to === 'a1') this.castlingRights.whiteQueenside = false;
      if (move.to === 'h1') this.castlingRights.whiteKingside = false;
      if (move.to === 'a8') this.castlingRights.blackQueenside = false;
      if (move.to === 'h8') this.castlingRights.blackKingside = false;
    }
  }

  /**
   * Update game status (check for checkmate, stalemate, draw)
   */
  private updateGameStatus(): void {
    // Check for checkmate
    if (this.moveGenerator.isCheckmate(this.currentTurn)) {
      this.gameStatus = 'checkmate';
      return;
    }

    // Check for stalemate
    if (this.moveGenerator.isStalemate(this.currentTurn)) {
      this.gameStatus = 'stalemate';
      return;
    }

    // Check for fifty-move rule
    if (this.halfMoveClock >= 100) {
      // 50 full moves = 100 half moves
      this.gameStatus = 'fifty_move_rule';
      return;
    }

    // Check for threefold repetition
    const currentPosition = this.getPositionKey();
    const repetitions = this.positionHistory.get(currentPosition) ?? 0;
    if (repetitions >= 3) {
      this.gameStatus = 'threefold_repetition';
      return;
    }

    // Check for insufficient material
    if (this.isInsufficientMaterial()) {
      this.gameStatus = 'insufficient_material';
      return;
    }

    // Check if in check
    if (this.isInCheck()) {
      this.gameStatus = 'check';
      return;
    }

    this.gameStatus = 'active';
  }

  /**
   * Check if move is en passant capture
   *
   * @param from - Starting square
   * @param to - Destination square
   * @returns True if en passant
   */
  private isEnPassantCapture(from: Square, to: Square): boolean {
    const piece = this.board.getPiece(from);
    return piece?.type === 'pawn' && to === this.enPassantSquare && this.enPassantSquare !== null;
  }

  /**
   * Check if move is castling
   *
   * @param from - Starting square
   * @param to - Destination square
   * @returns Castling type or undefined
   */
  private isCastlingMove(from: Square, to: Square): 'kingside' | 'queenside' | undefined {
    const piece = this.board.getPiece(from);
    if (piece?.type !== 'king') return undefined;

    const fromFile = from.charAt(0);
    const toFile = to.charAt(0);

    if (fromFile === 'e' && toFile === 'g') return 'kingside';
    if (fromFile === 'e' && toFile === 'c') return 'queenside';

    return undefined;
  }

  /**
   * Record current position for repetition detection
   */
  private recordPosition(): void {
    const key = this.getPositionKey();
    const count = this.positionHistory.get(key) ?? 0;
    this.positionHistory.set(key, count + 1);
  }

  /**
   * Get a unique key for the current position
   *
   * @returns Position key string
   */
  private getPositionKey(): string {
    // Simple key: board state + turn + castling + en passant
    const boardState = JSON.stringify(this.board.getBoard());
    return `${boardState}|${this.currentTurn}|${JSON.stringify(this.castlingRights)}|${this.enPassantSquare}`;
  }

  /**
   * Check if position has insufficient material for checkmate
   *
   * @returns True if insufficient material
   */
  private isInsufficientMaterial(): boolean {
    const pieces = [...this.board.findPieces('white'), ...this.board.findPieces('black')];

    // King vs King
    if (pieces.length === 2) return true;

    // King + Bishop/Knight vs King
    if (pieces.length === 3) {
      const nonKings = pieces.filter((p) => p.piece.type !== 'king');
      if (nonKings.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pieceType = nonKings[0]!.piece.type;
        return pieceType === 'bishop' || pieceType === 'knight';
      }
    }

    // King + Bishop vs King + Bishop (same color squares)
    if (pieces.length === 4) {
      const bishops = pieces.filter((p) => p.piece.type === 'bishop');
      if (bishops.length === 2) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const coords1 = this.board.squareToCoords(bishops[0]!.square);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const coords2 = this.board.squareToCoords(bishops[1]!.square);
        if (coords1 && coords2) {
          // Same color square if (row + col) have same parity
          const sameColor = (coords1.row + coords1.col) % 2 === (coords2.row + coords2.col) % 2;
          return sameColor;
        }
      }
    }

    return false;
  }

  /**
   * Restore game state from a move
   *
   * @param move - Move to restore state from
   */
  private restoreGameStateFromMove(move: Move): void {
    // This is a simplified restoration - in a full implementation,
    // you'd want to store more state with each move
    this.updateCastlingRights(move);
  }

  /**
   * Restore initial game state
   */
  private restoreInitialGameState(): void {
    this.castlingRights = {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    };
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
  }

  /**
   * Generate SAN (Standard Algebraic Notation) for a move
   *
   * @param move - Move to convert to SAN
   * @returns SAN string
   */
  private generateSan(move: Move): string {
    // Castling
    if (move.castling) {
      return move.castling === 'kingside' ? 'O-O' : 'O-O-O';
    }

    let san = '';

    // Piece notation (not for pawns)
    if (move.piece.type !== 'pawn') {
      const pieceMap: Record<string, string> = {
        king: 'K',
        queen: 'Q',
        rook: 'R',
        bishop: 'B',
        knight: 'N',
      };
      san += pieceMap[move.piece.type] ?? '';
    }

    // Disambiguation (if needed)
    const disambiguation = this.getDisambiguation(move);
    san += disambiguation;

    // Capture notation
    if (move.captured ?? move.enPassant) {
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

    // Check/checkmate indicators will be added after the move is executed

    return san;
  }

  /**
   * Get disambiguation string for a move
   *
   * @param move - Move to disambiguate
   * @returns Disambiguation string (file, rank, or both)
   */
  private getDisambiguation(move: Move): string {
    // Only needed for pieces other than pawns and kings
    if (move.piece.type === 'pawn' || move.piece.type === 'king') {
      return '';
    }

    // Find all pieces of the same type and color that can move to the destination
    const legalMoves = this.moveGenerator.generateLegalMoves(move.piece.color);
    const ambiguousMoves = legalMoves.filter(
      (m) => m.to === move.to && m.piece.type === move.piece.type && m.from !== move.from
    );

    if (ambiguousMoves.length === 0) {
      return '';
    }

    // Check if file disambiguation is sufficient
    const fromFile = move.from[0];
    const sameFile = ambiguousMoves.some((m) => m.from[0] === fromFile);

    if (!sameFile) {
      return fromFile ?? '';
    }

    // Check if rank disambiguation is sufficient
    const fromRank = move.from[1];
    const sameRank = ambiguousMoves.some((m) => m.from[1] === fromRank);

    if (!sameRank) {
      return fromRank ?? '';
    }

    // Need both file and rank
    return move.from;
  }
}
