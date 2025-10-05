# 🤖 npm-chess

[![CI](https://github.com/RumenDamyanov/npm-chess/actions/workflows/ci.yml/badge.svg)](https://github.com/RumenDamyanov/npm-chess/actions)
[![CodeQL](https://github.com/RumenDamyanov/npm-chess/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/RumenDamyanov/npm-chess/actions/workflows/github-code-scanning/codeql)
[![Dependabot](https://github.com/RumenDamyanov/npm-chess/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/RumenDamyanov/npm-chess/actions/workflows/dependabot/dependabot-updates)
[![codecov](https://codecov.io/gh/RumenDamyanov/npm-chess/branch/master/graph/badge.svg)](https://codecov.io/gh/RumenDamyanov/npm-chess)
[![npm version](https://img.shields.io/npm/v/@rumenx/chess.svg)](https://www.npmjs.com/package/@rumenx/chess)

A powerful, type-safe chess engine library for TypeScript/JavaScript applications with complete chess rules implementation, FEN/PGN support, AI opponents with opening book, REST API, and comprehensive test coverage.

## 📦 Part of the Chess Family

This is the TypeScript/JavaScript implementation of our multi-language chess engine:

- 📘 **npm-chess** - TypeScript/JavaScript (this package)
- 🐹 [go-chess](https://github.com/RumenDamyanov/go-chess) - Go implementation
- 🎨 [js-chess](https://github.com/RumenDamyanov/js-chess) - Frontend showcase examples

All implementations share the same API design and features, making it easy to switch between languages or maintain consistency across polyglot projects.

## ✨ Features

### ✅ Implemented (Phase 2 - Core Engine)

- ♟️ **Complete Chess Engine** - Full implementation of chess rules
  - All piece movements (pawns, knights, bishops, rooks, queens, kings)
  - Special moves: castling (kingside/queenside), en passant, pawn promotion
  - Check, checkmate, and stalemate detection
  - Draw conditions: insufficient material, fifty-move rule, threefold repetition
- 🎯 **Move Validation** - Robust legal move checking
  - Generate all legal moves for current position
  - Validate moves before execution
  - Prevent moves that leave king in check
- 📝 **FEN & PGN Support** - Standard chess notation
  - Import/export positions using FEN (Forsyth-Edwards Notation)
  - Import/export games using PGN (Portable Game Notation)
  - Support for Seven Tag Roster and SAN (Standard Algebraic Notation)
  - Comments and variations in PGN
- 🔄 **Game Management** - Complete game state control
  - Full move history with undo support
  - Position repetition tracking
  - Castling rights management
  - Half-move and full-move clock tracking
- 🔒 **Type-Safe** - Full TypeScript support
  - Comprehensive type definitions for all chess entities
  - Strict null checks and type safety throughout
- 🧪 **Extensively Tested** - **326 passing tests** (100% pass rate, 88.76% coverage)
  - 236 unit tests covering all engine and AI components
  - 42 integration tests for complete game scenarios
  - 28 opening book tests covering lookup, selection, and integration
  - 27 REST API integration tests for all endpoints
  - Famous games, checkmate patterns, draw scenarios
  - Edge cases and error handling
- 📖 **Well Documented** - Comprehensive documentation
  - JSDoc comments on all public APIs
  - 5 detailed usage examples with explanations
  - Complete API reference in README

### ✅ Implemented (Phase 3 - AI Opponents)

- 🤖 **AI Engines** - Multiple AI implementations
  - Random AI: Simple baseline opponent
  - Minimax AI: Competitive play with alpha-beta pruning
- 🎯 **Six Difficulty Levels**
  - **Harmless**: Depth 1, 50% randomness - Very weak, great for absolute beginners
  - **Easy**: Depth 2, 30% randomness - Good for learning players
  - **Medium**: Depth 3, 10% randomness - Balanced opponent
  - **Hard**: Depth 4, 5% randomness - Challenging for intermediate players
  - **Expert**: Depth 5, no randomness - Strong tactical play
  - **Godlike**: Depth 6, no randomness - Maximum strength, near-perfect play

- 📊 **Position Evaluation** - Sophisticated board analysis
  - Material counting with standard piece values
  - Piece-square tables for positional understanding
  - Endgame detection and strategy switching
  - Combines material advantage with piece placement

- ⚡ **Performance Optimized**
  - Alpha-beta pruning reduces search nodes by 50%+
  - Configurable time limits and search depth
  - 1000+ positions evaluated per second

### ✅ Implemented (Phase 4A - Opening Book)

- 📖 **Opening Book System** - Professional opening theory
  - 40+ positions covering 14 major opening systems
  - ECO (Encyclopedia of Chess Openings) classification
  - Instant moves (<1ms) vs minimax search (50-150ms)
  - Weighted move selection for realistic variety
  - Italian Game, Ruy Lopez, Sicilian, French, Queen's Gambit, King's Indian, and more
- ⚙️ **Configurable Behavior**
  - Deterministic or randomized move selection
  - Minimum weight filtering
  - Maximum depth limiting
  - Enable/disable on demand
- 🎨 **Customizable Database**
  - Load comprehensive databases from JSON files
  - Create custom opening repertoires
  - Expand with your preferred variations

### ✅ Implemented (Phase 5 - REST API)

- 🌐 **REST API Server** - Complete HTTP API for game management
  - 14 RESTful endpoints for full game control
  - Express-based with compression and CORS support
  - Game lifecycle management (create, get, list, delete)
  - Move operations (make move, undo, history)
  - AI integration (ai-move, ai-hint)
  - Analysis endpoints (legal moves, position analysis)
  - FEN/PGN import/export via API
  - Comprehensive error handling and validation
  - 27 integration tests covering all endpoints

### 🔮 Planned Features (v1.1.0+)

- ⚡ **WebSocket Support** - Real-time game updates and live multiplayer

- 🎓 **AI Chess Coach** - LLM-powered coaching with position analysis and move explanations (experimental)
- 🎭 **AI Personality System** - Give AI opponents personality with contextual commentary
- 📚 **Expanded Opening Book** - Grow from 40 to 500+ positions with transposition detection

See [FUTURE_FEATURES_ROADMAP.md](.ai/FUTURE_FEATURES_ROADMAP.md) for detailed information about upcoming features.

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Project Structure](#%EF%B8%8F-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 📦 Installation

```bash
# Using npm
npm install @rumenx/chess

# Using yarn
yarn add @rumenx/chess

# Using pnpm
pnpm add @rumenx/chess
```

## 🚀 Quick Start

```typescript
import { Game } from '@rumenx/chess';

// Create a new chess game
const game = new Game();

// Make a move
game.move({ from: 'e2', to: 'e4' });

// Get current position in FEN notation
console.log(game.getFen());
// Output: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

// Get legal moves for a piece
const legalMoves = game.getLegalMovesFrom('e7');
console.log(legalMoves);
// Output: [{ from: 'e7', to: 'e6', ... }, { from: 'e7', to: 'e5', ... }]

// Check game status
console.log(game.getStatus());
// Output: 'active'
```

## 💡 Usage Examples

For detailed examples, see the [examples/](examples/) directory.

### Basic Game

```typescript
import { Game } from '@rumenx/chess';

const game = new Game();

// Make moves
game.move({ from: 'e2', to: 'e4' });
game.move({ from: 'e7', to: 'e5' });
game.move({ from: 'g1', to: 'f3' });

// Get move history
console.log(game.getHistory());

// Check game status
console.log(game.getStatus()); // 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw'
```

### Special Moves

```typescript
// Castling
game.move({ from: 'e1', to: 'g1' }); // Kingside castling

// Pawn promotion
game.move({ from: 'e7', to: 'e8', promotion: 'queen' });

// En passant (automatically detected)
game.move({ from: 'e5', to: 'd6' }); // Captures pawn on d5
```

### FEN Import/Export

```typescript
import { Game, FenParser } from '@rumenx/chess';

// Load a position from FEN
const game = new Game();
game.loadFen('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');

// Get current position as FEN
const fen = game.getFen();

// Validate FEN before loading
if (FenParser.validate(fenString)) {
  game.loadFen(fenString);
}
```

### PGN Import/Export

```typescript
import { PgnParser } from '@rumenx/chess';

// Export game to PGN
const pgn = PgnParser.generate(game, {
  Event: 'Casual Game',
  Site: 'Local',
  Date: '2024.01.15',
  White: 'Player 1',
  Black: 'Player 2',
});

// Load and replay a PGN game
const pgnString = `[Event "Example"]
1. e4 e5 2. Nf3 Nc6 *`;

const replayGame = PgnParser.loadGame(pgnString);
```

### Undoing Moves

```typescript
const game = new Game();
game.move({ from: 'e2', to: 'e4' });
game.move({ from: 'e7', to: 'e5' });

// Undo the last move
const undoneMove = game.undo();

console.log(undoneMove); // { from: 'e7', to: 'e5', ... }
```

### Board Visualization

```typescript
// Get ASCII representation of the board
console.log(game.getBoard().toAscii());

// Output:
// ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
// ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
// · · · · · · · ·
// · · · · · · · ·
// · · · · · · · ·
// · · · · · · · ·
// ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
// ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
```

### AI Opponents

Play against computer opponents with six difficulty levels:

```typescript
import { Game } from '@rumenx/chess';
import { MinimaxAI, RandomAI } from '@rumenx/chess';

const game = new Game();

// Create an AI opponent
const ai = new MinimaxAI({ difficulty: 'medium' });

// Get the AI's best move
const move = await ai.getBestMove(game);
game.move(move);

// Get detailed analysis
const analysis = await ai.analyze(game);
console.log('Best move:', analysis.bestMove);
console.log('Score:', analysis.score);
console.log('Thinking time:', analysis.thinkingTime, 'ms');
console.log('Nodes evaluated:', analysis.nodesEvaluated);
```

#### Available Difficulty Levels

| Level        | Depth | Randomness | Description                             |
| ------------ | ----- | ---------- | --------------------------------------- |
| **harmless** | 1     | 50%        | Very weak, great for absolute beginners |
| **easy**     | 2     | 30%        | Good for learning players               |
| **medium**   | 3     | 10%        | Balanced opponent                       |
| **hard**     | 4     | 5%         | Challenging for intermediate players    |
| **expert**   | 5     | 0%         | Strong tactical play                    |
| **godlike**  | 6     | 0%         | Maximum strength, near-perfect play     |

```typescript
// Try different difficulty levels
const harmless = new MinimaxAI({ difficulty: 'harmless' }); // Easiest
const easy = new MinimaxAI({ difficulty: 'easy' });
const medium = new MinimaxAI({ difficulty: 'medium' });
const hard = new MinimaxAI({ difficulty: 'hard' });
const expert = new MinimaxAI({ difficulty: 'expert' });
const godlike = new MinimaxAI({ difficulty: 'godlike' }); // Hardest

// Custom configuration
const custom = new MinimaxAI({
  difficulty: 'expert',
  maxThinkingTime: 5000, // 5 seconds max
  maxDepth: 6, // Search up to 6 moves ahead
  randomness: 0.05, // 5% randomness
});

// Simple random opponent (for testing)
const random = new RandomAI();
const randomMove = await random.getBestMove(game);
```

### Opening Book

Make your AI play like a chess master by using an opening book database:

```typescript
import { Game } from '@rumenx/chess';
import { MinimaxAI, createDefaultOpeningBook, loadOpeningBookFromFile } from '@rumenx/chess';

// Create a default opening book (includes 10 common positions)
const openingBook = createDefaultOpeningBook();

// Use opening book with AI
const ai = new MinimaxAI({ difficulty: 'medium' }, openingBook);

// Make a move - AI will use opening book when position is found
const game = new Game();
const analysis = await ai.analyze(game);

// Check if opening book was used
if (analysis.openingName) {
  console.log('Opening:', analysis.openingName); // e.g., "King's Pawn Opening"
  console.log('ECO Code:', analysis.eco); // e.g., "C00"
}

// Load comprehensive opening database from file (Node.js)
const comprehensiveBook = await loadOpeningBookFromFile('./data/opening-book.json');
ai.setOpeningBook(comprehensiveBook);

// Configure opening book behavior
openingBook.configure({
  enabled: true, // Enable/disable the book
  maxDepth: 12, // Use book up to move 12
  randomize: true, // Weighted random move selection
  minWeight: 10, // Filter moves below this weight
});

// Get opening book statistics
const stats = openingBook.getStats();
console.log('Positions:', stats.positionCount); // Number of positions in book
console.log('Total moves:', stats.totalMoves); // Total moves available
```

#### Key Features

- **Instant Moves**: Opening book provides moves in <1ms vs 50-150ms for minimax search
- **Professional Play**: Uses established chess theory instead of calculating from scratch
- **40+ Positions**: Default book covers 14 major opening systems:
  - Italian Game, Ruy Lopez, Sicilian Defense
  - Queen's Gambit, King's Indian Defense, Nimzo-Indian
  - French Defense, Caro-Kann, English Opening, Réti, and more
- **ECO Classification**: Each move includes ECO (Encyclopedia of Chess Openings) code
- **Customizable**: Create your own opening repertoire or load comprehensive databases
- **Weighted Selection**: Moves have weights for realistic variety

#### Opening Book API

```typescript
// Create an opening book
import { OpeningBook, type OpeningBookData } from '@rumenx/chess';

const book = new OpeningBook();

// Load data
const data: OpeningBookData = {
  version: '1.0.0',
  maxDepth: 12,
  positions: {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
      { move: 'e4', weight: 45, eco: 'C00', name: "King's Pawn Opening" },
      { move: 'd4', weight: 40, eco: 'D00', name: "Queen's Pawn Opening" },
    ],
  },
};
book.loadData(data);

// Query the book
const move = book.getMove(game); // Get move for current position
const moves = book.getMoves(fen); // Get all moves for FEN position
const hasPosition = book.hasPosition(fen); // Check if position exists

// Configuration
book.configure({
  randomize: false, // Always pick highest-weighted move
  minWeight: 20, // Only consider moves with weight >= 20
  maxDepth: 8, // Only use book for first 8 moves
});
```

For complete examples, see [examples/opening-book-usage.ts](examples/opening-book-usage.ts).

## 🌐 REST API Server

The library includes a production-ready REST API server for integrating chess functionality into web applications.

### Starting the API Server

```typescript
import { ApiServer } from '@rumenx/chess';

const server = new ApiServer({
  port: 3000,
  cors: {
    origin: '*',
    credentials: true,
  },
  compression: true,
});

await server.start();
console.log('Chess API server running on http://localhost:3000');
```

### API Endpoints

#### Health & Info

- `GET /health` - Health check endpoint
- `GET /version` - Get API version information

#### Game Management

- `POST /games` - Create a new game (optional: custom FEN)
- `GET /games/:id` - Get game by ID
- `GET /games` - List all games (supports pagination: `?page=1&limit=10`)
- `DELETE /games/:id` - Delete a game

#### Move Operations

- `POST /games/:id/moves` - Make a move (`{ from, to, promotion? }`)
- `GET /games/:id/moves` - Get move history
- `POST /games/:id/undo` - Undo last move

#### AI Operations

- `POST /games/:id/ai-move` - Let AI make a move (`{ difficulty? }`)
- `POST /games/:id/ai-hint` - Get AI move suggestion without making it

#### Analysis & Export

- `GET /games/:id/analysis` - Get position analysis
- `GET /games/:id/legal-moves` - Get all legal moves (optional: `?square=e2`)
- `POST /games/:id/fen` - Load position from FEN (`{ fen }`)
- `GET /games/:id/pgn` - Export game to PGN

### Example API Usage

```bash
# Create a new game
curl -X POST http://localhost:3000/games

# Make a move
curl -X POST http://localhost:3000/games/{gameId}/moves \
  -H "Content-Type: application/json" \
  -d '{"from": "e2", "to": "e4"}'

# Get AI move suggestion
curl -X POST http://localhost:3000/games/{gameId}/ai-hint \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "medium"}'

# Get position analysis
curl http://localhost:3000/games/{gameId}/analysis

# Export to PGN
curl http://localhost:3000/games/{gameId}/pgn
```

### API Configuration

```typescript
interface ApiServerConfig {
  port?: number; // Server port (default: 3000)
  host?: string; // Host address (default: '0.0.0.0')
  cors?: CorsOptions; // CORS configuration
  compression?: boolean; // Enable gzip compression (default: true)
  maxGames?: number; // Max concurrent games (default: 1000)
  requestTimeout?: number; // Request timeout in ms (default: 30000)
}
```

For a complete REST API example, see [examples/api-server.ts](examples/api-server.ts).

## 📚 API Reference

### Core Classes

#### `Game`

Main game controller class.

```typescript
class Game {
  constructor(config?: GameConfig);

  // Making moves
  move(moveOptions: MoveOptions): Move | null;
  undo(): Move | null;

  // Getting legal moves
  getLegalMoves(): Move[];
  getLegalMovesFrom(square: Square): Move[];

  // Game state
  getStatus(): GameStatus; // 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw'
  getTurn(): Color; // 'white' | 'black'
  getHistory(): Move[];
  getBoard(): Board;

  // Position information
  getPosition(): PositionData;
  getCastlingRights(): CastlingRights;
  getEnPassantSquare(): Square | null;
  getHalfMoveClock(): number;
  getFullMoveNumber(): number;

  // FEN import/export
  loadFen(fen: string): void;
  getFen(): string;

  // Utility
  reset(): void;
  refreshMoveGenerator(): void;
}
```

#### `Board`

Board representation and piece manipulation.

```typescript
class Board {
  constructor(initialBoard?: (Piece | null)[][]);

  // Piece operations
  setupStartingPosition(): void;
  getPiece(square: Square): Piece | null;
  setPiece(square: Square, piece: Piece | null): void;
  movePiece(from: Square, to: Square): Piece | null;

  // Square utilities
  squareToCoords(square: Square): Coordinates | null;
  coordsToSquare(row: number, col: number): Square | null;
  isValidSquare(square: Square): boolean;
  isEmpty(square: Square): boolean;
  isOccupiedBy(square: Square, color: Color): boolean;

  // Finding pieces
  findPieces(color: Color): Array<{ square: Square; piece: Piece }>;
  findKing(color: Color): Square | null;

  // Utility
  clone(): Board;
  clear(): void;
  toAscii(): string;
  toString(): string;
}
```

#### `FenParser`

Parse and generate FEN notation.

```typescript
class FenParser {
  static readonly STARTING_POSITION: Fen;

  static parse(fen: Fen): {
    board: Board;
    turn: Color;
    castlingRights: CastlingRights;
    enPassantSquare: Square | null;
    halfMoveClock: number;
    fullMoveNumber: number;
  };

  static generate(
    board: Board,
    turn: Color,
    castlingRights: CastlingRights,
    enPassantSquare: Square | null,
    halfMoveClock: number,
    fullMoveNumber: number
  ): Fen;

  static validate(fen: Fen): boolean;
}
```

#### `PgnParser`

Parse and generate PGN notation.

```typescript
interface PgnTags {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  [key: string]: string | undefined;
}

class PgnParser {
  static parse(pgn: Pgn): PgnGame;
  static generate(game: Game, tags?: PgnTags): Pgn;
  static loadGame(pgn: Pgn): Game | null;
  static validate(pgn: Pgn): boolean;
}
```

### Type Definitions

```typescript
type Square = string; // e.g., 'e4', 'a1', 'h8'
type Color = 'white' | 'black';
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw';

interface Piece {
  type: PieceType;
  color: Color;
}

interface MoveOptions {
  from: Square;
  to: Square;
  promotion?: PieceType; // Required when pawn reaches last rank
}

interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castling?: 'kingside' | 'queenside';
  enPassant?: boolean;
  check?: boolean;
  checkmate?: boolean;
  san?: string; // Standard Algebraic Notation
}

interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}
```

## 🧪 Testing

The project maintains excellent test coverage with **326 comprehensive tests** and **88.76% code coverage**.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- **Unit Tests** (236 tests): Test individual functions and classes
  - Board representation and manipulation
  - Piece movement patterns
  - Move generation and validation
  - Game state management
  - FEN parser and generator
  - PGN parser and generator
  - AI engines and evaluation
  - Opening book system

- **Integration Tests** (90 tests): Test complete game scenarios and APIs
  - Famous games (Immortal Game, Opera Game)
  - Checkmate patterns (Scholar's Mate, Fool's Mate, back rank, smothered)
  - Draw scenarios (stalemate, insufficient material, repetition)
  - Special moves (en passant, castling, promotion)
  - FEN/PGN import/export workflows
  - REST API endpoints (27 tests covering all 14 endpoints)
  - AI performance benchmarks
  - Error handling and edge cases

## 🏗️ Project Structure

```text
npm-chess/
├── .ai/                    # AI agent instructions
│   ├── instructions.md     # Main development guide
│   ├── architecture.md     # Architecture details
│   ├── api-design.md       # API specifications (planned)
│   ├── testing-strategy.md # Testing approach
│   └── project-plan.md     # Project roadmap
├── src/
│   ├── engine/            # Core chess engine
│   │   ├── board.ts       # Board representation (365 lines)
│   │   ├── pieces.ts      # Piece movement patterns (370 lines)
│   │   ├── moves.ts       # Move generation/validation (540 lines)
│   │   ├── game.ts        # Game state management (830 lines)
│   │   ├── fen.ts         # FEN parser/generator (403 lines)
│   │   ├── pgn.ts         # PGN parser/generator (547 lines)
│   │   └── index.ts       # Engine exports
│   ├── ai/                # AI opponents
│   │   ├── engine.ts      # Base AI interface
│   │   ├── random.ts      # Random move AI
│   │   ├── minimax.ts     # Minimax with alpha-beta pruning
│   │   ├── evaluation.ts  # Position evaluation
│   │   ├── opening-book.ts # Opening book system
│   │   └── index.ts       # AI exports
│   ├── api-server.ts      # REST API server (298 lines)
│   ├── types/             # TypeScript definitions
│   │   └── index.ts       # Core type definitions
│   └── index.ts           # Main entry point
├── tests/                 # Test suite (326 tests, 88.76% coverage)
│   ├── unit/              # Unit tests (236 tests)
│   │   ├── engine/        # Engine tests
│   │   └── ai/            # AI tests
│   └── integration/       # Integration tests (90 tests)
│       ├── api-server.test.ts  # API tests (27 tests)
│       └── ...            # Game scenario tests
├── examples/              # Usage examples
│   ├── 01-basic-game.ts   # Basic game operations
│   ├── 02-special-moves.ts # Castling, en passant, promotion
│   ├── 03-fen-notation.ts # FEN import/export
│   ├── 04-pgn-notation.ts # PGN import/export
│   ├── 05-game-status.ts  # Status checking and undo
│   └── README.md          # Examples documentation
└── wiki/                  # GitHub wiki source
```

### Development Status

**v1.0.x: Production Release** ✅ **COMPLETE**

- ✅ **Core Chess Engine** - Complete implementation of chess rules
- ✅ **AI Opponents** - 6 difficulty levels with minimax and opening book
- ✅ **REST API Server** - 14 endpoints for game management
- ✅ **FEN/PGN Support** - Full import/export functionality
- ✅ **Type Safety** - Comprehensive TypeScript definitions
- ✅ **Test Coverage** - 326 tests with 88.76% coverage
- ✅ **Documentation** - Complete API reference and examples

**v1.1.0: Planned Enhancements**

- WebSocket support for real-time multiplayer
- Expanded opening book (500+ positions)
- AI chess coach with LLM integration
- Personality system for AI opponents

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/RumenDamyanov/npm-chess.git
cd npm-chess

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run examples
npm run example:basic
```

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🔒 Security

For security vulnerabilities, please see our [Security Policy](SECURITY.md) or email security@rumenx.com.

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 💖 Support

If you find this library helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs via [GitHub Issues](https://github.com/RumenDamyanov/npm-chess/issues)
- 💡 Suggesting new features
- 📖 Improving documentation
- 💰 [Sponsoring the project](FUNDING.md)

---

Made with ♟️ by [Rumen Damyanov](https://github.com/RumenDamyanov)
