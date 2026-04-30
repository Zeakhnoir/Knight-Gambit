// =============================================================
// KNIGHT SLOT — UI / animation
// =============================================================
// Renders the chessboard, handles the spin button, animates the horse.
// Pure DOM manipulation, no framework. Works directly from file://.
// =============================================================

(function () {
  const { spin, BOARD_SIZE, START_R, START_C } = window.KnightEngine;

  // === STATE ===
  let balance = 1000;
  let totalWon = 0;
  let lastWin = 0;
  let baseN = null;
  let spinning = false;
  let primaryPos = { r: START_R, c: START_C };
  let extraHorses = []; // { id, r, c, el }
  let board = makeEmptyBoard();
  const TILE_SIZE = window.innerWidth <= 600 ? 38 : 64;
  const ANIMATION_MS = 320;

  // === DOM REFS ===
  const boardEl = document.getElementById('board');
  const balanceEl = document.getElementById('stat-balance');
  const jumpsEl = document.getElementById('stat-jumps');
  const winEl = document.getElementById('stat-win');
  const spinBtn = document.getElementById('spin-btn');
  const toastEl = document.getElementById('toast');

  // === INIT ===
  let primaryHorseEl;
  setupBoard();
  renderBoard();
  primaryHorseEl = makeHorseEl(false);
  boardEl.appendChild(primaryHorseEl);
  positionHorse(primaryHorseEl, START_R, START_C);
  updateHud();

  spinBtn.addEventListener('click', handleSpin);

  // === HELPERS ===
  function makeEmptyBoard() {
    const b = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = [];
      for (let c = 0; c < BOARD_SIZE; c++) row.push({ kind: 'EMPTY' });
      b.push(row);
    }
    return b;
  }

  function setupBoard() {
    boardEl.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${TILE_SIZE}px)`;
    boardEl.style.gridTemplateRows = `repeat(${BOARD_SIZE}, ${TILE_SIZE}px)`;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile ' + ((r + c) % 2 === 1 ? 'dark' : 'light');
        tile.id = `t-${r}-${c}`;
        tile.style.width = TILE_SIZE + 'px';
        tile.style.height = TILE_SIZE + 'px';
        const content = document.createElement('div');
        content.className = 'tile-content';
        tile.appendChild(content);
        boardEl.appendChild(tile);
      }
    }
  }

  function renderBoard() {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const tile = board[r][c];
        const el = document.getElementById(`t-${r}-${c}`);
        const content = el.querySelector('.tile-content');
        // Reset classes
        el.classList.remove('payout-low', 'payout-high', 'jumps', 'horse', 'empty');
        content.innerHTML = '';
        if (tile.kind === 'EMPTY') {
          el.classList.add('empty');
          content.innerHTML = '<span class="empty-dot">·</span>';
        } else if (tile.kind === 'PAYOUT') {
          const isHigh = tile.mult >= 5;
          el.classList.add(isHigh ? 'payout-high' : 'payout-low');
          content.innerHTML = `<span class="mult">${tile.mult}</span><span class="x">x</span>`;
        } else if (tile.kind === 'JUMPS') {
          el.classList.add('jumps');
          content.innerHTML = `<span>+${tile.jumps}</span><span class="x">JMP</span>`;
        } else if (tile.kind === 'HORSE') {
          el.classList.add('horse');
          content.innerHTML = `<span class="horse-icon">♞+</span>`;
        }
      }
    }
  }

  function makeHorseEl(gold) {
    const el = document.createElement('div');
    el.className = 'horse-piece' + (gold ? ' gold' : '');
    el.style.width = TILE_SIZE + 'px';
    el.style.height = TILE_SIZE + 'px';
    const img = document.createElement('img');
    img.src = gold ? 'assets/knight-gold.png' : 'assets/knight-cream.png';
    img.alt = gold ? 'Gold knight' : 'Knight';
    img.draggable = false;
    el.appendChild(img);
    return el;
  }

  function positionHorse(el, r, c) {
    el.style.transform = `translate(${c * TILE_SIZE}px, ${r * TILE_SIZE}px)`;
  }

  function flashTile(r, c) {
    const el = document.getElementById(`t-${r}-${c}`);
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 500);
  }

  function showToast(msg, ms = 900) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  function updateHud() {
    balanceEl.textContent = balance.toFixed(2);
    jumpsEl.textContent = baseN === null ? '–' : baseN;
    winEl.textContent = lastWin.toFixed(2) + 'x';
    if (lastWin > 0) winEl.parentElement.classList.add('flashing');
    else winEl.parentElement.classList.remove('flashing');
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function handleSpin() {
    if (spinning) return;
    if (balance < 1) {
      showToast('OUT OF COINS!');
      return;
    }
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = 'JUMPING…';
    balance -= 1;
    lastWin = 0;
    updateHud();

    const result = spin();
    baseN = result.baseN;
    board = result.board;
    renderBoard();

    // Reset primary horse to start
    primaryPos = { r: START_R, c: START_C };
    positionHorse(primaryHorseEl, primaryPos.r, primaryPos.c);

    // Remove old extra horses
    extraHorses.forEach((eh) => eh.el.remove());
    extraHorses = [];

    showToast(`${result.baseN} JUMPS!`, 800);
    updateHud();
    await sleep(700);

    let runningWin = 0;

    for (let hi = 0; hi < result.horses.length; hi++) {
      const horse = result.horses[hi];
      const isPrimary = horse.origin === 'PRIMARY';
      let horseEl;

      if (isPrimary) {
        horseEl = primaryHorseEl;
      } else {
        horseEl = makeHorseEl(true);
        boardEl.appendChild(horseEl);
        positionHorse(horseEl, horse.startR, horse.startC);
        extraHorses.push({ id: `eh-${hi}`, r: horse.startR, c: horse.startC, el: horseEl });
        showToast('EXTRA HORSE!', 800);
        await sleep(600);
      }

      for (const step of horse.path) {
        positionHorse(horseEl, step.r, step.c);
        await sleep(ANIMATION_MS);

        flashTile(step.r, step.c);

        if (step.payout > 0) {
          runningWin += step.payout;
          lastWin = runningWin;
          updateHud();
          showToast(`+${step.payout}x`, 700);
        } else if (step.gainedJumps > 0) {
          showToast(`+${step.gainedJumps} JUMPS`, 700);
        } else if (step.triggeredHorse) {
          showToast('HORSE TRIGGER!', 800);
        }

        await sleep(40);
      }
    }

    balance += result.totalWin;
    totalWon += result.totalWin;
    lastWin = result.totalWin;
    updateHud();

    if (result.totalWin > 0) {
      showToast(`WIN ${result.totalWin.toFixed(2)}x`, 1500);
    }

    spinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = 'SPIN  · 1';
  }

  // Handle resize (rebuild)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // simple approach: reload to rebuild grid at new size
      if (!spinning) location.reload();
    }, 300);
  });
})();
