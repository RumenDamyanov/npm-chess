/**
 * API Server Integration Tests
 *
 * Tests REST API endpoints using supertest
 */

import request from 'supertest';
import { ApiServer } from '../../src/api-server';
import type { Express } from 'express';

// Mock uuid to avoid ESM issues in Jest
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

describe('ApiServer', () => {
  let app: Express;
  let gameId: string;

  beforeAll(() => {
    const server = new ApiServer({ port: 0 });
    app = server.getApp();
  });

  describe('Health & Info Endpoints', () => {
    it('GET /health - should return health status', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('gamesActive');
      expect(typeof res.body.gamesActive).toBe('number');
    });

    it('GET /version - should return version info', async () => {
      const res = await request(app).get('/api/v1/version');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('api');
      expect(res.body).toHaveProperty('engine');
      expect(res.body).toHaveProperty('node');
    });
  });

  describe('Game Management Endpoints', () => {
    it('POST /games - should create a new game', async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .send({})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('fen');
      expect(res.body).toHaveProperty('turn', 'white');
      expect(res.body).toHaveProperty('gameOver', false);

      gameId = res.body.id; // Save for later tests
    });

    it('POST /games - should create game with custom FEN', async () => {
      const customFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const res = await request(app)
        .post('/api/v1/games')
        .send({ fen: customFen })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.fen).toBe(customFen);
      expect(res.body.turn).toBe('black');
    });

    it('POST /games - should reject invalid FEN', async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .send({ fen: 'invalid-fen' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('code', 'INVALID_FEN');
    });

    it('GET /games/:id - should get game by ID', async () => {
      const res = await request(app).get(`/api/v1/games/${gameId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', gameId);
      expect(res.body).toHaveProperty('fen');
      expect(res.body).toHaveProperty('turn');
    });

    it('GET /games/:id - should return 404 for non-existent game', async () => {
      const res = await request(app).get('/api/v1/games/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('GET /games - should list all games', async () => {
      const res = await request(app).get('/api/v1/games');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('games');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('offset');
      expect(Array.isArray(res.body.games)).toBe(true);
      expect(res.body.games.length).toBeGreaterThan(0);
    });

    it('GET /games - should support pagination', async () => {
      const res = await request(app).get('/api/v1/games?limit=1&offset=0');

      expect(res.status).toBe(200);
      expect(res.body.games.length).toBeLessThanOrEqual(1);
      expect(res.body.limit).toBe(1);
    });

    it('DELETE /games/:id - should delete a game', async () => {
      // Create a game to delete
      const createRes = await request(app)
        .post('/api/v1/games')
        .send({});
      const idToDelete = createRes.body.id;

      const res = await request(app).delete(`/api/v1/games/${idToDelete}`);

      expect(res.status).toBe(204);

      // Verify it's deleted
      const getRes = await request(app).get(`/api/v1/games/${idToDelete}`);
      expect(getRes.status).toBe(404);
    });

    it('DELETE /games/:id - should return 404 for non-existent game', async () => {
      const res = await request(app).delete('/api/v1/games/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  describe('Move Operations', () => {
    let moveGameId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .send({});
      moveGameId = res.body.id;
    });

    it('POST /games/:id/moves - should make a valid move', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${moveGameId}/moves`)
        .send({ from: 'e2', to: 'e4' });

      expect(res.status).toBe(200);
      expect(res.body.turn).toBe('black');
      expect(res.body.moveHistory).toHaveLength(1);
      expect(res.body.moveHistory[0].san).toBe('e4');
    });

    it('POST /games/:id/moves - should reject invalid move', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${moveGameId}/moves`)
        .send({ from: 'e2', to: 'e5' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_MOVE');
    });

    it('POST /games/:id/moves - should handle pawn promotion', async () => {
      // Set up position where pawn can promote
      const fenWithPromotion = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
      const createRes = await request(app)
        .post('/api/v1/games')
        .send({ fen: fenWithPromotion });
      const promGameId = createRes.body.id;

      const res = await request(app)
        .post(`/api/v1/games/${promGameId}/moves`)
        .send({ from: 'e7', to: 'e8', promotion: 'queen' });

      expect(res.status).toBe(200);
      expect(res.body.moveHistory[0].promotion).toBe('queen');
    });

    it('GET /games/:id/moves - should return move history', async () => {
      // Make a move first
      await request(app)
        .post(`/api/v1/games/${moveGameId}/moves`)
        .send({ from: 'e2', to: 'e4' });

      const res = await request(app).get(`/api/v1/games/${moveGameId}/moves`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('moves');
      expect(res.body.moves).toHaveLength(1);
    });

    it('POST /games/:id/undo - should undo last move', async () => {
      // Make a move
      await request(app)
        .post(`/api/v1/games/${moveGameId}/moves`)
        .send({ from: 'e2', to: 'e4' });

      const res = await request(app).post(`/api/v1/games/${moveGameId}/undo`);

      expect(res.status).toBe(200);
      expect(res.body.moveHistory).toHaveLength(0);
      expect(res.body.turn).toBe('white');
    });

    it('POST /games/:id/undo - should fail when no moves to undo', async () => {
      const res = await request(app).post(`/api/v1/games/${moveGameId}/undo`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_MOVES');
    });
  });

  describe('AI Operations', () => {
    let aiGameId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .send({ aiEnabled: true, aiDifficulty: 'easy' });
      aiGameId = res.body.id;
    });

    it('POST /games/:id/ai-move - should make AI move', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${aiGameId}/ai-move`)
        .send({ difficulty: 'easy', thinkingTime: 1000 });

      expect(res.status).toBe(200);
      expect(res.body.moveHistory).toHaveLength(1);
      expect(res.body).toHaveProperty('aiMetrics');
      expect(res.body.aiMetrics).toHaveProperty('thinkingTime');
      expect(res.body.aiMetrics).toHaveProperty('difficulty');
    }, 15000);

    it('POST /games/:id/ai-hint - should get AI hint without moving', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${aiGameId}/ai-hint`)
        .send({ difficulty: 'easy', thinkingTime: 1000 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('suggestedMove');
      expect(res.body).toHaveProperty('explanation');
      expect(res.body).toHaveProperty('aiMetrics');
      expect(res.body.suggestedMove).toHaveProperty('from');
      expect(res.body.suggestedMove).toHaveProperty('to');

      // Verify move wasn't made
      const gameRes = await request(app).get(`/api/v1/games/${aiGameId}`);
      expect(gameRes.body.moveHistory).toHaveLength(0);
    }, 15000);
  });

  describe('Analysis & Export', () => {
    let analysisGameId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .send({});
      analysisGameId = res.body.id;

      // Make a move for analysis
      await request(app)
        .post(`/api/v1/games/${analysisGameId}/moves`)
        .send({ from: 'e2', to: 'e4' });
    });

    it('GET /games/:id/analysis - should analyze position', async () => {
      const res = await request(app)
        .get(`/api/v1/games/${analysisGameId}/analysis`)
        .query({ difficulty: 'easy', thinkingTime: 1000 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('evaluation');
      expect(res.body).toHaveProperty('bestMove');
      expect(res.body).toHaveProperty('depth');
      expect(typeof res.body.evaluation).toBe('number');
    }, 15000);

    it('GET /games/:id/legal-moves - should return all legal moves', async () => {
      const res = await request(app).get(`/api/v1/games/${analysisGameId}/legal-moves`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('moves');
      expect(Array.isArray(res.body.moves)).toBe(true);
      expect(res.body.moves.length).toBeGreaterThan(0);
    });

    it('GET /games/:id/legal-moves - should filter by square', async () => {
      const res = await request(app)
        .get(`/api/v1/games/${analysisGameId}/legal-moves`)
        .query({ from: 'b8' });

      expect(res.status).toBe(200);
      expect(res.body.moves.length).toBeGreaterThan(0);
      res.body.moves.forEach((move: any) => {
        expect(move.from).toBe('b8');
      });
    });

    it('POST /games/:id/fen - should load position from FEN', async () => {
      const newFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const res = await request(app)
        .post(`/api/v1/games/${analysisGameId}/fen`)
        .send({ fen: newFen });

      expect(res.status).toBe(200);
      expect(res.body.fen).toBe(newFen);
      expect(res.body.turn).toBe('black');
    });

    it('POST /games/:id/fen - should reject invalid FEN', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${analysisGameId}/fen`)
        .send({ fen: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_FEN');
    });

    it('GET /games/:id/pgn - should export to PGN', async () => {
      const res = await request(app).get(`/api/v1/games/${analysisGameId}/pgn`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('[Event');
      expect(res.text).toContain('[Date');
      expect(res.text).toContain('1. e4');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/v1/unknown');

      expect(res.status).toBe(404);
    });

    it('should handle missing required parameters', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/moves`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_INPUT');
    });

    it('should prevent moves on completed games', async () => {
      // Create game in checkmate position
      const matePos = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
      const createRes = await request(app)
        .post('/api/v1/games')
        .send({ fen: matePos });
      const mateGameId = createRes.body.id;

      const res = await request(app)
        .post(`/api/v1/games/${mateGameId}/moves`)
        .send({ from: 'e2', to: 'e3' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('GAME_OVER');
    });
  });
});
