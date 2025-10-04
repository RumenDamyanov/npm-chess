# npm-chess Examples

This directory contains comprehensive examples demonstrating how to use the @rumenx/chess library.

## Running the Examples

Each example is a standalone TypeScript file that can be run directly:

```bash
npm install
npx ts-node examples/01-basic-game.ts
```

Or compile and run:

```bash
npm run build
node dist/examples/01-basic-game.js
```

## Examples Overview

### 01. Basic Game (`01-basic-game.ts`)
Learn the fundamentals:
- Creating a new chess game
- Making moves using square notation (e.g., `{ from: 'e2', to: 'e4' }`)
- Checking the current game status
- Getting all legal moves
- Getting legal moves from a specific square
- Displaying the board

### 02. Special Moves (`02-special-moves.ts`)
Master special chess moves:
- **Castling**: Both kingside (O-O) and queenside (O-O-O)
- **En Passant**: Capturing pawns that just moved two squares
- **Pawn Promotion**: Promoting pawns to queens, rooks, bishops, or knights
- **Move Validation**: Understanding legal and illegal moves

### 03. FEN Notation (`03-fen-notation.ts`)
Work with Forsyth-Edwards Notation:
- Loading positions from FEN strings
- Exporting current position to FEN
- Validating FEN strings
- Continuing play from a loaded position
- Saving and restoring game state

### 04. PGN Notation (`04-pgn-notation.ts`)
Import and export complete games:
- Exporting games to PGN format
- Importing and replaying PGN games
- Working with PGN tags and metadata
- Validating PGN strings
- Round-trip conversion (Game → PGN → Game)
- Handling comments in PGN

### 05. Game Status (`05-game-status.ts`)
Monitor and control game state:
- Detecting check, checkmate, and stalemate
- Identifying draw conditions:
  - Insufficient material
  - Fifty-move rule
  - Threefold repetition
- Undoing moves
- Managing move history
- Resetting the game

## Key Concepts

### Square Notation
Squares are referenced using algebraic notation (file + rank):
- Files: `a-h` (left to right)
- Ranks: `1-8` (bottom to top from white's perspective)
- Examples: `e4`, `a1`, `h8`

### Move Objects
Moves are represented as objects:
```typescript
{
  from: 'e2',      // Starting square
  to: 'e4',        // Destination square
  promotion?: 'queen' | 'rook' | 'bishop' | 'knight'  // For pawn promotion
}
```

### Game Status
The game can be in one of these states:
- `'active'` - Game in progress
- `'check'` - Current player's king is in check
- `'checkmate'` - Game over, current player is checkmated
- `'stalemate'` - Game over, current player has no legal moves but isn't in check
- `'draw'` - Game over, drawn by repetition, fifty-move rule, or insufficient material

## Common Patterns

### Creating and Playing a Game
```typescript
import { Game } from '@rumenx/chess';

const game = new Game();
game.move({ from: 'e2', to: 'e4' });
game.move({ from: 'e7', to: 'e5' });

console.log('Status:', game.getStatus());
console.log('Turn:', game.getTurn());
```

### Checking Legal Moves
```typescript
// Get all legal moves for current player
const moves = game.getLegalMoves();

// Get legal moves from a specific square
const pawnMoves = game.getLegalMovesFrom('e2');
```

### Loading from FEN
```typescript
import { Game, FenParser } from '@rumenx/chess';

const game = new Game();
game.loadFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
```

### Replaying a PGN Game
```typescript
import { PgnParser } from '@rumenx/chess';

const pgn = `[Event "Example"]
1. e4 e5 2. Nf3 Nc6 *`;

const game = PgnParser.loadGame(pgn);
console.log('Moves:', game.getHistory().length);
```

### Handling Errors
```typescript
// Invalid moves return null
const move = game.move({ from: 'e2', to: 'e5' });
if (!move) {
  console.log('Illegal move!');
}

// FEN/PGN validation
if (FenParser.validate(fenString)) {
  game.loadFen(fenString);
}

if (PgnParser.validate(pgnString)) {
  const game = PgnParser.loadGame(pgnString);
}
```

## Tips

1. **Always validate moves**: Check if the returned move is not `null` before assuming it succeeded
2. **Use type safety**: TypeScript will help you catch errors at compile time
3. **Check game status**: After each move, you can check if the game has ended
4. **Visualize the board**: Use `game.getBoard().toAscii()` for debugging
5. **Save game state**: Use FEN for positions and PGN for complete games
6. **Undo support**: You can undo moves to implement takeback features

## Next Steps

- Explore the [API documentation](../README.md)
- Check out the [test suite](../tests) for more examples
- Build your own chess application!
