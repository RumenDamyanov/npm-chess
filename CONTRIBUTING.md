# Contributing to npm-chess

Thank you for your interest in contributing to npm-chess! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following our coding standards
5. **Test your changes**: `npm test`
6. **Submit a pull request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/npm-chess.git
cd npm-chess

# Install dependencies
npm install

# Run tests
npm test

# Run in development mode
npm run dev

# Build the project
npm run build
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests (fast)
npm run test:fast

# Run with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checking
npm run typecheck
```

## Pull Request Process

1. **Update documentation** for any user-facing changes
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass** (`npm test`)
4. **Ensure code is properly formatted** (`npm run format`)
5. **Ensure linting passes** (`npm run lint`)
6. **Update CHANGELOG.md** with a description of your changes
7. **Request review** from maintainers

### PR Requirements

- ✅ All tests must pass
- ✅ Code coverage must not decrease (maintain >90%)
- ✅ Linting must pass with no warnings
- ✅ TypeScript must compile without errors
- ✅ Documentation must be updated
- ✅ Commit messages must follow our guidelines

## Coding Standards

### TypeScript

- Use **strict TypeScript** (strict mode enabled)
- Prefer **interfaces** over type aliases for object shapes
- Use **type imports** (`import type { ... }`) when importing only types
- Avoid `any` types - use `unknown` or proper types
- Document public APIs with JSDoc comments

### File Structure

```
src/
├── engine/       # Core chess engine
├── ai/           # AI implementations
├── api/          # REST API (optional)
├── types/        # Type definitions
└── utils/        # Utility functions
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`

### Code Style

- Use **Prettier** for formatting (configured in `.prettierrc`)
- Follow **ESLint** rules (configured in `eslint.config.cjs`)
- Maximum line length: **100 characters**
- Use **single quotes** for strings
- Use **semicolons**

## Testing Guidelines

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = ...;

      // Act
      const result = ...;

      // Assert
      expect(result).toBe(...);
    });
  });
});
```

### Coverage Requirements

- **Overall coverage**: >90%
- **Engine module**: 100% coverage required
- **AI module**: >95% coverage
- **API module**: >85% coverage
- **Utils**: >90% coverage

### Test Types

1. **Unit Tests**: Test individual functions/classes in isolation
2. **Integration Tests**: Test module interactions
3. **API Tests**: Test REST API endpoints (if applicable)
4. **Performance Tests**: Ensure AI moves complete in reasonable time

### What to Test

- ✅ All public APIs
- ✅ Edge cases and error conditions
- ✅ Chess rules compliance
- ✅ Move validation
- ✅ Game state transitions
- ✅ AI move generation
- ✅ FEN/PGN parsing and generation

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```
feat(engine): add support for Chess960

fix(ai): correct minimax evaluation for endgame

docs(readme): update installation instructions

test(moves): add tests for en passant captures
```

## Bug Reports

When reporting bugs, please include:

1. **Description** of the issue
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment** (Node version, OS, etc.)
6. **Code sample** or test case (if applicable)

## Feature Requests

When requesting features, please include:

1. **Use case** description
2. **Proposed solution**
3. **Alternatives considered**
4. **Additional context**

## Questions?

If you have questions:

- Open an issue with the `question` label
- Contact: contact@rumenx.com
- Check existing documentation in `/wiki`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to npm-chess! 🚀♟️
