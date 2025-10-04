/**
 * Example: REST API Server
 *
 * Demonstrates how to create and run a chess REST API server.
 * This example shows how to start the server and handle basic game operations.
 *
 * To run this example:
 *   npm run example:api
 *
 * Then test the API using curl or any HTTP client:
 *   curl http://localhost:3000/api/v1/health
 *   curl -X POST http://localhost:3000/api/v1/games
 */

import { ApiServer } from '../src/api-server';

async function main() {
  console.log('🚀 Starting Chess REST API Server...\n');

  // Create API server with configuration
  const server = new ApiServer({
    port: 3000,
    cors: {
      origin: '*', // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    compression: true
  });

  // Start the server
  server.listen(3000, () => {
    console.log('✅ Chess API Server is running!\n');
    console.log('📍 Base URL: http://localhost:3000/api/v1\n');
    console.log('Available endpoints:');
    console.log('  GET    /health                    - Health check');
    console.log('  GET    /version                   - API version info');
    console.log('  POST   /games                     - Create new game');
    console.log('  GET    /games/:id                 - Get game state');
    console.log('  GET    /games                     - List all games');
    console.log('  DELETE /games/:id                 - Delete game');
    console.log('  POST   /games/:id/moves           - Make a move');
    console.log('  GET    /games/:id/moves           - Get move history');
    console.log('  POST   /games/:id/undo            - Undo last move');
    console.log('  POST   /games/:id/ai-move         - AI makes a move');
    console.log('  POST   /games/:id/ai-hint         - Get AI hint (no move)');
    console.log('  GET    /games/:id/analysis        - Analyze position');
    console.log('  GET    /games/:id/legal-moves     - Get legal moves');
    console.log('  POST   /games/:id/fen             - Load from FEN');
    console.log('  GET    /games/:id/pgn             - Export to PGN\n');
    console.log('Example requests:');
    console.log('  curl http://localhost:3000/api/v1/health');
    console.log('  curl -X POST http://localhost:3000/api/v1/games -H "Content-Type: application/json" -d \'{}\'');
    console.log('  curl -X POST http://localhost:3000/api/v1/games/<id>/moves -H "Content-Type: application/json" -d \'{"from":"e2","to":"e4"}\'');
    console.log('\n🔥 Press Ctrl+C to stop the server\n');
  });
}

// Run the server
main().catch(console.error);
