/* Motor independiente del navegador. Índice 0 = a8; índice 63 = h1. */
(function (root) {
  'use strict';
  const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const color = p => !p ? null : p === p.toUpperCase() ? 'w' : 'b';
  const other = c => c === 'w' ? 'b' : 'w';
  const square = i => 'abcdefgh'[i % 8] + (8 - Math.floor(i / 8));
  const index = s => (8 - Number(s[1])) * 8 + 'abcdefgh'.indexOf(s[0]);
  const at = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8 ? r * 8 + c : -1;
  const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const DIAGONAL = [[-1,-1],[-1,1],[1,-1],[1,1]];
  const STRAIGHT = [[-1,0],[1,0],[0,-1],[0,1]];

  class Chess {
    constructor(fen = START) {
      const [placement, turn, rights, ep, half, full] = fen.split(' ');
      this.board = [];
      for (const ch of placement.replaceAll('/', '')) {
        if (/\d/.test(ch)) this.board.push(...Array(Number(ch)).fill(null));
        else this.board.push(ch);
      }
      if (this.board.length !== 64) throw new Error('Posición inválida');
      this.turn = turn; this.rights = rights === '-' ? '' : rights;
      this.ep = ep === '-' ? null : index(ep);
      this.half = Number(half); this.full = Number(full);
      this.repetitions = new Map([[this.key(), 1]]);
    }
    clone() {
      const copy = Object.create(Chess.prototype);
      Object.assign(copy, this);
      copy.board = this.board.slice();
      return copy;
    }
    attacked(target, by) {
      const r = Math.floor(target / 8), c = target % 8;
      const pawnRow = r + (by === 'w' ? 1 : -1);
      for (const dc of [-1, 1]) {
        const p = this.board[at(pawnRow, c + dc)];
        if (p && color(p) === by && p.toLowerCase() === 'p') return true;
      }
      for (const [dr, dc] of KNIGHT) {
        const p = this.board[at(r + dr, c + dc)];
        if (p && color(p) === by && p.toLowerCase() === 'n') return true;
      }
      for (const [dr, dc] of [...DIAGONAL, ...STRAIGHT]) {
        for (let d = 1; d < 8; d++) {
          const i = at(r + dr * d, c + dc * d);
          if (i < 0) break;
          const p = this.board[i];
          if (!p) continue;
          if (color(p) === by) {
            const kind = p.toLowerCase();
            if (kind === 'q' || (kind === 'k' && d === 1) ||
                (kind === 'b' && dr && dc) || (kind === 'r' && (!dr || !dc))) return true;
          }
          break;
        }
      }
      return false;
    }
    inCheck(side = this.turn) {
      const king = this.board.indexOf(side === 'w' ? 'K' : 'k');
      return king < 0 || this.attacked(king, other(side));
    }
    pseudoMoves() {
      const moves = [], side = this.turn;
      const add = (from, to, extra = {}) => {
        const p = this.board[from];
        if (p.toLowerCase() === 'p' && (to < 8 || to >= 56)) {
          for (const promotion of ['q','r','b','n']) moves.push({from, to, ...extra, promotion});
        } else moves.push({from, to, ...extra});
      };
      for (let from = 0; from < 64; from++) {
        const p = this.board[from];
        if (color(p) !== side) continue;
        const r = Math.floor(from / 8), c = from % 8, kind = p.toLowerCase();
        if (kind === 'p') {
          const dir = side === 'w' ? -1 : 1, one = at(r + dir, c);
          if (one >= 0 && !this.board[one]) {
            add(from, one);
            const two = at(r + 2 * dir, c);
            if (r === (side === 'w' ? 6 : 1) && !this.board[two]) add(from, two);
          }
          for (const dc of [-1,1]) {
            const to = at(r + dir, c + dc);
            if (to < 0) continue;
            const victim = this.board[to];
            if (victim && color(victim) !== side && victim.toLowerCase() !== 'k') add(from, to);
            if (to === this.ep && !victim && this.board[to - dir * 8] === (side === 'w' ? 'p' : 'P'))
              add(from, to, {enPassant: true});
          }
          continue;
        }
        const directions = kind === 'n' ? KNIGHT : kind === 'b' ? DIAGONAL :
          kind === 'r' ? STRAIGHT : [...DIAGONAL, ...STRAIGHT];
        const range = kind === 'n' || kind === 'k' ? 1 : 7;
        for (const [dr, dc] of directions) {
          for (let d = 1; d <= range; d++) {
            const to = at(r + dr * d, c + dc * d);
            if (to < 0) break;
            const victim = this.board[to];
            if (color(victim) === side) break;
            if (!victim || victim.toLowerCase() !== 'k') add(from, to);
            if (victim) break;
          }
        }
        if (kind === 'k') {
          const home = side === 'w' ? 60 : 4, rook = side === 'w' ? 'R' : 'r';
          if (from !== home || this.inCheck(side)) continue;
          for (const kingSide of [true, false]) {
            const right = side === 'w' ? (kingSide ? 'K' : 'Q') : (kingSide ? 'k' : 'q');
            const step = kingSide ? 1 : -1, rookFrom = home + (kingSide ? 3 : -4);
            const clear = kingSide ? [1,2] : [-1,-2,-3];
            if (this.rights.includes(right) && this.board[rookFrom] === rook &&
                clear.every(offset => !this.board[home + offset]) &&
                !this.attacked(home + step, other(side)) && !this.attacked(home + 2 * step, other(side)))
              add(from, home + 2 * step, {castle: true});
          }
        }
      }
      return moves;
    }
    legalMoves() {
      const side = this.turn;
      return this.pseudoMoves().filter(move => {
        const next = this.clone(); next.apply(move);
        return !next.inCheck(side);
      });
    }
    apply(move) {
      const {from, to} = move, p = this.board[from], captured = this.board[to];
      this.board[from] = null;
      this.board[to] = move.promotion ? (this.turn === 'w' ? move.promotion.toUpperCase() : move.promotion) : p;
      if (move.enPassant) this.board[to + (this.turn === 'w' ? 8 : -8)] = null;
      if (move.castle) {
        const rookFrom = to > from ? from + 3 : from - 4, rookTo = to > from ? from + 1 : from - 1;
        this.board[rookTo] = this.board[rookFrom]; this.board[rookFrom] = null;
      }
      if (p === 'K') this.rights = this.rights.replace(/[KQ]/g, '');
      if (p === 'k') this.rights = this.rights.replace(/[kq]/g, '');
      for (const [pos, right] of [[0,'q'],[7,'k'],[56,'Q'],[63,'K']])
        if (from === pos || to === pos) this.rights = this.rights.replace(right, '');
      this.ep = p.toLowerCase() === 'p' && Math.abs(to - from) === 16 ? (from + to) / 2 : null;
      this.half = p.toLowerCase() === 'p' || captured || move.enPassant ? 0 : this.half + 1;
      if (this.turn === 'b') this.full++;
      this.turn = other(this.turn);
    }
    key() {
      // La captura al paso solo distingue posiciones si es un movimiento legal.
      const ep = this.ep !== null && this.legalMoves().some(m => m.enPassant) ? this.ep : '-';
      return this.board.map(p => p || '.').join('') + ' ' + this.turn + ' ' + this.rights + ' ' + ep;
    }
    move(from, to, promotion = 'q') {
      if (this.status().over) return null;
      if (typeof from === 'string') from = index(from);
      if (typeof to === 'string') to = index(to);
      const move = this.legalMoves().find(m => m.from === from && m.to === to && (!m.promotion || m.promotion === promotion));
      if (!move) return null;
      const piece = this.board[from], capture = Boolean(this.board[to]) || move.enPassant;
      this.apply(move);
      const key = this.key(); this.repetitions.set(key, (this.repetitions.get(key) || 0) + 1);
      return {...move, piece, capture};
    }
    insufficient() {
      const pieces = this.board.map((p,i) => ({p,i})).filter(x => x.p && x.p.toLowerCase() !== 'k');
      if (!pieces.length) return true;
      if (pieces.length === 1 && /[bn]/i.test(pieces[0].p)) return true;
      if (pieces.every(x => x.p.toLowerCase() === 'b')) {
        const shades = pieces.map(x => (Math.floor(x.i / 8) + x.i % 8) % 2);
        return shades.every(s => s === shades[0]);
      }
      return false;
    }
    status() {
      const check = this.inCheck(), moves = this.legalMoves();
      if (!moves.length) return {over:true, check, reason: check ? 'mate' : 'ahogado', winner: check ? other(this.turn) : null};
      if (this.insufficient()) return {over:true, check, reason:'material'};
      if (this.half >= 100) return {over:true, check, reason:'cincuenta'};
      if ((this.repetitions.get(this.key()) || 0) >= 3) return {over:true, check, reason:'repeticion'};
      return {over:false, check};
    }
  }
  const api = {Chess, square, index, color};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SimpleChess = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
