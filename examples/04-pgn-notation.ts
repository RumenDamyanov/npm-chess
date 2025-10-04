/**
 * PGN Import/Export Example
 * 
 * Demonstrates how to:
 * - Export a game to PGN format
 * - Import and replay a PGN game
 * - Work with PGN tags and metadata
 * - Validate PGN strings
 */

import { Game, PgnParser } from '@rumenx/chess';

console.log('=== EXPORTING TO PGN ===\n');

// Play a short game
const game = new Game();
game.move({ from: 'e2', to: 'e4' });
game.move({ from: 'e7', to: 'e5' });
game.move({ from: 'g1', to: 'f3' });
game.move({ from: 'b8', to: 'c6' });
game.move({ from: 'f1', to: 'b5' }); // Spanish Opening

console.log('Played Spanish Opening (5 moves)');

// Export to PGN with custom tags
const pgn = PgnParser.generate(game, {
  Event: 'Example Game',
  Site: 'GitHub',
  Date: '2024.01.15',
  Round: '1',
  White: 'Player 1',
  Black: 'Player 2',
});

console.log('\nGenerated PGN:');
console.log(pgn);

console.log('\n=== IMPORTING FROM PGN ===\n');

// A famous game: Immortal Game (Anderssen vs Kieseritzky, 1851)
const immortalGame = `[Event "London"]
[Site "London ENG"]
[Date "1851.06.21"]
[Round "?"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6
7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6
1-0`;

console.log('Parsing Immortal Game PGN...\n');

// Parse the PGN
const parsed = PgnParser.parse(immortalGame);

console.log('=== PGN Tags ===');
console.log('Event:', parsed.tags.Event);
console.log('White:', parsed.tags.White);
console.log('Black:', parsed.tags.Black);
console.log('Date:', parsed.tags.Date);
console.log('Result:', parsed.tags.Result);

console.log('\n=== Moves ===');
console.log('Total moves:', parsed.moves.length);
console.log('First 6 moves:', parsed.moves.slice(0, 6));

console.log('\n=== REPLAYING A PGN GAME ===\n');

// Load and replay the game
const replayGame = PgnParser.loadGame(immortalGame);

if (replayGame) {
  console.log('Game loaded successfully!');
  console.log('Total moves played:', replayGame.getHistory().length);
  console.log('Final position:');
  console.log(replayGame.getBoard().toAscii());
  console.log('\nGame status:', replayGame.getStatus());
} else {
  console.log('Failed to load game');
}

console.log('\n=== PGN VALIDATION ===\n');

const validPgn = `[Event "Test"]
[Site "Test"]
[Date "2024.01.15"]
[Round "1"]
[White "White"]
[Black "Black"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 *`;

const invalidPgn = `[Event "Test"
1. e4 e5`; // Missing closing bracket and other tags

console.log('Validating correct PGN:');
console.log('Valid?', PgnParser.validate(validPgn));

console.log('\nValidating incorrect PGN:');
console.log('Valid?', PgnParser.validate(invalidPgn));

console.log('\n=== SCHOLAR\'S MATE EXAMPLE ===\n');

const scholarsMate = `[Event "Scholar's Mate"]
[Site "Example"]
[Date "2024.01.15"]
[Round "1"]
[White "Winner"]
[Black "Loser"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

console.log('Loading Scholar\'s Mate...');
const scholarsGame = PgnParser.loadGame(scholarsMate);

if (scholarsGame) {
  console.log('Moves played:', scholarsGame.getHistory().length);
  console.log('Final move:', scholarsGame.getHistory()[scholarsGame.getHistory().length - 1]);
  console.log('Game status:', scholarsGame.getStatus());
  console.log('Checkmate?', scholarsGame.getStatus() === 'checkmate');
  
  console.log('\nFinal position:');
  console.log(scholarsGame.getBoard().toAscii());
}

console.log('\n=== ROUND-TRIP CONVERSION ===\n');

// Create a game, export to PGN, then reload
const originalGame = new Game();
originalGame.move({ from: 'e2', to: 'e4' });
originalGame.move({ from: 'c7', to: 'c5' });
originalGame.move({ from: 'g1', to: 'f3' });
originalGame.move({ from: 'd7', to: 'd6' });

console.log('Original game - 4 moves played');

// Export to PGN
const exportedPgn = PgnParser.generate(originalGame, {
  Event: 'Round-trip Test',
  White: 'Original',
  Black: 'Game',
});

console.log('\nExported PGN:');
console.log(exportedPgn);

// Reload from PGN
const reloadedGame = PgnParser.loadGame(exportedPgn);

if (reloadedGame) {
  console.log('\nReloaded game:');
  console.log('Moves:', reloadedGame.getHistory().length);
  console.log('Turn:', reloadedGame.getTurn());
  console.log('Position matches?', 
    originalGame.getFen() === reloadedGame.getFen());
}

console.log('\n=== WORKING WITH COMMENTS ===\n');

// PGN with comments
const commentedPgn = `[Event "Annotated Game"]
[Site "Example"]
[Date "2024.01.15"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "*"]

1. e4 {King's Pawn Opening} e5 {Symmetric response}
2. Nf3 {Developing the knight} Nc6 {Black develops too}
*`;

console.log('Parsing PGN with comments...');
const commented = PgnParser.parse(commentedPgn);
console.log('Tags preserved:', Object.keys(commented.tags).length);
console.log('Moves extracted:', commented.moves.length);
console.log('Comments are removed from move list');
console.log('Moves:', commented.moves);
