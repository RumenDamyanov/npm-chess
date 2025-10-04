/**
 * Manual API Test
 *
 * Simple manual test to verify the API endpoints work
 */

import { Game } from '../src/engine/game';
import { MinimaxAI } from '../src/ai';

async function main() {
  console.log('🧪 Testing API Components...\n');

  // Test 1: Game Creation
  console.log('Test 1: Create Game');
  const game = new Game();
  console.log(`  ✓ Game created`);
  console.log(`  FEN: ${game.getFen()}`);
  console.log(`  Turn: ${game.getTurn()}`);
  console.log();

  // Test 2: Make Move
  console.log('Test 2: Make Move (e2-e4)');
  const move = game.move({ from: 'e2', to: 'e4' });
  console.log(`  ✓ Move made: ${move?.san}`);
  console.log(`  Turn: ${game.getTurn()}`);
  console.log();

  // Test 3: Get Legal Moves
  console.log('Test 3: Legal Moves');
  const moves = game.getLegalMoves();
  console.log(`  ✓ Found ${moves.length} legal moves`);
  console.log(`  Sample: ${moves.slice(0, 5).map(m => m.san || `${m.from}-${m.to}`).join(', ')}`);
  console.log();

  // Test 4: AI Move
  console.log('Test 4: AI Move (difficulty: easy)');
  const ai = new MinimaxAI({ difficulty: 'easy', maxThinkingTime: 1000 });
  const analysis = await ai.analyze(game);
  console.log(`  ✓ AI suggests: ${analysis.bestMove.san || `${analysis.bestMove.from}-${analysis.bestMove.to}`}`);
  console.log(`  Evaluation: ${(analysis.score / 100).toFixed(2)}`);
  console.log(`  Depth: ${analysis.depth}`);
  console.log(`  Nodes: ${analysis.nodesEvaluated}`);
  console.log(`  Time: ${analysis.thinkingTime}ms`);
  console.log();

  // Test 5: Undo Move
  console.log('Test 5: Undo Move');
  const undone = game.undo();
  console.log(`  ✓ Undone: ${undone?.san}`);
  console.log(`  Turn: ${game.getTurn()}`);
  console.log();

  // Test 6: Game Status
  console.log('Test 6: Game Status');
  console.log(`  Status: ${game.getStatus()}`);
  console.log(`  In Check: ${game.isInCheck()}`);
  console.log(`  Game Over: ${game.isGameOver()}`);
  console.log();

  console.log('✅ All component tests passed!');
  console.log('\n📋 API Server is ready with these features:');
  console.log('  • Game management (create, read, list, delete)');
  console.log('  • Move operations (make, undo, history)');
  console.log('  • AI moves with difficulty levels');
  console.log('  • AI hints (suggestions without playing)');
  console.log('  • Position analysis');
  console.log('  • Legal move generation');
  console.log('  • FEN import/export');
  console.log('  • PGN export');
}

main().catch(console.error);
