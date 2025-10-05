/**
 * Performance benchmarks for AI engines
 */
/* eslint-disable no-console */

import { Game } from '../../../src/engine/game';
import { MinimaxAI } from '../../../src/ai/minimax';
import { RandomAI } from '../../../src/ai/random';

describe('AI Performance Benchmarks', () => {
  describe('RandomAI Performance', () => {
    it('should complete move selection quickly', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const startTime = Date.now();
      await ai.getBestMove(game);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(500); // Should be under 0.5s
    });

    it('should handle multiple consecutive moves efficiently', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const startTime = Date.now();

      // Make 10 moves
      for (let i = 0; i < 10; i++) {
        const move = await ai.getBestMove(game);
        game.move(move);
      }

      const elapsed = Date.now() - startTime;
      const avgTime = elapsed / 10;

      expect(avgTime).toBeLessThan(300); // Average under 0.3s per move
    });
  });

  describe('MinimaxAI Performance', () => {
    it('easy difficulty should complete in reasonable time', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'easy' });

      const startTime = Date.now();
      const analysis = await ai.analyze(game);
      const elapsed = Date.now() - startTime;

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.nodesEvaluated).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(5000); // Under 5 seconds

      console.log(`Easy (depth ${analysis.depth}): ${elapsed}ms, ${analysis.nodesEvaluated} nodes`);
    });

    it('medium difficulty should complete in reasonable time', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'medium' });

      const startTime = Date.now();
      const analysis = await ai.analyze(game);
      const elapsed = Date.now() - startTime;

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.nodesEvaluated).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(10000); // Under 10 seconds

      console.log(
        `Medium (depth ${analysis.depth}): ${elapsed}ms, ${analysis.nodesEvaluated} nodes`
      );
    });

    it('should search deeper at higher difficulties', async () => {
      const game = new Game();

      const easy = new MinimaxAI({ difficulty: 'easy' });
      const hard = new MinimaxAI({ difficulty: 'hard' });

      const easyAnalysis = await easy.analyze(game);
      const hardAnalysis = await hard.analyze(game);

      // Hard should evaluate more nodes than easy
      expect(hardAnalysis.nodesEvaluated).toBeGreaterThan(easyAnalysis.nodesEvaluated);

      console.log('Easy:', easyAnalysis.nodesEvaluated, 'nodes');
      console.log('Hard:', hardAnalysis.nodesEvaluated, 'nodes');
    }, 15000); // 15 second timeout for hard difficulty

    it('should evaluate positions per second', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'easy' });

      const analysis = await ai.analyze(game);
      const positionsPerSecond = (analysis.nodesEvaluated / analysis.thinkingTime) * 1000;

      expect(positionsPerSecond).toBeGreaterThan(100); // At least 100 positions/sec

      console.log(`Positions per second: ${Math.round(positionsPerSecond)}`);
    });

    it('should respect time limits', async () => {
      const game = new Game();
      const maxTime = 2000; // 2 seconds
      const ai = new MinimaxAI({
        difficulty: 'expert',
        maxThinkingTime: maxTime,
        maxDepth: 10, // Set high depth to test time limit
      });

      const startTime = Date.now();
      const analysis = await ai.analyze(game);
      const elapsed = Date.now() - startTime;

      expect(analysis.bestMove).toBeDefined();
      // Should stop within time limit (with small buffer for overhead)
      expect(elapsed).toBeLessThan(maxTime + 500);

      console.log(`Time limit ${maxTime}ms: actual ${elapsed}ms, depth reached ${analysis.depth}`);
    }, 10000);

    it('should efficiently prune search tree', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'medium' });

      const analysis = await ai.analyze(game);

      // Alpha-beta pruning should significantly reduce nodes evaluated
      // compared to full minimax (which would be ~20^depth for chess)
      const legalMoves = game.getLegalMoves().length;
      const naiveNodes = Math.pow(legalMoves, analysis.depth);

      // Pruning should evaluate far fewer nodes than naive search
      expect(analysis.nodesEvaluated).toBeLessThan(naiveNodes / 2);

      console.log(`Nodes evaluated: ${analysis.nodesEvaluated} (naive would be ~${naiveNodes})`);
    });
  });

  describe('Comparative Performance', () => {
    it('should compare Random vs Minimax complexity', async () => {
      const game = new Game();

      const randomAI = new RandomAI();
      const minimaxAI = new MinimaxAI({ difficulty: 'easy' });

      const randomAnalysis = await randomAI.analyze(game);
      const minimaxAnalysis = await minimaxAI.analyze(game);

      console.log(
        `Random nodes: ${randomAnalysis.nodesEvaluated}, Minimax nodes: ${minimaxAnalysis.nodesEvaluated}`
      );

      // Minimax should evaluate far more nodes than random
      expect(minimaxAnalysis.nodesEvaluated).toBeGreaterThan(randomAnalysis.nodesEvaluated * 10);

      // Both should return valid moves
      expect(randomAnalysis.bestMove).toBeDefined();
      expect(minimaxAnalysis.bestMove).toBeDefined();
    });

    it('should show performance scaling with depth', async () => {
      const game = new Game();

      const depths = [2, 3, 4];
      const results: { depth: number; time: number; nodes: number }[] = [];

      for (const depth of depths) {
        const ai = new MinimaxAI({ difficulty: 'medium', maxDepth: depth });

        const start = Date.now();
        const analysis = await ai.analyze(game);
        const elapsed = Date.now() - start;

        results.push({
          depth,
          time: elapsed,
          nodes: analysis.nodesEvaluated,
        });

        console.log(`Depth ${depth}: ${elapsed}ms, ${analysis.nodesEvaluated} nodes`);
      }

      // Each depth should take more time than the previous
      expect(results[1].time).toBeGreaterThan(results[0].time);
      expect(results[2].time).toBeGreaterThan(results[1].time);

      // Each depth should evaluate more nodes
      expect(results[1].nodes).toBeGreaterThan(results[0].nodes);
      expect(results[2].nodes).toBeGreaterThan(results[1].nodes);
    }, 20000); // 20 second timeout
  });
});
