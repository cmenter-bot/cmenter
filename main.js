/**
 * LottoBall Custom Element
 * Handles rendering of individual lotto balls with 3D effects
 */
class LottoBall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['number'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'number' && newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    setTimeout(() => {
      const ball = this.shadowRoot.querySelector('.ball');
      if (ball) ball.classList.add('show');
    }, 10);
  }

  getRange(num) {
    if (num <= 10) return '1-10';
    if (num <= 20) return '11-20';
    if (num <= 30) return '21-30';
    if (num <= 40) return '31-40';
    return '41-45';
  }

  getColors(num) {
    if (num <= 10) return { start: '#fde047', end: '#ca8a04', text: '#422006' };
    if (num <= 20) return { start: '#60a5fa', end: '#1d4ed8', text: '#ffffff' };
    if (num <= 30) return { start: '#f87171', end: '#b91c1c', text: '#ffffff' };
    if (num <= 40) return { start: '#94a3b8', end: '#334155', text: '#ffffff' };
    return { start: '#4ade80', end: '#15803d', text: '#ffffff' };
  }

  render() {
    const num = this.getAttribute('number') || '0';
    const colors = this.getColors(parseInt(num));
    
    this.shadowRoot.innerHTML = `
      <style>
        .ball {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Pretendard', sans-serif;
          font-weight: 800;
          font-size: 1.6rem;
          color: ${colors.text};
          background: radial-gradient(circle at 35% 35%, ${colors.start}, ${colors.end});
          box-shadow: 
            inset -6px -6px 12px rgba(0,0,0,0.3),
            inset 8px 8px 16px rgba(255,255,255,0.2),
            0 15px 30px rgba(0,0,0,0.4);
          transform: scale(0.4) translateY(40px) rotate(-20deg);
          opacity: 0;
          transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .ball.show {
          opacity: 1;
          transform: scale(1) translateY(0) rotate(0deg);
        }
        @media (max-width: 640px) {
          .ball { width: 50px; height: 50px; font-size: 1.3rem; }
        }
      </style>
      <div class="ball">${num}</div>
    `;
  }
}

// Register custom element if not already defined
if (!customElements.get('lotto-ball')) {
  customElements.define('lotto-ball', LottoBall);
}

/**
 * Main Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const lottoDisplay = document.getElementById('lotto-display');
  const historyList = document.getElementById('history-list');
  const drawBtn = document.getElementById('draw-btn');
  const clearBtn = document.getElementById('clear-btn');

  let isDrawing = false;
  let history = JSON.parse(localStorage.getItem('lottoHistory') || '[]');

  // Initial render of history
  renderHistory();

  function generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  async function startDrawing() {
    if (isDrawing) return;
    
    isDrawing = true;
    drawBtn.disabled = true;
    drawBtn.querySelector('.btn-text').textContent = '추첨 중...';
    
    // Clear display with a small fade out if needed
    lottoDisplay.innerHTML = '';
    
    const luckyNumbers = generateNumbers();
    
    for (const num of luckyNumbers) {
      const ball = document.createElement('lotto-ball');
      ball.setAttribute('number', num);
      lottoDisplay.appendChild(ball);
      
      // Suspense delay
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    addToHistory(luckyNumbers);
    
    isDrawing = false;
    drawBtn.disabled = false;
    drawBtn.querySelector('.btn-text').textContent = '번호 추첨하기';
  }

  function addToHistory(numbers) {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    history.unshift({ timestamp, numbers });
    if (history.length > 10) history.pop();
    
    localStorage.setItem('lottoHistory', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">아직 추첨 내역이 없습니다.</p>';
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="history-item">
        <span class="history-time">${item.timestamp}</span>
        <div class="history-balls">
          ${item.numbers.map(n => `
            <div class="history-ball-mini" style="background: radial-gradient(circle at 30% 30%, ${getBallColors(n)})">
              ${n}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function getBallColors(num) {
    if (num <= 10) return '#fde047, #ca8a04';
    if (num <= 20) return '#60a5fa, #1d4ed8';
    if (num <= 30) return '#f87171, #b91c1c';
    if (num <= 40) return '#94a3b8, #334155';
    return '#4ade80, #15803d';
  }

  function resetAll() {
    if (isDrawing) return;
    lottoDisplay.innerHTML = '<div class="empty-state"><p>버튼을 눌러 행운의 번호를 추첨하세요</p></div>';
    history = [];
    localStorage.removeItem('lottoHistory');
    renderHistory();
  }

  // Event Listeners
  if (drawBtn) drawBtn.addEventListener('click', startDrawing);
  if (clearBtn) clearBtn.addEventListener('click', resetAll);
});
