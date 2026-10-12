'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Chess, index, square} = require('../chess.js');
function play(game, ...moves) {
  for (const move of moves) assert.ok(game.move(move.slice(0,2), move.slice(2,4), move[4] || 'q'), `Movimiento rechazado: ${move}`);
}
function perft(game, depth) {
  if (!depth) return 1;
  let nodes = 0;
  for (const move of game.legalMoves()) {const next = game.clone();next.apply(move);nodes += perft(next, depth - 1);}
  return nodes;
}
test('Coordenadas y posición inicial', () => {
  for (let i = 0; i < 64; i++) assert.equal(index(square(i)), i);
  const game = new Chess();assert.equal(game.board.filter(Boolean).length,32);assert.equal(game.legalMoves().length,20);
});
test('Perft inicial: 20, 400, 8902 y 197281 posiciones legales', () => {
  const game = new Chess();
  [20,400,8902,197281].forEach((expected,i) => assert.equal(perft(game,i + 1),expected));
});
test('Perft Kiwipete: enroques, clavadas y capturas (48, 2039, 97862)', () => {
  const game = new Chess('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
  [48,2039,97862].forEach((expected,i) => assert.equal(perft(game,i + 1),expected));
});
test('Perft de finales con capturas al paso: 14, 191, 2812, 43238', () => {
  const game = new Chess('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
  [14,191,2812,43238].forEach((expected,i) => assert.equal(perft(game,i + 1),expected));
});
test('Turnos, movimientos ilegales y capturas', () => {
  const game = new Chess();const before = game.key();
  assert.equal(game.move('e7','e5'),null);assert.equal(game.move('e2','e5'),null);assert.equal(game.key(),before);
  play(game,'e2e4','d7d5','e4d5');assert.equal(game.board[index('d5')],'P');assert.equal(game.turn,'b');
});
test('Jaque mate del loco y bloqueo de una partida terminada', () => {
  const game = new Chess();play(game,'f2f3','e7e5','g2g4','d8h4');
  assert.deepEqual(game.status(),{over:true,check:true,reason:'mate',winner:'b'});assert.equal(game.move('a2','a3'),null);
});
test('Rey amenazado, clavadas y reyes adyacentes', () => {
  const game = new Chess('4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1');
  assert.equal(game.move('e2','d2'),null);
  const kings = new Chess('8/8/8/8/8/4k3/8/4K2R w - - 0 1');
  assert.equal(kings.move('e1','e2'),null);
});
test('Enroque en ambos flancos y pérdida de derechos', () => {
  const game = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  play(game,'e1g1','e8c8');assert.equal(game.board[index('f1')],'R');assert.equal(game.board[index('d8')],'r');assert.equal(game.rights,'');
  const moved = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  play(moved,'h1h2','h8h7','h2h1','h7h8');assert.ok(!moved.rights.includes('K'));assert.equal(moved.move('e1','g1'),null);
});
test('No enrocar atravesando jaque, desde jaque o sin torre', () => {
  for (const fen of ['r3k2r/8/8/8/2b5/8/8/R3K2R w KQkq - 0 1','r3k2r/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1','4k3/8/8/8/8/8/8/R3K3 w KQ - 0 1'])
    assert.equal(new Chess(fen).move('e1','g1'),null);
});
test('Captura al paso válida y solo en el turno inmediato', () => {
  const game = new Chess();play(game,'e2e4','a7a6','e4e5','d7d5','e5d6');assert.equal(game.board[index('d5')],null);assert.equal(game.board[index('d6')],'P');
  const expired = new Chess();play(expired,'e2e4','a7a6','e4e5','d7d5','h2h3','a6a5');assert.equal(expired.move('e5','d6'),null);
});
test('Captura al paso no puede descubrir jaque contra el propio rey', () => {
  const game = new Chess('k7/8/8/r4pPK/8/8/8/8 w - f6 0 1');
  assert.equal(game.move('g5','f6'),null);
  assert.equal(game.key(),new Chess('k7/8/8/r4pPK/8/8/8/8 w - - 0 1').key());
});
test('Coronación: cuatro opciones para blancas y negras, también capturando', () => {
  for (const kind of ['q','r','b','n']) {
    const white = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');play(white,'a7a8' + kind);assert.equal(white.board[0],kind.toUpperCase());
    const black = new Chess('7k/8/8/8/8/8/p7/1R5K b - - 0 1');play(black,'a2b1' + kind);assert.equal(black.board[index('b1')],kind);
  }
});
test('Tablas por ahogado y material básico', () => {
  assert.equal(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1').status().reason,'ahogado');
  for (const fen of ['7k/8/8/8/8/8/8/7K w - - 0 1','7k/8/8/8/8/8/8/5B1K w - - 0 1','7k/8/8/8/8/8/8/5N1K w - - 0 1','6bk/8/8/8/8/8/8/5B1K w - - 0 1'])
    assert.equal(new Chess(fen).status().reason,'material');
  assert.equal(new Chess('6bk/8/8/8/8/8/8/4B2K w - - 0 1').insufficient(),false);
});
test('Triple repetición', () => {
  const game = new Chess();play(game,'g1f3','g8f6','f3g1','f6g8');assert.equal(game.status().over,false);
  play(game,'g1f3','g8f6','f3g1','f6g8');assert.equal(game.status().reason,'repeticion');
});
test('50 movimientos, reinicio del contador y prioridad del mate', () => {
  const game = new Chess('7k/8/8/8/8/8/8/R6K w - - 99 50');play(game,'a1a2');assert.equal(game.status().reason,'cincuenta');
  const pawn = new Chess('7k/8/8/8/8/8/P7/7K w - - 99 50');play(pawn,'a2a3');assert.equal(pawn.half,0);
  const capture = new Chess('7k/8/8/8/8/8/r7/R6K w - - 99 50');play(capture,'a1a2');assert.equal(capture.half,0);
  assert.equal(new Chess('7k/6Q1/5K2/8/8/8/8/8 b - - 100 50').status().reason,'mate');
});
