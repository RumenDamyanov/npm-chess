/**
 * Game Status and Undo Example
 * 
 * Demonstrates how to:
 * - Check game status (check, checkmate, stalemate)
 * - Detect draw conditions
 * - Undo moves
 * - Manage game history
 */

import { Game } from '@rumenx/chess';

console.log('=== CHECKING FOR CHECK ===\n');

const game1 = new Game();
game1.move({ from: 'e2', to: 'e4' });
game1.move({ from: 'e7', to: 'e5' });
game1.move({ from: 'd1', to: 'h5' }); // Queen threatens f7
game1.move({ from: 'b8', to: 'c6' });
game1.move({ from: 'f1', to: 'c4' }); // Bishop aims at f7
game1.move({ from: 'g8', to: 'f6' });
game1.move({ from: 'h5', to: 'f7' }); // Check!

console.log('After Qxf7+:');
console.log('Game status:', game1.getStatus());
console.log('Is in check?', game1.getStatus() === 'check');

const lastMove = game1.getHistory()[game1.getHistory().length - 1];
console.log('Last move has check indicator:', lastMove?.check);

console.log('\n=== SCHOLAR\'S MATE (CHECKMATE) ===\n');

const game2 = new Game();
console.log('Playing Scholar\'s Mate...');
game2.move({ from: 'e2', to: 'e4' });
game2.move({ from: 'e7', to: 'e5' });
game2.move({ from: 'f1', to: 'c4' });
game2.move({ from: 'b8', to: 'c6' });
game2.move({ from: 'd1', to: 'h5' });
game2.move({ from: 'g8', to: 'f6' });
game2.move({ from: 'h5', to: 'f7' }); // Checkmate!

console.log('Game status:', game2.getStatus());
console.log('Is checkmate?', game2.getStatus() === 'checkmate');
console.log('Can make any moves?', game2.getLegalMoves().length === 0);

const checkmateMove = game2.getHistory()[game2.getHistory().length - 1];
console.log('Last move has checkmate indicator:', checkmateMove?.checkmate);

console.log('\n=== STALEMATE ===\n');

// Create a stalemate position
const game3 = new Game();
game3.getBoard().clear();
game3.getBoard().setPiece('a8', { type: 'king', color: 'black' });
game3.getBoard().setPiece('c7', { type: 'queen', color: 'white' });
game3.getBoard().setPiece('c6', { type: 'king', color: 'white' });
game3.refreshMoveGenerator();

// Force black's turn
game3.move({ from: 'c7', to: 'b7' }); // Now black's turn

console.log('Position after Qb7:');
console.log(game3.getBoard().toAscii());
console.log('\nGame status:', game3.getStatus());
console.log('Is stalemate?', game3.getStatus() === 'stalemate');
console.log('Black has no legal moves but is not in check');

console.log('\n=== INSUFFICIENT MATERIAL ===\n');

// King vs King
const game4 = new Game();
game4.getBoard().clear();
game4.getBoard().setPiece('e1', { type: 'king', color: 'white' });
game4.getBoard().setPiece('e8', { type: 'king', color: 'black' });
game4.refreshMoveGenerator();

console.log('King vs King:');
console.log('Game status:', game4.getStatus());
console.log('Is draw?', game4.getStatus() === 'draw');

// King + Knight vs King
const game5 = new Game();
game5.getBoard().clear();
game5.getBoard().setPiece('e1', { type: 'king', color: 'white' });
game5.getBoard().setPiece('d4', { type: 'knight', color: 'white' });
game5.getBoard().setPiece('e8', { type: 'king', color: 'black' });
game5.refreshMoveGenerator();

console.log('\nKing + Knight vs King:');
console.log('Game status:', game5.getStatus());
console.log('Is draw?', game5.getStatus() === 'draw');

console.log('\n=== UNDOING MOVES ===\n');

const game6 = new Game();
console.log('Starting game...');
game6.move({ from: 'e2', to: 'e4' });
console.log('1. e4');
game6.move({ from: 'e7', to: 'e5' });
console.log('1... e5');
game6.move({ from: 'g1', to: 'f3' });
console.log('2. Nf3');

console.log('\nMoves played:', game6.getHistory().length);
console.log('Current turn:', game6.getTurn());

// Undo last move
console.log('\nUndoing Nf3...');
const undoneMove = game6.undo();
console.log('Undone move:', undoneMove);
console.log('Moves now:', game6.getHistory().length);
console.log('Current turn:', game6.getTurn());

// Undo multiple moves
console.log('\nUndoing e5...');
game6.undo();
console.log('Undoing e4...');
game6.undo();
console.log('\nMoves now:', game6.getHistory().length);
console.log('Back to starting position');

console.log('\n=== MOVE HISTORY ===\n');

const game7 = new Game();
game7.move({ from: 'e2', to: 'e4' });
game7.move({ from: 'c7', to: 'c5' });
game7.move({ from: 'g1', to: 'f3' });
game7.move({ from: 'd7', to: 'd6' });

console.log('Full game history:');
const history = game7.getHistory();
history.forEach((move, index) => {
  const moveNum = Math.floor(index / 2) + 1;
  const color = index % 2 === 0 ? 'White' : 'Black';
  console.log(`${moveNum}. ${color}: ${move.from} -> ${move.to} ${move.san || ''}`);
});

console.log('\n=== FIFTY-MOVE RULE ===\n');

const game8 = new Game();
console.log('Initial halfmove clock:', game8.getHalfMoveClock());

// Make some moves without pawns or captures
game8.move({ from: 'g1', to: 'f3' });
console.log('After Nf3, halfmove clock:', game8.getHalfMoveClock());

game8.move({ from: 'g8', to: 'f6' });
console.log('After Nf6, halfmove clock:', game8.getHalfMoveClock());

// Make a pawn move (resets clock)
game8.move({ from: 'e2', to: 'e4' });
console.log('After e4 (pawn move), halfmove clock:', game8.getHalfMoveClock());

console.log('\nHalfmove clock resets on:');
console.log('- Pawn moves');
console.log('- Captures');
console.log('Draw at 50 full moves (100 halfmoves) with no progress');

console.log('\n=== POSITION REPETITION ===\n');

const game9 = new Game();
console.log('Playing repetitive moves...');

// Repeat same position 3 times
game9.move({ from: 'g1', to: 'f3' });
game9.move({ from: 'g8', to: 'f6' });
game9.move({ from: 'f3', to: 'g1' });
game9.move({ from: 'f6', to: 'g8' });
game9.move({ from: 'g1', to: 'f3' });
game9.move({ from: 'g8', to: 'f6' });
game9.move({ from: 'f3', to: 'g1' });
game9.move({ from: 'f6', to: 'g8' });
game9.move({ from: 'g1', to: 'f3' });
game9.move({ from: 'g8', to: 'f6' });
game9.move({ from: 'f3', to: 'g1' });
game9.move({ from: 'f6', to: 'g8' });

console.log('After 12 moves (same position 3 times):');
console.log('Game status:', game9.getStatus());
console.log('Is draw?', game9.getStatus() === 'draw');
console.log('Threefold repetition detected');

console.log('\n=== RESET GAME ===\n');

const game10 = new Game();
game10.move({ from: 'e2', to: 'e4' });
game10.move({ from: 'e7', to: 'e5' });
game10.move({ from: 'g1', to: 'f3' });

console.log('Moves played:', game10.getHistory().length);
console.log('Resetting game...');
game10.reset();
console.log('Moves after reset:', game10.getHistory().length);
console.log('Position reset to starting position');
