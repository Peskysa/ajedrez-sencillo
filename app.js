'use strict';
const {Chess, square, color} = SimpleChess;
const symbols = {K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
const names = {k:'rey',q:'dama',r:'torre',b:'alfil',n:'caballo',p:'peón'};
const sideName = side => side === 'w' ? 'blancas' : 'negras';
const $ = id => document.getElementById(id);
let game = new Chess(), selected = null, flipped = false, last = null, log = [], pending = null;

function render(focusSquare = null) {
  const status = game.status(), moves = status.over ? [] : game.legalMoves();
  const selectedMoves = moves.filter(m => m.from === selected);
  const checkedKing = status.check ? game.board.indexOf(game.turn === 'w' ? 'K' : 'k') : -1;
  const board = $('board'); board.replaceChildren();
  for (let view = 0; view < 64; view++) {
    const i = flipped ? 63 - view : view, p = game.board[i];
    const target = selectedMoves.find(m => m.to === i);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'square'; button.dataset.square = square(i);
    if ((Math.floor(i / 8) + i % 8) % 2) button.classList.add('dark');
    if (last && (i === last.from || i === last.to)) button.classList.add('last');
    if (i === selected) button.classList.add('selected');
    if (i === checkedKing) button.classList.add('check');
    if (target) button.classList.add('legal');
    if (target && (p || target.enPassant)) button.classList.add('capture');
    button.setAttribute('aria-pressed', String(selected === i));
    button.setAttribute('aria-label', `${square(i)}: ${p ? names[p.toLowerCase()] + ' de ' + sideName(color(p)) : 'vacía'}${target ? ', destino legal' : ''}${i === checkedKing ? ', en jaque' : ''}`);
    if (p) {const span = document.createElement('span'); span.className = 'piece ' + (color(p) === 'w' ? 'white' : 'black');span.textContent = symbols[p];span.setAttribute('aria-hidden','true');button.append(span);}
    if (view % 8 === 0) {const label = document.createElement('span'); label.className = 'coordinate rank';label.textContent = square(i)[1];button.append(label);}
    if (view >= 56) {const label = document.createElement('span'); label.className = 'coordinate file';label.textContent = square(i)[0];button.append(label);}
    button.addEventListener('click', () => select(i)); board.append(button);
  }
  board.setAttribute('aria-label', `Tablero: ${flipped ? 'negras' : 'blancas'} abajo`);
  $('top-player').textContent = flipped ? 'BLANCAS' : 'NEGRAS';
  $('bottom-player').textContent = flipped ? 'NEGRAS' : 'BLANCAS';
  $('turn-label').textContent = status.over ? 'Partida terminada' : `Juegan las ${sideName(game.turn)}`;
  const reasons = {ahogado:'Tablas por ahogado',material:'Tablas por material insuficiente',cincuenta:'Tablas por la regla de 50 movimientos',repeticion:'Tablas por triple repetición'};
  $('status').textContent = status.over ? status.reason === 'mate' ? `Jaque mate. Ganan las ${sideName(status.winner)}` : reasons[status.reason] : `${status.check ? 'Jaque. ' : ''}Turno de ${sideName(game.turn)}`;
  $('hint').textContent = status.over ? 'La partida ha terminado. Puedes empezar una nueva.' : status.check ? 'Tu rey está amenazado. Elige un movimiento que lo deje a salvo.' : selected !== null ? (selectedMoves.length ? 'Pulsa uno de los destinos marcados.' : 'Esta pieza no tiene movimientos legales. Elige otra.') : 'Selecciona una pieza para ver dónde puede moverse.';
  $('move-count').textContent = `${log.length} ${log.length === 1 ? 'jugada' : 'jugadas'}`;
  $('empty-history').hidden = log.length > 0;
  $('history').replaceChildren();
  for (let i = 0; i < log.length; i += 2) {
    const li = document.createElement('li');
    for (const [text, cls] of [[`${i / 2 + 1}.`,'number'],[log[i],''],[log[i + 1] || '','']]) {
      const span = document.createElement('span');span.textContent = text;span.className = cls;li.append(span);
    }
    $('history').append(li);
  }
  $('history').scrollTop = $('history').scrollHeight;
  if (focusSquare !== null) board.querySelector(`[data-square="${square(focusSquare)}"]`).focus({preventScroll:true});
}
function select(i) {
  if (game.status().over || pending) return;
  const candidates = game.legalMoves().filter(m => m.from === selected && m.to === i);
  if (candidates.length) {
    if (candidates[0].promotion) {
      pending = {from:selected, to:i};
      $('promotion-choices').replaceChildren();
      for (const kind of ['q','r','b','n']) {
        const button = document.createElement('button');button.type = 'button';
        const span = document.createElement('span');span.className = 'piece';span.textContent = symbols[game.turn === 'w' ? kind.toUpperCase() : kind];span.setAttribute('aria-hidden','true');
        button.append(span, names[kind]);button.addEventListener('click', () => {const move = pending;pending = null;$('promotion-dialog').close();play(move.from, move.to, kind);});
        $('promotion-choices').append(button);
      }
      $('promotion-dialog').showModal();
    } else play(selected, i);
    return;
  }
  selected = color(game.board[i]) === game.turn && selected !== i ? i : null;
  render(i);
}
function play(from, to, promotion) {
  const move = game.move(from, to, promotion);
  if (!move) return;
  last = move; selected = null;
  const status = game.status();
  log.push((move.castle ? (to > from ? 'O-O' : 'O-O-O') : `${symbols[move.piece]} ${square(from)}${move.capture ? '×' : '–'}${square(to)}${move.promotion ? '=' + symbols[color(move.piece) === 'w' ? move.promotion.toUpperCase() : move.promotion] : ''}${move.enPassant ? ' a.p.' : ''}`) + (status.reason === 'mate' ? '#' : status.check ? '+' : ''));
  render(to);
}
$('promotion-dialog').addEventListener('cancel', () => {pending = null;render(selected);});
$('flip').addEventListener('click', () => {flipped = !flipped;render();});
$('reset').addEventListener('click', () => {if (log.length) $('reset-dialog').showModal();else reset();});
$('confirm-reset').addEventListener('click', () => {$('reset-dialog').close();reset();});
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
function reset() {game = new Chess();selected = null;last = null;log = [];pending = null;render();}
render();
