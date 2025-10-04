/**
 * Example: Using Different AI Difficulty Levels
 * 
 * This example demonstrates all six difficulty levels:
 * - harmless: Very weak (depth 1, 50% randomness)
 * - easy: Beginner level (depth 2, 30% randomness)
 * - medium: Intermediate (depth 3, 10% randomness)
 * - hard: Strong (depth 4, 5% randomness)
 * - expert: Very strong (depth 5, no randomness)
 * - godlike: Maximum strength (depth 6, no randomness)
 */

import { Game } from '../src/engine/game';
import { MinimaxAI } from '../src/ai/minimax';

async function demonstrateDifficultyLevels() {
  const game = new Game();
  
  console.log('🎮 Chess AI Difficulty Levels Demo\n');
  console.log('Starting position:\n');
  
  // Test each difficulty level
  const difficulties = ['harmless', 'easy', 'medium', 'hard', 'expert', 'godlike'] as const;
  
  for (const difficulty of difficulties) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${difficulty.toUpperCase()}`);
    console.log('='.repeat(50));
    
    const ai = new MinimaxAI({ difficulty });
    console.log(`Configuration:`);
    console.log(`  - Depth: ${ai.config.maxDepth}`);
    console.log(`  - Randomness: ${(ai.config.randomness * 100).toFixed(0)}%`);
    console.log(`  - Max thinking time: ${ai.config.maxThinkingTime}ms`);
    
    const startTime = Date.now();
    const analysis = await ai.analyze(game);
    const elapsed = Date.now() - startTime;
    
    console.log(`\nResults:`);
    console.log(`  - Best move: ${analysis.bestMove.from} → ${analysis.bestMove.to}`);
    console.log(`  - Score: ${analysis.score}`);
    console.log(`  - Thinking time: ${elapsed}ms`);
    console.log(`  - Nodes evaluated: ${analysis.nodesEvaluated.toLocaleString()}`);
    console.log(`  - Depth reached: ${analysis.depth}`);
    
    if (analysis.topMoves && analysis.topMoves.length > 1) {
      console.log(`  - Top 3 moves:`);
      analysis.topMoves.slice(0, 3).forEach((moveEval, i) => {
        console.log(`    ${i + 1}. ${moveEval.move.from} → ${moveEval.move.to} (score: ${moveEval.score})`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Summary:');
  console.log('='.repeat(50));
  console.log('Harmless: Great for absolute beginners');
  console.log('Easy:     Good for learning players');
  console.log('Medium:   Balanced opponent');
  console.log('Hard:     Challenging for intermediate players');
  console.log('Expert:   Strong tactical play');
  console.log('Godlike:  Maximum strength, near-perfect play');
}

// Run if executed directly
if (require.main === module) {
  demonstrateDifficultyLevels()
    .then(() => {
      console.log('\n✅ Demo completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { demonstrateDifficultyLevels };
