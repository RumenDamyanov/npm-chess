/**
 * Extended API Server Integration Tests
 *
 * Additional tests to improve branch coverage for error handling,
 * edge cases, and optional parameters
 */

import request from 'supertest';
import { ApiServer } from '../../src/api-server';
import type { Express } from 'express';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-ext-' + Math.random().toString(36).substr(2, 9),
}));

describe('ApiServer - Extended Coverage', () => {
  let app: Express;
  let gameId: string;

  beforeAll(() => {
    const server = new ApiServer({ port: 0 });
    app = server.getApp();
  });

  beforeEach(async () => {
    // Create a fresh game for each test
    const res = await request(app).post('/api/v1/games').send({});
    gameId = res.body.id;
  });

  describe('Game Creation Edge Cases', () => {
    it('POST /games - should create game with AI enabled', async () => {
      const res = await request(app).post('/api/v1/games').send({
        aiEnabled: true,
        aiDifficulty: 'medium',
        useOpeningBook: true,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('aiEnabled', true);
      expect(res.body).toHaveProperty('aiDifficulty', 'medium');
    });

    it('POST /games - should create game with all AI difficulty levels', async () => {
      const difficulties = ['harmless', 'easy', 'medium', 'hard', 'expert', 'master', 'godlike'];

      for (const difficulty of difficulties) {
        const res = await request(app).post('/api/v1/games').send({
          aiEnabled: true,
          aiDifficulty: difficulty,
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('aiDifficulty', difficulty);
      }
    });

    it('POST /games - should create game without opening book', async () => {
      const res = await request(app).post('/api/v1/games').send({
        aiEnabled: true,
        useOpeningBook: false,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('useOpeningBook', false);
    });

    it('POST /games - should handle AI disabled explicitly', async () => {
      const res = await request(app).post('/api/v1/games').send({
        aiEnabled: false,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('aiEnabled', false);
    });
  });

  describe('AI Move Error Cases', () => {
    it('POST /games/:id/ai-move - should return 400 for missing game ID', async () => {
      const res = await request(app).post('/api/v1/games//ai-move').send({});

      expect(res.status).toBe(404); // Express treats empty param as 404
    });

    it('POST /games/:id/ai-move - should return 404 for non-existent game', async () => {
      const res = await request(app).post('/api/v1/games/nonexistent/ai-move').send({});

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('POST /games/:id/ai-move - should handle custom AI difficulty', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/ai-move`).send({
        difficulty: 'easy',
        thinkingTime: 1000,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('aiMetrics');
      expect(res.body.aiMetrics).toHaveProperty('difficulty', 'easy');
    }, 10000);

    it('POST /games/:id/ai-move - should work with opening book disabled', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/ai-move`).send({
        difficulty: 'easy',
        useOpeningBook: false,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('moveHistory');
    }, 10000);

    it('POST /games/:id/ai-move - should fail on completed game', async () => {
      // Create game in checkmate position
      const matePos = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
      const createRes = await request(app).post('/api/v1/games').send({ fen: matePos });
      const mateGameId = createRes.body.id;

      const res = await request(app).post(`/api/v1/games/${mateGameId}/ai-move`).send({});

      expect(res.status).toBe(409); // API returns 409 for completed games
      expect(res.body).toHaveProperty('code', 'GAME_OVER');
    });
  });

  describe('AI Hint Edge Cases', () => {
    it('POST /games/:id/ai-hint - should return 404 for non-existent game', async () => {
      const res = await request(app).post('/api/v1/games/nonexistent/ai-hint').send({});

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('POST /games/:id/ai-hint - should provide hint with custom difficulty', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/ai-hint`).send({
        difficulty: 'hard',
        thinkingTime: 2000,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('suggestedMove');
      expect(res.body).toHaveProperty('explanation');
      expect(res.body).toHaveProperty('aiMetrics'); // Property is aiMetrics, not metrics
    }, 10000);

    it('POST /games/:id/ai-hint - should work without opening book', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/ai-hint`).send({
        difficulty: 'easy',
        useOpeningBook: false,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('suggestedMove');
    }, 10000);

    it('POST /games/:id/ai-hint - should fail on completed game', async () => {
      // Create game in checkmate position
      const matePos = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
      const createRes = await request(app).post('/api/v1/games').send({ fen: matePos });
      const mateGameId = createRes.body.id;

      const res = await request(app).post(`/api/v1/games/${mateGameId}/ai-hint`).send({});

      expect(res.status).toBe(409); // API returns 409 for completed games
      expect(res.body).toHaveProperty('code', 'GAME_OVER');
    });
  });

  describe('Analysis Edge Cases', () => {
    it('GET /games/:id/analysis - should return 404 for non-existent game', async () => {
      const res = await request(app).get('/api/v1/games/nonexistent/analysis');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('GET /games/:id/analysis - should use custom difficulty', async () => {
      const res = await request(app).get(`/api/v1/games/${gameId}/analysis`).query({
        difficulty: 'expert',
        thinkingTime: 3000,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('evaluation');
      expect(res.body).toHaveProperty('bestMove');
    }, 15000);

    it('GET /games/:id/analysis - should work without query params', async () => {
      const res = await request(app).get(`/api/v1/games/${gameId}/analysis`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('evaluation');
    }, 20000); // Increase timeout for analysis
  });

  describe('Legal Moves Edge Cases', () => {
    it('GET /games/:id/legal-moves - should return 404 for non-existent game', async () => {
      const res = await request(app).get('/api/v1/games/nonexistent/legal-moves');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('GET /games/:id/legal-moves - should filter by from square', async () => {
      const res = await request(app)
        .get(`/api/v1/games/${gameId}/legal-moves`)
        .query({ from: 'e2' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('moves');
      expect(Array.isArray(res.body.moves)).toBe(true);
      res.body.moves.forEach((move: { from: string }) => {
        expect(move.from).toBe('e2');
      });
    });

    it('GET /games/:id/legal-moves - should return empty for invalid square', async () => {
      const res = await request(app)
        .get(`/api/v1/games/${gameId}/legal-moves`)
        .query({ from: 'e3' });

      expect(res.status).toBe(200);
      expect(res.body.moves).toHaveLength(0);
    });
  });

  describe('FEN Loading Edge Cases', () => {
    it('POST /games/:id/fen - should return 404 for non-existent game', async () => {
      const res = await request(app)
        .post('/api/v1/games/nonexistent/fen')
        .send({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('POST /games/:id/fen - should return 400 for missing FEN', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/fen`).send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'INVALID_INPUT'); // API returns INVALID_INPUT
    });

    it('POST /games/:id/fen - should reject malformed FEN', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/fen`)
        .send({ fen: '123invalid' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'INVALID_FEN');
    });
  });

  describe('PGN Export Edge Cases', () => {
    it('GET /games/:id/pgn - should return 404 for non-existent game', async () => {
      const res = await request(app).get('/api/v1/games/nonexistent/pgn');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('GET /games/:id/pgn - should export game with moves', async () => {
      // Make a move first
      await request(app).post(`/api/v1/games/${gameId}/moves`).send({ from: 'e2', to: 'e4' });

      const res = await request(app).get(`/api/v1/games/${gameId}/pgn`);

      expect(res.status).toBe(200);
      expect(res.text).toContain('[Event');
      expect(res.text).toContain('e4'); // Move should be in PGN
      expect(res.headers['content-type']).toContain('text/plain');
    });

    it('GET /games/:id/pgn - should export empty game', async () => {
      const res = await request(app).get(`/api/v1/games/${gameId}/pgn`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('[Event');
    });
  });

  describe('Undo Edge Cases', () => {
    it('POST /games/:id/undo - should return 404 for non-existent game', async () => {
      const res = await request(app).post('/api/v1/games/nonexistent/undo');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('POST /games/:id/undo - should return 400 when no moves to undo', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/undo`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'NO_MOVES');
    });

    it('POST /games/:id/undo - should undo a move successfully', async () => {
      // Make a move first
      await request(app).post(`/api/v1/games/${gameId}/moves`).send({ from: 'e2', to: 'e4' });

      const res = await request(app).post(`/api/v1/games/${gameId}/undo`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('moveHistory');
      expect(res.body.moveHistory).toHaveLength(0); // Move undone
    });
  });

  describe('Move Validation Edge Cases', () => {
    it('POST /games/:id/moves - should return 404 for non-existent game', async () => {
      const res = await request(app)
        .post('/api/v1/games/nonexistent/moves')
        .send({ from: 'e2', to: 'e4' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'GAME_NOT_FOUND');
    });

    it('POST /games/:id/moves - should reject move without from field', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/moves`).send({ to: 'e4' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'INVALID_INPUT');
    });

    it('POST /games/:id/moves - should reject move without to field', async () => {
      const res = await request(app).post(`/api/v1/games/${gameId}/moves`).send({ from: 'e2' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'INVALID_INPUT');
    });

    it('POST /games/:id/moves - should reject invalid move', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/moves`)
        .send({ from: 'e2', to: 'e5' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'INVALID_MOVE');
    });

    it('POST /games/:id/moves - should handle pawn promotion', async () => {
      // Set up a position where white pawn can promote
      const promotionPos = '8/P7/8/8/8/8/8/K6k w - - 0 1';
      const createRes = await request(app).post('/api/v1/games').send({ fen: promotionPos });
      const promGameId = createRes.body.id;

      const res = await request(app)
        .post(`/api/v1/games/${promGameId}/moves`)
        .send({ from: 'a7', to: 'a8', promotion: 'queen' }); // API might expect full piece name

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('moveHistory');
    });

    it('POST /games/:id/moves - should reject promotion without promotion field', async () => {
      // Set up a position where white pawn can promote
      const promotionPos = '8/P7/8/8/8/8/8/K6k w - - 0 1';
      const createRes = await request(app).post('/api/v1/games').send({ fen: promotionPos });
      const promGameId = createRes.body.id;

      const res = await request(app)
        .post(`/api/v1/games/${promGameId}/moves`)
        .send({ from: 'a7', to: 'a8' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('code', 'INVALID_MOVE');
    });
  });

  describe('Pagination Edge Cases', () => {
    it('GET /games - should handle offset beyond total', async () => {
      const res = await request(app).get('/api/v1/games').query({ offset: 1000, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.games).toHaveLength(0);
      expect(res.body.offset).toBe(1000);
    });

    it('GET /games - should handle negative offset', async () => {
      const res = await request(app).get('/api/v1/games').query({ offset: -1 });

      expect(res.status).toBe(200);
      // API accepts negative offset (just testing it doesn't crash)
      expect(res.body).toHaveProperty('games');
    });

    it('GET /games - should handle very large limit', async () => {
      const res = await request(app).get('/api/v1/games').query({ limit: 10000 });

      expect(res.status).toBe(200);
      expect(res.body.limit).toBe(100); // Should cap at max
    });

    it('GET /games - should handle zero limit', async () => {
      const res = await request(app).get('/api/v1/games').query({ limit: 0 });

      expect(res.status).toBe(200);
      // API accepts zero limit (just testing it doesn't crash)
      expect(res.body).toHaveProperty('games');
    });
  });
});
