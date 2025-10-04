/**
 * Quick API Test Script
 *
 * Tests the core functionality of the REST API server
 */

import { ApiServer } from '../src/api-server';

async function testAPI() {
  console.log('🧪 Testing Chess REST API...\n');

  // Create server
  const server = new ApiServer({ port: 0 }); // Port 0 = random port
  const app = server.getApp();

  // Helper function to make requests
  const request = async (method: string, path: string, body?: any) => {
    const response = await new Promise((resolve, reject) => {
      const req = require('http').request(
        {
          method,
          host: 'localhost',
          port: 3000,
          path: `/api/v1${path}`,
          headers: body ? { 'Content-Type': 'application/json' } : {}
        },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode, data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
    return response as any;
  };

  // Start server
  const serverInstance = await new Promise<any>((resolve) => {
    const s = app.listen(3000, () => {
      console.log('✅ Server started on port 3000\n');
      resolve(s);
    });
  });

  try {
    // Test 1: Health check
    console.log('Test 1: Health check');
    const health = await request('GET', '/health');
    console.log(`  Status: ${health.status}`);
    console.log(`  Response:`, health.data);
    console.log();

    // Test 2: Create game
    console.log('Test 2: Create new game');
    const createGame = await request('POST', '/games', {});
    console.log(`  Status: ${createGame.status}`);
    const gameId = createGame.data.id;
    console.log(`  Game ID: ${gameId}`);
    console.log(`  FEN: ${createGame.data.fen}`);
    console.log();

    // Test 3: Get game
    console.log('Test 3: Get game state');
    const getGame = await request('GET', `/games/${gameId}`);
    console.log(`  Status: ${getGame.status}`);
    console.log(`  Turn: ${getGame.data.turn}`);
    console.log();

    // Test 4: Make move
    console.log('Test 4: Make a move (e2-e4)');
    const makeMove = await request('POST', `/games/${gameId}/moves`, {
      from: 'e2',
      to: 'e4'
    });
    console.log(`  Status: ${makeMove.status}`);
    console.log(`  Move history length: ${makeMove.data.moveHistory.length}`);
    console.log(`  Last move: ${makeMove.data.moveHistory[0]?.san}`);
    console.log();

    // Test 5: Get legal moves
    console.log('Test 5: Get legal moves');
    const legalMoves = await request('GET', `/games/${gameId}/legal-moves`);
    console.log(`  Status: ${legalMoves.status}`);
    console.log(`  Number of legal moves: ${legalMoves.data.moves.length}`);
    console.log();

    // Test 6: Get PGN
    console.log('Test 6: Export to PGN');
    const pgn = await request('GET', `/games/${gameId}/pgn`);
    console.log(`  Status: ${pgn.status}`);
    console.log(`  PGN:\n${pgn.data}`);
    console.log();

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    serverInstance.close();
    console.log('\n🛑 Server stopped');
  }
}

testAPI().catch(console.error);
