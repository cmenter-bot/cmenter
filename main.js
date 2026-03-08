
class LottoBall extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const number = this.getAttribute('number');

        const ball = document.createElement('div');
        ball.textContent = number;

        const style = document.createElement('style');
        style.textContent = `
            div {
                width: 60px;
                height: 60px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--text-color, #333);
                background-color: var(--secondary-color, #FFD93D);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                animation: bounce 0.5s ease;
            }

            @keyframes bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(ball);
    }
}

customElements.define('lotto-ball', LottoBall);

const generateBtn = document.getElementById('generate-btn');
const numberDisplay = document.querySelector('.number-display');

function generateNumbers() {
    numberDisplay.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    numbers.forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        numberDisplay.appendChild(lottoBall);
    });
}

generateBtn.addEventListener('click', generateNumbers);

// Generate initial numbers
generateNumbers();
