/**
 * FEN Import/Export Example
 * 
 * Demonstrates how to:
 * - Load a position from FEN notation
 * - Export current position to FEN
 * - Continue playing from a FEN position
 * - Validate FEN strings
 */

import { Game, FenParser } from '@rumenx/chess';

console.log('=== FEN BASICS ===\n');

// The standard starting position FEN
console.log('Starting position FEN:');
console.log(FenParser.STARTING_POSITION);
console.log();

console.log('=== IMPORTING FROM FEN ===\n');

// Load a specific position (Sicilian Defense after 1.e4 c5)
const sicilianFen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2';
console.log('Loading Sicilian Defense position:');
console.log(sicilianFen);

const positionData = FenParser.parse(sicilianFen);
console.log('\nParsed position data:');
console.log('- Active color:', positionData.turn);
console.log('- Castling rights:', positionData.castlingRights);
console.log('- En passant square:', positionData.enPassantSquare);
console.log('- Half move clock:', positionData.halfMoveClock);
console.log('- Full move number:', positionData.fullMoveNumber);

// Create a game from this position
const game = new Game();
game.loadFen(sicilianFen);

console.log('\nCurrent board:');
console.log(game.getBoard().toAscii());

console.log('\n=== EXPORTING TO FEN ===\n');

// Play some moves
console.log('Playing moves: Nf3, d6, d4...');
game.move({ from: 'g1', to: 'f3' });
game.move({ from: 'd7', to: 'd6' });
game.move({ from: 'd2', to: 'd4' });

// Export the current position
const currentFen = game.getFen();
console.log('\nCurrent position FEN:');
console.log(currentFen);

console.log('\n=== LOADING FAMOUS POSITIONS ===\n');

// Load a famous endgame position
const lucenaPosition = '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1';
console.log('Loading Lucena Position (rook endgame):');

const endgame = new Game();
endgame.loadFen(lucenaPosition);
console.log(endgame.getBoard().toAscii());
console.log('\nWhite to move, can White win?');

console.log('\n=== FEN VALIDATION ===\n');

// Validate a FEN string before using it
const validFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1'; // Missing rank

console.log('Validating correct FEN:');
console.log('FEN:', validFen);
console.log('Valid?', FenParser.validate(validFen));

console.log('\nValidating incorrect FEN:');
console.log('FEN:', invalidFen);
console.log('Valid?', FenParser.validate(invalidFen));

// Try to parse invalid FEN (will throw error)
try {
  FenParser.parse(invalidFen);
} catch (error) {
  console.log('Error caught:', (error as Error).message);
}

console.log('\n=== PRACTICAL USE CASE ===\n');

// Save and restore game state
const game1 = new Game();
game1.move({ from: 'e2', to: 'e4' });
game1.move({ from: 'e7', to: 'e5' });
game1.move({ from: 'g1', to: 'f3' });
game1.move({ from: 'b8', to: 'c6' });

// Save the position
const savedPosition = game1.getFen();
console.log('Saved position after 4 moves:');
console.log(savedPosition);

// Later, restore the position in a new game
const game2 = new Game();
game2.loadFen(savedPosition);

console.log('\nRestored game - continuing play:');
game2.move({ from: 'f1', to: 'b5' }); // Spanish Opening

console.log('Current position:');
console.log(game2.getBoard().toAscii());
console.log('\nCurrent FEN:', game2.getFen());

console.log('\n=== ANALYZING POSITIONS ===\n');

// Check specific position properties
const middlegameFen = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5';
const analysis = new Game();
analysis.loadFen(middlegameFen);

console.log('Analyzing Italian Game position:');
const fenData = FenParser.parse(middlegameFen);

console.log('- Both sides can still castle:', 
  fenData.castlingRights.whiteKingside && fenData.castlingRights.blackKingside);
console.log('- Move number:', fenData.fullMoveNumber);
console.log('- Pieces moved:', fenData.halfMoveClock, 'half-moves without pawn move or capture');

console.log('\nLegal moves available:', analysis.getLegalMoves().length);
