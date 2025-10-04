/**
 * Special Moves Example
 * 
 * Demonstrates how to handle:
 * - Castling (kingside and queenside)
 * - En passant captures
 * - Pawn promotion
 * - Move validation
 */

import { Game } from '@rumenx/chess';

console.log('=== CASTLING EXAMPLE ===\n');

// White kingside castling
const game1 = new Game();
game1.move({ from: 'e2', to: 'e4' }); // Open center
game1.move({ from: 'e7', to: 'e5' });
game1.move({ from: 'g1', to: 'f3' }); // Develop knight
game1.move({ from: 'b8', to: 'c6' });
game1.move({ from: 'f1', to: 'c4' }); // Develop bishop
game1.move({ from: 'g8', to: 'f6' });

// Castle kingside (O-O)
console.log('White castles kingside:');
const castlingMove = game1.move({ from: 'e1', to: 'g1' });
console.log('Castling move:', castlingMove);
console.log('King now at g1, Rook now at f1\n');

// Queenside castling example
const game2 = new Game();
game2.move({ from: 'd2', to: 'd4' });
game2.move({ from: 'd7', to: 'd5' });
game2.move({ from: 'c1', to: 'f4' }); // Develop bishop
game2.move({ from: 'b8', to: 'c6' });
game2.move({ from: 'b1', to: 'c3' }); // Develop knight
game2.move({ from: 'g8', to: 'f6' });
game2.move({ from: 'd1', to: 'd2' }); // Move queen
game2.move({ from: 'e7', to: 'e6' });

// Castle queenside (O-O-O)
console.log('White castles queenside:');
const queenCastle = game2.move({ from: 'e1', to: 'c1' });
console.log('Castling move:', queenCastle);
console.log('King now at c1, Rook now at d1\n');

console.log('=== EN PASSANT EXAMPLE ===\n');

const game3 = new Game();
game3.move({ from: 'e2', to: 'e4' });
game3.move({ from: 'a7', to: 'a6' });
game3.move({ from: 'e4', to: 'e5' }); // White pawn advances to 5th rank
game3.move({ from: 'd7', to: 'd5' }); // Black pawn moves two squares

console.log('Black pawn moved from d7 to d5 (two squares)');
console.log('White pawn on e5 can capture en passant!\n');

// Capture en passant
const enPassant = game3.move({ from: 'e5', to: 'd6' });
console.log('En passant capture:', enPassant);
console.log('White pawn captured on d6, removed black pawn from d5\n');

console.log('=== PAWN PROMOTION EXAMPLE ===\n');

const game4 = new Game();
// Set up a position where pawn can promote
game4.getBoard().clear();
game4.getBoard().setPiece('e1', { type: 'king', color: 'white' });
game4.getBoard().setPiece('e8', { type: 'king', color: 'black' });
game4.getBoard().setPiece('a7', { type: 'pawn', color: 'white' });
game4.refreshMoveGenerator();

console.log('White pawn on a7, ready to promote...');

// Promote to queen
const promotion = game4.move({ from: 'a7', to: 'a8', promotion: 'queen' });
console.log('Promotion move:', promotion);
console.log('Pawn promoted to Queen on a8!\n');

// You can promote to any piece
const game5 = new Game();
game5.getBoard().clear();
game5.getBoard().setPiece('e1', { type: 'king', color: 'white' });
game5.getBoard().setPiece('e8', { type: 'king', color: 'black' });
game5.getBoard().setPiece('b7', { type: 'pawn', color: 'white' });
game5.refreshMoveGenerator();

console.log('Promoting to knight (underpromotion):');
const knightPromotion = game5.move({ from: 'b7', to: 'b8', promotion: 'knight' });
console.log('Promotion move:', knightPromotion);
console.log('Pawn promoted to Knight on b8!\n');

console.log('=== MOVE VALIDATION ===\n');

const game6 = new Game();

// Try an illegal move
console.log('Attempting to move knight illegally...');
const invalidMove = game6.move({ from: 'b1', to: 'e5' }); // Knight can't reach e5 from start
console.log('Result:', invalidMove); // Will be null

// Try to move opponent's piece
console.log('\nAttempting to move black\'s piece on white\'s turn...');
const wrongColor = game6.move({ from: 'e7', to: 'e5' }); // Black piece, white's turn
console.log('Result:', wrongColor); // Will be null

// Try a legal move
console.log('\nMaking a legal knight move...');
const validMove = game6.move({ from: 'b1', to: 'c3' }); // Knight to c3 is legal
console.log('Result:', validMove); // Will show move details
