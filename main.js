/**
 * LottoBall Custom Element
 */
class LottoBall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() { return ['number']; }

  attributeChangedCallback() { this.render(); }
  connectedCallback() {
    this.render();
    setTimeout(() => this.shadowRoot.querySelector('.ball')?.classList.add('show'), 10);
  }

  getColors(num) {
    if (num <= 10) return { start: '#fbbf24', end: '#f59e0b', text: '#422006' };
    if (num <= 20) return { start: '#60a5fa', end: '#2563eb', text: '#ffffff' };
    if (num <= 30) return { start: '#f87171', end: '#dc2626', text: '#ffffff' };
    if (num <= 40) return { start: '#94a3b8', end: '#475569', text: '#ffffff' };
    return { start: '#4ade80', end: '#16a34a', text: '#ffffff' };
  }

  render() {
    const num = this.getAttribute('number') || '0';
    const colors = this.getColors(parseInt(num));
    this.shadowRoot.innerHTML = `
      <style>
        .ball {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Pretendard', sans-serif;
          font-weight: 800;
          font-size: 1.3rem;
          color: ${colors.text};
          background: radial-gradient(circle at 35% 35%, ${colors.start}, ${colors.end});
          box-shadow: inset -4px -4px 8px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1);
          transform: scale(0.5); opacity: 0;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .ball.show { opacity: 1; transform: scale(1); }
      </style>
      <div class="ball">${num}</div>
    `;
  }
}

if (!customElements.get('lotto-ball')) customElements.define('lotto-ball', LottoBall);

/**
 * Main App Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const gamesContainer = document.getElementById('games-container');
  const drawBtn = document.getElementById('draw-btn');
  const clearBtn = document.getElementById('clear-btn');
  const historyList = document.getElementById('history-list');

  let isDrawing = false;

  function generateOneGame() {
    const numbers = new Set();
    while (numbers.size < 6) numbers.add(Math.floor(Math.random() * 45) + 1);
    return Array.from(numbers).sort((a, b) => a - b);
  }

  async function startDrawing() {
    if (isDrawing) return;
    isDrawing = true;
    drawBtn.disabled = true;
    drawBtn.textContent = '행운을 불러오는 중...';

    gamesContainer.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
      const gameRow = document.createElement('div');
      gameRow.className = 'game-row';
      gameRow.innerHTML = `
        <span class="game-label">GAME ${i}</span>
        <div class="balls-list" id="game-${i}-balls"></div>
      `;
      gamesContainer.appendChild(gameRow);

      const luckyNumbers = generateOneGame();
      const ballList = document.getElementById(`game-${i}-balls`);

      for (const num of luckyNumbers) {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', num);
        ballList.appendChild(ball);
        await new Promise(r => setTimeout(r, 100));
      }
      
      saveToHistory(luckyNumbers);
      await new Promise(r => setTimeout(r, 200));
    }

    drawBtn.disabled = false;
    drawBtn.textContent = '5게임 추첨하기!';
    isDrawing = false;
  }

  function saveToHistory(numbers) {
    const history = JSON.parse(localStorage.getItem('vibrantLottoHistory') || '[]');
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    history.unshift({ time, numbers });
    if (history.length > 10) history.pop();
    
    localStorage.setItem('vibrantLottoHistory', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = JSON.parse(localStorage.getItem('vibrantLottoHistory') || '[]');
    if (!historyList) return;
    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">추첨을 시작해 보세요!</p>';
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="history-item">
        <span>${item.time}</span>
        <div class="history-balls-mini">
          ${item.numbers.map(n => `<div class="ball-mini" style="background: ${getMiniBallColor(n)}">${n}</div>`).join('')}
        </div>
      </div>
    `).join('');
  }

  function getMiniBallColor(n) {
    if (n <= 10) return '#f59e0b';
    if (n <= 20) return '#2563eb';
    if (n <= 30) return '#dc2626';
    if (n <= 40) return '#475569';
    return '#16a34a';
  }

  drawBtn.addEventListener('click', startDrawing);
  clearBtn.addEventListener('click', () => {
    gamesContainer.innerHTML = '<div class="empty-state"><p>아래 버튼을 눌러 5게임을 한꺼번에 뽑아보세요!</p></div>';
    localStorage.removeItem('vibrantLottoHistory');
    renderHistory();
  });

  renderHistory();
});
