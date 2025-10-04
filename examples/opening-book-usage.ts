/**
 * Opening Book Usage Examples
 *
 * This file demonstrates how to use the chess opening book feature
 * to make AI play known opening theory.
 *
 * @module examples/opening-book-usage
 */

import { Game } from '../src/engine/game';
import {
  createDefaultOpeningBook,
  loadOpeningBookFromFile,
  OpeningBook,
} from '../src/ai/opening-book';
import { MinimaxAI } from '../src/ai/minimax';
import type { OpeningBookData } from '../src/ai/opening-book';

/**
 * Example 1: Basic Opening Book Usage
 *
 * Shows how to create and use a default opening book
 */
function basicUsage(): void {
  console.log('\n=== Example 1: Basic Opening Book Usage ===\n');

  // Create a default opening book
  const openingBook = createDefaultOpeningBook();

  // Check stats
  const stats = openingBook.getStats();
  console.log('Opening Book Statistics:');
  console.log(`  Version: ${stats.version}`);
  console.log(`  Positions: ${stats.positionCount}`);
  console.log(`  Total Moves: ${stats.totalMoves}`);
  console.log(`  Max Depth: ${stats.maxDepth}`);

  // Create a new game
  const game = new Game();

  // Get a move from the opening book
  const move = openingBook.getMove(game);

  if (move) {
    console.log(`\nOpening Book suggests: ${move.move}`);
    console.log(`  Opening Name: ${move.name}`);
    console.log(`  ECO Code: ${move.eco}`);
    console.log(`  Weight: ${move.weight}`);
  } else {
    console.log('\nNo move found in opening book for this position');
  }
}

/**
 * Example 2: Playing a Complete Opening Sequence
 *
 * Demonstrates playing several moves from the opening book
 */
function playOpeningSequence(): void {
  console.log('\n=== Example 2: Playing an Opening Sequence ===\n');

  const openingBook = createDefaultOpeningBook();
  const game = new Game();

  console.log('Starting Position: ' + game.getFen());

  // Play moves from the opening book until exhausted
  let moveCount = 0;
  const maxMoves = 10;

  while (moveCount < maxMoves) {
    const bookMove = openingBook.getMove(game);

    if (!bookMove) {
      console.log(`\nOpening book exhausted after ${moveCount} moves`);
      break;
    }

    // Find and make the move
    const legalMoves = game.getLegalMoves();
    const matchingMove = legalMoves.find((m) => m.san === bookMove.move);

    if (!matchingMove) {
      console.log(`\nCould not find legal move: ${bookMove.move}`);
      break;
    }

    game.move(matchingMove);
    moveCount++;

    console.log(
      `\n${moveCount}. ${bookMove.move} - ${bookMove.name} (${bookMove.eco})`
    );
  }

  console.log('\nFinal Position: ' + game.getFen());
  console.log(`Played ${moveCount} moves from opening book`);
}

/**
 * Example 3: Configuring Opening Book Behavior
 *
 * Shows how to configure opening book options
 */
function configuringOpeningBook(): void {
  console.log('\n=== Example 3: Configuring Opening Book ===\n');

  const openingBook = createDefaultOpeningBook();
  const game = new Game();

  // Test 1: Deterministic (always choose highest weight)
  console.log('Test 1: Deterministic Move Selection (randomize=false)');
  openingBook.configure({ randomize: false });

  for (let i = 0; i < 5; i++) {
    const move = openingBook.getMove(game);
    console.log(`  Attempt ${i + 1}: ${move?.move} (weight: ${move?.weight})`);
  }

  // Test 2: Randomized (weighted random selection)
  console.log('\nTest 2: Randomized Move Selection (randomize=true)');
  openingBook.configure({ randomize: true });

  const moveCounts: Record<string, number> = {};
  for (let i = 0; i < 100; i++) {
    const move = openingBook.getMove(game);
    if (move) {
      moveCounts[move.move] = (moveCounts[move.move] || 0) + 1;
    }
  }

  console.log('  Distribution over 100 trials:');
  for (const [move, count] of Object.entries(moveCounts)) {
    console.log(`    ${move}: ${count}%`);
  }

  // Test 3: Minimum weight filtering
  console.log('\nTest 3: Minimum Weight Filtering (minWeight=40)');
  openingBook.configure({ minWeight: 40, randomize: false });

  const filteredMove = openingBook.getMove(game);
  console.log(`  Move: ${filteredMove?.move} (weight: ${filteredMove?.weight})`);
  console.log('  (Only moves with weight >= 40 are considered)');

  // Test 4: Max depth limiting
  console.log('\nTest 4: Max Depth Limiting (maxDepth=3)');
  openingBook.configure({ maxDepth: 3, minWeight: 0, randomize: false });

  const game2 = new Game();
  let depth = 0;

  while (depth < 5) {
    const move = openingBook.getMove(game2);
    if (!move) {
      console.log(`  Book exhausted at move ${depth + 1} (maxDepth=3)`);
      break;
    }

    const legalMoves = game2.getLegalMoves();
    const matchingMove = legalMoves.find((m) => m.san === move.move);
    if (matchingMove) {
      game2.move(matchingMove);
      depth++;
      console.log(`  Move ${depth}: ${move.move}`);
    }
  }
}

/**
 * Example 4: Integration with MinimaxAI
 *
 * Shows how to use opening book with MinimaxAI
 */
async function aiIntegration(): Promise<void> {
  console.log('\n=== Example 4: AI Integration ===\n');

  const openingBook = createDefaultOpeningBook();
  const game = new Game();

  // Create AI with opening book
  const aiWithBook = new MinimaxAI({ difficulty: 'medium' }, openingBook);

  // Create AI without opening book (for comparison)
  const aiWithoutBook = new MinimaxAI({ difficulty: 'medium' });

  console.log('Test 1: AI with Opening Book');
  const startTime1 = Date.now();
  const analysis1 = await aiWithBook.analyze(game);
  const time1 = Date.now() - startTime1;

  console.log(`  Move: ${analysis1.bestMove.san}`);
  console.log(`  Opening: ${analysis1.openingName || 'N/A'}`);
  console.log(`  ECO: ${analysis1.eco || 'N/A'}`);
  console.log(`  Time: ${time1}ms`);
  console.log(`  Nodes: ${analysis1.nodesEvaluated}`);
  console.log(`  Depth: ${analysis1.depth}`);

  console.log('\nTest 2: AI without Opening Book');
  const startTime2 = Date.now();
  const analysis2 = await aiWithoutBook.analyze(game);
  const time2 = Date.now() - startTime2;

  console.log(`  Move: ${analysis2.bestMove.san}`);
  console.log(`  Time: ${time2}ms`);
  console.log(`  Nodes: ${analysis2.nodesEvaluated}`);
  console.log(`  Depth: ${analysis2.depth}`);

  console.log(`\nSpeed improvement: ${(time2 / time1).toFixed(2)}x faster`);

  // Test 3: Setting opening book after construction
  console.log('\nTest 3: Setting Opening Book After Construction');
  const ai = new MinimaxAI({ difficulty: 'medium' });
  ai.setOpeningBook(openingBook);

  const analysis3 = await ai.analyze(game);
  console.log(`  Move: ${analysis3.bestMove.san}`);
  console.log(`  Opening: ${analysis3.openingName || 'N/A'}`);
}

/**
 * Example 5: Creating a Custom Opening Book
 *
 * Shows how to create a custom opening book with specific openings
 */
function customOpeningBook(): void {
  console.log('\n=== Example 5: Custom Opening Book ===\n');

  // Create a custom opening book focused on aggressive openings
  const customBook = new OpeningBook();

  const customData: OpeningBookData = {
    version: '1.0.0-custom',
    maxDepth: 8,
    positions: {
      // Starting position - only aggressive first moves
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
        { move: 'e4', weight: 70, eco: 'C00', name: "King's Pawn Opening" },
        { move: 'f4', weight: 20, eco: 'A02', name: "Bird's Opening" },
        { move: 'd4', weight: 10, eco: 'D00', name: "Queen's Pawn Opening" },
      ],

      // After 1. e4 - favor sharp openings
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
        { move: 'c5', weight: 80, eco: 'B20', name: 'Sicilian Defense' },
        { move: 'd6', weight: 20, eco: 'B07', name: 'Pirc Defense' },
      ],
    },
  };

  customBook.loadData(customData);

  console.log('Custom Opening Book (Aggressive Repertoire):');
  const stats = customBook.getStats();
  console.log(`  Version: ${stats.version}`);
  console.log(`  Positions: ${stats.positionCount}`);
  console.log(`  Max Depth: ${stats.maxDepth}`);

  const game = new Game();
  const move = customBook.getMove(game);

  console.log(`\nRecommended first move: ${move?.move}`);
  console.log(`  Opening: ${move?.name}`);
  console.log(`  Weight: ${move?.weight}`);
}

/**
 * Example 6: Performance Benchmarking
 *
 * Measures opening book lookup performance
 */
function performanceBenchmark(): void {
  console.log('\n=== Example 6: Performance Benchmark ===\n');

  const openingBook = createDefaultOpeningBook();
  const game = new Game();

  // Benchmark 1: Single lookup
  const iterations = 10000;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    openingBook.getMove(game);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  console.log(`Performed ${iterations} lookups in ${totalTime}ms`);
  console.log(`Average time per lookup: ${avgTime.toFixed(4)}ms`);

  // Benchmark 2: Position check vs move retrieval
  const checkIterations = 100000;

  const checkStart = Date.now();
  for (let i = 0; i < checkIterations; i++) {
    openingBook.hasPosition(game.getFen());
  }
  const checkEnd = Date.now();
  const checkTime = (checkEnd - checkStart) / checkIterations;

  const moveStart = Date.now();
  for (let i = 0; i < checkIterations; i++) {
    openingBook.getMove(game);
  }
  const moveEnd = Date.now();
  const moveTime = (moveEnd - moveStart) / checkIterations;

  console.log(`\nPer-operation average times (${checkIterations} iterations):`);
  console.log(`  hasPosition(): ${checkTime.toFixed(6)}ms`);
  console.log(`  getMove(): ${moveTime.toFixed(6)}ms`);
}

/**
 * Example 7: Loading from File (Node.js only)
 *
 * Shows how to load a comprehensive opening book from a JSON file
 */
async function loadFromFile(): Promise<void> {
  console.log('\n=== Example 7: Loading from File ===\n');

  try {
    // Load the comprehensive opening book database
    const filePath = './data/opening-book.json';
    console.log(`Loading opening book from: ${filePath}`);

    const openingBook = await loadOpeningBookFromFile(filePath);

    const stats = openingBook.getStats();
    console.log('\nLoaded Opening Book:');
    console.log(`  Version: ${stats.version}`);
    console.log(`  Positions: ${stats.positionCount}`);
    console.log(`  Total Moves: ${stats.totalMoves}`);
    console.log(`  Max Depth: ${stats.maxDepth}`);

    // Try getting a move
    const game = new Game();
    const move = openingBook.getMove(game);

    console.log(`\nExample move from database:`);
    console.log(`  Move: ${move?.move}`);
    console.log(`  Opening: ${move?.name}`);
    console.log(`  ECO: ${move?.eco}`);
    console.log(`  Variation: ${move?.variation || 'N/A'}`);
  } catch (error) {
    console.error('Error loading from file:', error);
    console.log('Note: This example only works in Node.js environment');
  }
}

/**
 * Example 8: Comparing Different Opening Systems
 *
 * Shows statistics about different opening systems in the book
 */
function compareOpeningSystems(): void {
  console.log('\n=== Example 8: Comparing Opening Systems ===\n');

  const openingBook = createDefaultOpeningBook();
  const game = new Game();

  // Get all possible first moves
  const firstMoves = openingBook.getMoves(game.getFen());

  console.log('Available Opening Systems:');
  console.log('─'.repeat(60));

  for (const move of firstMoves) {
    console.log(`\n${move.move} - ${move.name} (${move.eco})`);
    console.log(`  Weight: ${move.weight} (${((move.weight / firstMoves.reduce((sum, m) => sum + m.weight, 0)) * 100).toFixed(1)}% probability)`);

    // Play the move and see responses
    const testGame = new Game();
    const legalMoves = testGame.getLegalMoves();
    const matchingMove = legalMoves.find((m) => m.san === move.move);

    if (matchingMove) {
      testGame.move(matchingMove);
      const responses = openingBook.getMoves(testGame.getFen());

      if (responses.length > 0) {
        console.log('  Common responses:');
        for (const response of responses.slice(0, 3)) {
          console.log(
            `    - ${response.move} (${response.name}${response.variation ? ': ' + response.variation : ''})`
          );
        }
      }
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Chess Opening Book Usage Examples                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Run all examples
  basicUsage();
  playOpeningSequence();
  configuringOpeningBook();
  await aiIntegration();
  customOpeningBook();
  performanceBenchmark();
  await loadFromFile();
  compareOpeningSystems();

  console.log('\n' + '═'.repeat(60));
  console.log('All examples completed!');
  console.log('═'.repeat(60) + '\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicUsage,
  playOpeningSequence,
  configuringOpeningBook,
  aiIntegration,
  customOpeningBook,
  performanceBenchmark,
  loadFromFile,
  compareOpeningSystems,
};
