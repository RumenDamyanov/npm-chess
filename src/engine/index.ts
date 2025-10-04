/**
 * Engine Module
 *
 * This module provides the core chess engine functionality.
 */

export { Board } from './board';
export { MoveGenerator } from './moves';
export { Game } from './game';
export { FenParser } from './fen';
export { PgnParser } from './pgn';
export type { PgnTags, PgnGame } from './pgn';
export { getPseudoLegalMoves, isSquareUnderAttack, isKingInCheck } from './pieces';

export const ENGINE_VERSION = '1.0.0';
