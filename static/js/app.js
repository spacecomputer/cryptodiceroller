import { DiceAnimation } from './dice.js';

document.addEventListener('DOMContentLoaded', () => {
    const diceContainer = document.getElementById('dice-container');
    const rollButton = document.getElementById('roll-button');
    const recommendationContainer = document.getElementById('recommendation-container');
    const tradeButtonsContainer = document.getElementById('trade-buttons-container');

    const diceAnimation = new DiceAnimation(diceContainer);

    rollButton.addEventListener('click', async () => {
        rollButton.disabled = true;
        recommendationContainer.innerHTML = '';
        tradeButtonsContainer.innerHTML = '';

        await diceAnimation.rollDice();

        try {
            const response = await fetch('/roll_dice');
            const data = await response.json();

            const recommendation = data.recommendation;
            const recommendationHTML = `
                <h2 class="text-2xl font-bold mb-2">Crypto Recommendation</h2>
                <p class="mb-1"><strong>Token:</strong> ${recommendation.token_name} (${recommendation.token_symbol})</p>
                <p class="mb-1"><strong>Recommended Investment:</strong> $${recommendation.amount.toFixed(2)}</p>
                <p class="mb-1"><strong>Reason:</strong> This cryptocurrency ${recommendation.reason}.</p>
                <p class="text-sm text-gray-500 mt-2">Remember: This is not financial advice. Always do your own research before investing.</p>
            `;

            recommendationContainer.innerHTML = recommendationHTML;

            const tradeButtonsHTML = `
                <p class="mb-2">Did you make the trade?</p>
                <button id="yes-button" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">Yes</button>
                <button id="no-button" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">No</button>
            `;

            tradeButtonsContainer.innerHTML = tradeButtonsHTML;

            const yesButton = document.getElementById('yes-button');
            const noButton = document.getElementById('no-button');

            yesButton.addEventListener('click', () => {
                triggerCoinAnimation();
            });

            noButton.addEventListener('click', () => {
                tradeButtonsContainer.innerHTML = '<p class="text-gray-500">Maybe next time!</p>';
            });

        } catch (error) {
            console.error('Error fetching recommendation:', error);
            recommendationContainer.innerHTML = '<p class="text-red-500">Error fetching recommendation. Please try again.</p>';
        }

        rollButton.disabled = false;
    });

    function triggerCoinAnimation() {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'coin-animation-container';
        tradeButtonsContainer.appendChild(animationContainer);

        const coinSound = new Audio('/static/sounds/coin-sound.mp3');
        coinSound.play();

        for (let i = 0; i < 50; i++) {
            const coin = document.createElement('div');
            coin.className = `coin ${getRandomSize()} ${getRandomColor()}`;
            coin.style.left = `${Math.random() * 100}%`;
            coin.style.animationDelay = `${Math.random() * 0.5}s`;
            coin.style.animationDuration = `${2 + Math.random() * 2}s`;
            
            // Add swirling effect
            const swirl = Math.random() > 0.5 ? 1 : -1;
            coin.style.animationName = 'coinFall, glow';
            coin.style.animationTimingFunction = `cubic-bezier(${0.5 + Math.random() * 0.5}, 0, 0.75, 1), ease-in-out`;
            coin.style.transform = `rotate(${Math.random() * 360}deg)`;
            coin.style.setProperty('--swirl', `${swirl * (100 + Math.random() * 100)}px`);
            
            animationContainer.appendChild(coin);
        }

        setTimeout(() => {
            animationContainer.remove();
            tradeButtonsContainer.innerHTML = '<p class="text-green-500">Congratulations on your trade!</p>';
        }, 3000);
    }

    function getRandomSize() {
        const sizes = ['small', 'medium', 'large'];
        return sizes[Math.floor(Math.random() * sizes.length)];
    }

    function getRandomColor() {
        const colors = ['gold', 'silver', 'bronze'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});
