/**
 * Basic Game Example
 * 
 * Demonstrates how to:
 * - Create a new game
 * - Make moves using algebraic notation
 * - Check the current game status
 * - Get legal moves
 */

import { Game } from '@rumenx/chess';

// Create a new game with the standard starting position
const game = new Game();

console.log('Starting a new chess game!\n');

// Make some opening moves
console.log('1. Playing e4 (King\'s Pawn Opening)');
let move = game.move({ from: 'e2', to: 'e4' });
console.log('Move result:', move);

console.log('\n2. Black responds with e5');
move = game.move({ from: 'e7', to: 'e5' });
console.log('Move result:', move);

console.log('\n3. White plays Nf3 (King\'s Knight)');
move = game.move({ from: 'g1', to: 'f3' });
console.log('Move result:', move);

// Get current game status
console.log('\n=== Game Status ===');
console.log('Current turn:', game.getTurn());
console.log('Game status:', game.getStatus());
console.log('Total moves played:', game.getHistory().length);

// Get all legal moves for the current player
console.log('\n=== Legal Moves ===');
const legalMoves = game.getLegalMoves();
console.log(`Black has ${legalMoves.length} legal moves available`);
console.log('First 5 moves:', legalMoves.slice(0, 5));

// Get legal moves from a specific square
console.log('\n=== Legal Moves from d7 ===');
const pawnMoves = game.getLegalMovesFrom('d7');
console.log('Pawn on d7 can move to:', pawnMoves);

// Display the board
console.log('\n=== Current Board Position ===');
console.log(game.getBoard().toAscii());
