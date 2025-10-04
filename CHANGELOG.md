# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- WebSocket support for real-time multiplayer games
- Expanded opening book (500+ positions with transposition detection)
- LLM-powered AI chess coach with move explanations
- AI personality system with contextual commentary

## [1.0.0] - 2025-10-04

### Added

#### Core Chess Engine ♟️
- Complete implementation of chess rules and game logic
- All piece movements (pawns, knights, bishops, rooks, queens, kings)
- Special moves: castling (kingside/queenside), en passant, pawn promotion
- Check, checkmate, and stalemate detection
- Draw conditions: insufficient material, fifty-move rule, threefold repetition
- Full move validation preventing illegal moves
- Board representation with 8x8 grid and piece management
- Move history with undo support
- Position repetition tracking
- Castling rights management

#### FEN & PGN Support 📝
- FEN (Forsyth-Edwards Notation) parser and generator
- FEN validation and position import/export
- PGN (Portable Game Notation) parser and generator
- Seven Tag Roster support
- SAN (Standard Algebraic Notation) move representation
- PGN comments and variations support
- Game metadata handling

#### AI Opponents 🤖
- **Random AI**: Simple baseline opponent for testing
- **Minimax AI**: Competitive play with alpha-beta pruning
- **Six Difficulty Levels**:
  - Harmless (depth 1, 50% randomness) - Very weak for beginners
  - Easy (depth 2, 30% randomness) - Learning players
  - Medium (depth 3, 10% randomness) - Balanced opponent
  - Hard (depth 4, 5% randomness) - Intermediate challenge
  - Expert (depth 5, no randomness) - Strong tactical play
  - Godlike (depth 6, no randomness) - Maximum strength
- **Position Evaluation System**:
  - Material counting with standard piece values
  - Piece-square tables for positional understanding
  - Endgame detection and strategy switching
  - Combined material and positional evaluation
- **Performance Optimizations**:
  - Alpha-beta pruning (50%+ node reduction)
  - Configurable time limits and search depth
  - 1000+ positions evaluated per second
  - Move ordering for better pruning

#### Opening Book System 📖
- Professional opening theory database
- 40+ positions covering 14 major opening systems:
  - Italian Game, Ruy Lopez, Sicilian Defense
  - Queen's Gambit, King's Indian Defense, Nimzo-Indian Defense
  - French Defense, Caro-Kann Defense, English Opening
  - Réti Opening, and more
- ECO (Encyclopedia of Chess Openings) classification
- Instant move retrieval (<1ms vs 50-150ms minimax)
- Weighted move selection for realistic variety
- Configurable behavior:
  - Enable/disable on demand
  - Maximum depth limiting (default: 12 moves)
  - Randomized or deterministic selection
  - Minimum weight filtering
- Expandable database from JSON files
- Opening statistics and analytics

#### REST API Server 🌐
- **14 RESTful Endpoints** for complete game management:
  - Health check and version info
  - Game lifecycle (create, get, list, delete)
  - Move operations (make move, undo, history)
  - AI integration (ai-move, ai-hint)
  - Position analysis (legal moves, evaluation)
  - FEN/PGN import/export
- Express-based server with production features:
  - CORS support with configurable origins
  - Gzip compression for response optimization
  - Request timeout handling
  - Comprehensive error handling and validation
  - Input sanitization and validation
  - Game limit management (max 1000 concurrent games)
- Pagination support for game lists
- Detailed game state responses
- Move validation with error messages

#### TypeScript Support 🔒
- Full TypeScript implementation with strict mode
- Comprehensive type definitions for all chess entities
- Type-safe API with IntelliSense support
- Strict null checks throughout codebase
- Generic types for extensibility
- Type guards for runtime safety

#### Testing & Quality 🧪
- **326 comprehensive tests** (100% pass rate):
  - 236 unit tests (engine, AI, opening book)
  - 90 integration tests (game scenarios, API endpoints)
- **88.76% code coverage**:
  - 89.61% line coverage
  - 94.21% function coverage
  - 77.43% branch coverage
- Test scenarios:
  - Famous games (Immortal Game, Opera Game, Evergreen Game)
  - Checkmate patterns (Scholar's, Fool's, back rank, smothered)
  - Draw conditions (stalemate, insufficient material, repetition)
  - Special moves (en passant, castling, promotion)
  - AI performance benchmarks
  - REST API integration tests
  - Edge cases and error handling
- Continuous Integration with GitHub Actions
- Automated test runs on all commits

#### Documentation 📖
- Comprehensive README with examples
- JSDoc comments on all public APIs
- 5 detailed usage examples:
  - Basic game operations
  - Special moves (castling, en passant, promotion)
  - FEN notation import/export
  - PGN notation handling
  - AI opponents and difficulty levels
  - Opening book usage
  - REST API server setup
- Complete API reference
- Architecture documentation
- Testing strategy guide
- Contributing guidelines
- Code of Conduct
- Security policy

#### Development Infrastructure 🏗️
- Dual module system (ESM + CommonJS)
- TypeScript configuration for multiple targets
- Jest testing framework with ts-jest
- ESLint with TypeScript rules
- Prettier code formatting
- GitHub Actions CI/CD pipeline
- Automated npm publishing workflow
- Code coverage reporting
- Build optimization and minification

### Changed

- Improved move generation performance
- Enhanced position evaluation algorithms
- Optimized alpha-beta pruning efficiency
- Refined difficulty level balancing
- Updated TypeScript to 5.6.3
- Upgraded Jest to 29.7.0

### Fixed

- Opening book timing test flakiness (increased threshold to 300ms)
- UUID ESM import compatibility (switched to Node's crypto.randomUUID)
- Test coverage calculation for edge cases
- Memory leaks in game cleanup
- Castling rights validation edge cases

---

## Release Types

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

## Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

---

[Unreleased]: https://github.com/RumenDamyanov/npm-chess/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/RumenDamyanov/npm-chess/releases/tag/v1.0.0
