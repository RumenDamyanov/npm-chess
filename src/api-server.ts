/**
 * REST API Server for npm-chess
 *
 * Provides HTTP API endpoints for game management, move execution,
 * and position analysis.
 */

import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { randomUUID } from 'crypto';
import { Game } from './engine/game';
import { PgnParser } from './engine/pgn';
import type { AIDifficulty } from './ai/engine';
import type { Square } from './types';
import { MinimaxAI, createDefaultOpeningBook } from './ai';

// Use crypto.randomUUID instead of uuid package to avoid ESM issues in Jest
const uuidv4 = randomUUID;

// ==================== TYPES ====================

export interface ApiConfig {
  port?: number;
  cors?: cors.CorsOptions;
  compression?: boolean;
}

export interface GameResponse {
  id: string;
  fen: string;
  pgn: string;
  turn: 'white' | 'black';
  gameOver: boolean;
  winner: 'white' | 'black' | null;
  checkmate: boolean;
  stalemate: boolean;
  check: boolean;
  inThreefoldRepetition: boolean;
  inFiftyMoveRule: boolean;
  moveHistory: MoveRecord[];
  aiEnabled: boolean;
  aiDifficulty: AIDifficulty | null;
  useOpeningBook: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoveRecord {
  from: string;
  to: string;
  piece: string;
  capturedPiece: string | null;
  promotion: string | null;
  san: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}

// ==================== API SERVER ====================

export class ApiServer {
  private app: Express;
  private games: Map<string, Game>;
  private gameMetadata: Map<string, GameMetadata>;

  constructor(config: ApiConfig = {}) {
    this.app = express();
    this.games = new Map();
    this.gameMetadata = new Map();

    this.setupMiddleware(config);
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Set up Express middleware
   */
  private setupMiddleware(config: ApiConfig): void {
    // CORS
    const corsConfig = config.cors;
    if (corsConfig !== undefined) {
      this.app.use(
        cors(
          corsConfig || {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
          }
        )
      );
    }

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Compression
    if (config.compression !== false) {
      this.app.use(compression());
    }

    // Request logging (development)
    if (process.env['NODE_ENV'] !== 'production') {
      this.app.use((req, _res, next) => {
        // eslint-disable-next-line no-console
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  /**
   * Set up API routes
   */
  private setupRoutes(): void {
    const router = express.Router();

    // Health & Info
    router.get('/health', this.getHealth.bind(this));
    router.get('/version', this.getVersion.bind(this));

    // Game Management
    router.post('/games', this.createGame.bind(this));
    router.get('/games/:id', this.getGame.bind(this));
    router.get('/games', this.listGames.bind(this));
    router.delete('/games/:id', this.deleteGame.bind(this));

    // Move Operations
    router.post('/games/:id/moves', this.makeMove.bind(this));
    router.get('/games/:id/moves', this.getMoveHistory.bind(this));
    router.post('/games/:id/undo', this.undoMove.bind(this));

    // AI Operations
    router.post('/games/:id/ai-move', this.getAIMove.bind(this));
    router.post('/games/:id/ai-hint', this.getAIHint.bind(this));

    // Analysis
    router.get('/games/:id/analysis', this.getAnalysis.bind(this));
    router.get('/games/:id/legal-moves', this.getLegalMoves.bind(this));
    router.post('/games/:id/fen', this.loadFromFEN.bind(this));
    router.get('/games/:id/pgn', this.getPGN.bind(this));

    // Mount router
    this.app.use('/api/v1', router);
  }

  /**
   * Set up error handling middleware
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res
        .status(404)
        .json(
          this.createErrorResponse(
            'Not Found',
            'ENDPOINT_NOT_FOUND',
            `Endpoint ${req.method} ${req.path} not found`
          )
        );
    });

    // Global error handler
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      res
        .status(500)
        .json(this.createErrorResponse('Internal Server Error', 'INTERNAL_ERROR', err.message));
    });
  }

  // ==================== ROUTE HANDLERS ====================

  /**
   * GET /health - Health check
   */
  private getHealth(_req: Request, res: Response): void {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      gamesActive: this.games.size,
    });
  }

  /**
   * GET /version - Version info
   */
  private getVersion(_req: Request, res: Response): void {
    res.json({
      api: '1.0.0',
      engine: '1.0.0',
      node: process.version,
    });
  }

  /**
   * POST /games - Create new game
   */
  private createGame(req: Request, res: Response): void {
    try {
      const { fen, aiEnabled, aiDifficulty, useOpeningBook } = req.body;

      // Create game
      const game = new Game();
      if (fen) {
        try {
          game.loadFen(fen);
        } catch (error) {
          res
            .status(400)
            .json(
              this.createErrorResponse(
                'Invalid FEN string',
                'INVALID_FEN',
                error instanceof Error ? error.message : 'Unknown error'
              )
            );
          return;
        }
      }

      // Generate ID and store
      const gameId = uuidv4();
      this.games.set(gameId, game);
      this.gameMetadata.set(gameId, {
        aiEnabled: aiEnabled ?? false,
        aiDifficulty: aiDifficulty ?? null,
        useOpeningBook: useOpeningBook !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Return response
      res.status(201).json(this.gameToResponse(gameId, game));
    } catch (error) {
      res
        .status(500)
        .json(
          this.createErrorResponse(
            'Failed to create game',
            'INTERNAL_ERROR',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  /**
   * GET /games/:id - Get game state
   */
  private getGame(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res
        .status(404)
        .json(
          this.createErrorResponse(
            'Game not found',
            'GAME_NOT_FOUND',
            `Game with ID ${id} does not exist`
          )
        );
      return;
    }

    res.json(this.gameToResponse(id, game));
  }

  /**
   * GET /games - List all games
   */
  private listGames(req: Request, res: Response): void {
    const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
    const offset = parseInt(req.query['offset'] as string) || 0;
    const status = req.query['status'] as string;

    // Get all games
    let games: Array<{ id: string; game: Game }> = [];
    for (const [id, game] of this.games.entries()) {
      if (status) {
        const isActive = !game.isGameOver();
        if (status === 'active' && !isActive) continue;
        if (status === 'finished' && isActive) continue;
      }
      games.push({ id, game });
    }

    // Apply pagination
    const total = games.length;
    games = games.slice(offset, offset + limit);

    res.json({
      games: games.map(({ id, game }) => this.gameToResponse(id, game)),
      total,
      limit,
      offset,
    });
  }

  /**
   * DELETE /games/:id - Delete game
   */
  private deleteGame(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    if (!this.games.has(id)) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    this.games.delete(id);
    this.gameMetadata.delete(id);

    res.status(204).send();
  }

  /**
   * POST /games/:id/moves - Make a move
   */
  private makeMove(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    const { from, to, promotion } = req.body;
    if (!from || !to) {
      res
        .status(400)
        .json(
          this.createErrorResponse(
            'Missing required move parameters',
            'INVALID_INPUT',
            'Both "from" and "to" are required'
          )
        );
      return;
    }

    // Check if game is over
    if (game.isGameOver()) {
      res.status(409).json(this.createErrorResponse('Game is already over', 'GAME_OVER'));
      return;
    }

    // Make the move
    const move = game.move({ from, to, promotion });
    if (!move) {
      res
        .status(400)
        .json(
          this.createErrorResponse(
            'Invalid move',
            'INVALID_MOVE',
            `Cannot move from ${from} to ${to}`
          )
        );
      return;
    }

    // Update metadata
    const metadata = this.gameMetadata.get(id);
    if (metadata) {
      metadata.updatedAt = new Date();
    }

    // Return updated game state
    res.json(this.gameToResponse(id, game));
  }

  /**
   * GET /games/:id/moves - Get move history
   */
  private getMoveHistory(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    const history = game.getHistory().map((move) => ({
      from: move.from,
      to: move.to,
      piece: move.piece.type,
      capturedPiece: move.captured ? move.captured.type : null,
      promotion: move.promotion ?? null,
      san: move.san ?? '',
      timestamp: new Date().toISOString(),
    }));

    res.json({ moves: history });
  }

  /**
   * POST /games/:id/undo - Undo last move
   */
  private undoMove(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    const undoneMove = game.undo();
    if (!undoneMove) {
      res
        .status(400)
        .json(
          this.createErrorResponse('No moves to undo', 'NO_MOVES', 'The game has no moves to undo')
        );
      return;
    }

    // Update metadata
    const metadata = this.gameMetadata.get(id);
    if (metadata) {
      metadata.updatedAt = new Date();
    }

    res.json(this.gameToResponse(id, game));
  }

  /**
   * POST /games/:id/ai-move - Get AI move
   */
  private async getAIMove(req: Request, res: Response): Promise<void> {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    if (game.isGameOver()) {
      res.status(409).json(this.createErrorResponse('Game is already over', 'GAME_OVER'));
      return;
    }

    try {
      // Get AI configuration from request or game metadata
      const { difficulty, thinkingTime, useOpeningBook } = req.body;
      const metadata = this.gameMetadata.get(id);

      const aiDifficulty: AIDifficulty = difficulty ?? metadata?.aiDifficulty ?? 'medium';
      const aiThinkingTime = thinkingTime ?? 5000;
      const useBook =
        useOpeningBook !== undefined ? useOpeningBook : (metadata?.useOpeningBook ?? true);

      // Use AI to find best move
      const startTime = Date.now();
      let openingName: string | undefined;
      let eco: string | undefined;

      // Check opening book first if enabled
      if (useBook && game.getHistory().length < 10) {
        const openingBook = createDefaultOpeningBook();
        const bookMove = openingBook.getMove(game);
        if (bookMove) {
          openingName = bookMove.name;
          eco = bookMove.eco;
          // Note: Opening book moves are SAN strings, we need to use AI anyway
          // In a future version, we could parse SAN and find the matching legal move
        }
      }

      // Use AI engine to get best move
      const ai = new MinimaxAI({
        difficulty: aiDifficulty,
        maxThinkingTime: aiThinkingTime,
      });
      const analysis = await ai.analyze(game);
      const aiMove = analysis.bestMove;

      const thinkingTimeActual = Date.now() - startTime;

      // Make the move
      const executedMove = game.move(aiMove);
      if (!executedMove) {
        res
          .status(500)
          .json(
            this.createErrorResponse(
              'AI move execution failed',
              'AI_ERROR',
              'The AI selected an invalid move'
            )
          );
        return;
      }

      // Update metadata
      if (metadata) {
        metadata.updatedAt = new Date();
      }

      // Return response with AI metrics
      res.json({
        ...this.gameToResponse(id, game),
        aiMetrics: {
          thinkingTime: thinkingTimeActual,
          difficulty: aiDifficulty,
          depth: analysis?.depth || 0,
          nodesEvaluated: analysis?.nodesEvaluated || 0,
          evaluation: analysis?.score || 0,
          openingName,
          eco,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json(
          this.createErrorResponse(
            'AI move generation failed',
            'AI_ERROR',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  /**
   * POST /games/:id/ai-hint - Get AI hint
   */
  private async getAIHint(req: Request, res: Response): Promise<void> {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    if (game.isGameOver()) {
      res.status(409).json(this.createErrorResponse('Game is already over', 'GAME_OVER'));
      return;
    }

    try {
      // Get AI configuration from request
      const { difficulty, thinkingTime, useOpeningBook } = req.body;
      const metadata = this.gameMetadata.get(id);

      const aiDifficulty: AIDifficulty = difficulty ?? metadata?.aiDifficulty ?? 'medium';
      const aiThinkingTime = thinkingTime ?? 5000;
      const useBook =
        useOpeningBook !== undefined ? useOpeningBook : (metadata?.useOpeningBook ?? true);

      // Use AI to find best move
      const startTime = Date.now();
      let openingName: string | undefined;
      let eco: string | undefined;

      // Check opening book first if enabled
      if (useBook && game.getHistory().length < 10) {
        const openingBook = createDefaultOpeningBook();
        const bookMove = openingBook.getMove(game);
        if (bookMove) {
          openingName = bookMove.name;
          eco = bookMove.eco;
          // Note: Opening book moves are SAN strings, we need to use AI anyway
          // In a future version, we could parse SAN and find the matching legal move
        }
      }

      // Use AI engine to get best move
      const ai = new MinimaxAI({
        difficulty: aiDifficulty,
        maxThinkingTime: aiThinkingTime,
      });
      const analysis = await ai.analyze(game);
      const suggestedMove = analysis.bestMove;

      const thinkingTimeActual = Date.now() - startTime;

      // Generate explanation
      let explanation = `Best move: ${suggestedMove.san ?? `${suggestedMove.from}-${suggestedMove.to}`}`;
      if (openingName) {
        explanation += ` (Opening: ${openingName})`;
      } else {
        const scoreText =
          analysis.score > 0
            ? `+${(analysis.score / 100).toFixed(2)}`
            : (analysis.score / 100).toFixed(2);
        explanation += ` (Evaluation: ${scoreText})`;
      }

      // Return hint without making the move
      res.json({
        suggestedMove: {
          from: suggestedMove.from,
          to: suggestedMove.to,
          promotion: suggestedMove.promotion,
          san: suggestedMove.san,
        },
        explanation,
        aiMetrics: {
          thinkingTime: thinkingTimeActual,
          difficulty: aiDifficulty,
          depth: analysis?.depth || 0,
          nodesEvaluated: analysis?.nodesEvaluated || 0,
          evaluation: analysis?.score || 0,
          openingName,
          eco,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json(
          this.createErrorResponse(
            'AI hint generation failed',
            'AI_ERROR',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  /**
   * GET /games/:id/analysis - Get position analysis
   */
  private async getAnalysis(req: Request, res: Response): Promise<void> {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    try {
      const difficulty = (req.query['difficulty'] as AIDifficulty) || 'expert';
      const thinkingTime = parseInt(req.query['thinkingTime'] as string) || 10000;

      const ai = new MinimaxAI({
        difficulty,
        maxThinkingTime: thinkingTime,
      });

      const analysis = await ai.analyze(game);

      res.json({
        evaluation: analysis.score / 100, // Convert centipawns to pawns
        bestMove: {
          from: analysis.bestMove.from,
          to: analysis.bestMove.to,
          promotion: analysis.bestMove.promotion,
          san: analysis.bestMove.san,
        },
        depth: analysis.depth,
        nodesEvaluated: analysis.nodesEvaluated,
        thinkingTime: analysis.thinkingTime,
        principalVariation: analysis.principalVariation
          ?.slice(0, 5)
          .map((move) => move.san ?? `${move.from}-${move.to}`),
      });
    } catch (error) {
      res
        .status(500)
        .json(
          this.createErrorResponse(
            'Position analysis failed',
            'AI_ERROR',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  /**
   * GET /games/:id/legal-moves - Get legal moves
   */
  private getLegalMoves(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    const from = req.query['from'] as string | undefined;

    let moves;
    if (from) {
      // Get moves from specific square
      moves = game.getLegalMovesFrom(from as Square);
    } else {
      // Get all legal moves
      moves = game.getLegalMoves();
    }

    const legalMoves = moves.map((move) => ({
      from: move.from,
      to: move.to,
      san: move.san ?? '',
    }));

    res.json({ moves: legalMoves });
  }

  /**
   * POST /games/:id/fen - Load from FEN
   */
  private loadFromFEN(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    const { fen } = req.body;
    if (!fen) {
      res
        .status(400)
        .json(
          this.createErrorResponse('Missing FEN string', 'INVALID_INPUT', 'FEN string is required')
        );
      return;
    }

    try {
      game.loadFen(fen);

      // Update metadata
      const metadata = this.gameMetadata.get(id);
      if (metadata) {
        metadata.updatedAt = new Date();
      }

      res.json(this.gameToResponse(id, game));
    } catch (error) {
      res
        .status(400)
        .json(
          this.createErrorResponse(
            'Invalid FEN string',
            'INVALID_FEN',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  /**
   * GET /games/:id/pgn - Get PGN
   */
  private getPGN(req: Request, res: Response): void {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json(this.createErrorResponse('Missing game ID', 'MISSING_ID'));
      return;
    }

    const game = this.games.get(id);
    if (!game) {
      res.status(404).json(this.createErrorResponse('Game not found', 'GAME_NOT_FOUND'));
      return;
    }

    // Generate PGN from move history
    const history = game.getHistory();
    const status = game.getStatus();

    // PGN header
    let pgn = '[Event "Chess Game"]\n';
    pgn += `[Date "${new Date().toISOString().split('T')[0]}"]\n`;
    pgn += '[White "Player"]\n';
    pgn += '[Black "Player"]\n';

    // Result
    let result = '*';
    if (status === 'checkmate') {
      result = game.getTurn() === 'white' ? '0-1' : '1-0';
    } else if (
      status === 'stalemate' ||
      status === 'fifty_move_rule' ||
      status === 'threefold_repetition' ||
      status === 'insufficient_material'
    ) {
      result = '1/2-1/2';
    }
    pgn += `[Result "${result}"]\n\n`;

    // Moves
    let moveNumber = 1;
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      if (!move) continue;

      if (i % 2 === 0) {
        pgn += `${moveNumber}. `;
      }
      pgn += move.san ?? '';
      if (i % 2 === 1) {
        pgn += ' ';
        moveNumber++;
      } else {
        pgn += ' ';
      }
    }
    pgn += result;

    res.setHeader('Content-Type', 'text/plain');
    res.send(pgn);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convert game to API response format
   */
  private gameToResponse(id: string, game: Game): GameResponse {
    const metadata = this.gameMetadata.get(id) ?? {
      aiEnabled: false,
      aiDifficulty: null,
      useOpeningBook: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const status = game.getStatus();
    const turn = game.getTurn();

    // Generate PGN with basic tags
    const dateStr = new Date().toISOString().split('T')[0];
    const pgn = PgnParser.generate(game, {
      Event: 'Casual Game',
      Site: 'npm-chess API',
      Date: dateStr ? dateStr.replace(/-/g, '.') : '????.??.??',
      White: 'Player 1',
      Black: 'Player 2',
    });

    return {
      id,
      fen: game.getFen(),
      pgn,
      turn,
      gameOver: game.isGameOver(),
      winner: status === 'checkmate' ? (turn === 'white' ? 'black' : 'white') : null,
      checkmate: status === 'checkmate',
      stalemate: status === 'stalemate',
      check: game.isInCheck(),
      inThreefoldRepetition: status === 'threefold_repetition',
      inFiftyMoveRule: status === 'fifty_move_rule',
      moveHistory: game.getHistory().map((move) => ({
        from: move.from,
        to: move.to,
        piece: move.piece.type,
        capturedPiece: move.captured ? move.captured.type : null,
        promotion: move.promotion ?? null,
        san: move.san ?? '',
        timestamp: new Date().toISOString(),
      })),
      aiEnabled: metadata.aiEnabled,
      aiDifficulty: metadata.aiDifficulty,
      useOpeningBook: metadata.useOpeningBook,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: string, code: string, details?: string): ErrorResponse {
    return {
      error,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== PUBLIC API ====================

  /**
   * Start the API server
   */
  public listen(port: number, callback?: () => void): void {
    this.app.listen(port, callback);
  }

  /**
   * Get Express app instance (for testing)
   */
  public getApp(): Express {
    return this.app;
  }
}

// ==================== GAME METADATA ====================

interface GameMetadata {
  aiEnabled: boolean;
  aiDifficulty: AIDifficulty | null;
  useOpeningBook: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== EXPORTS ====================

export default ApiServer;
