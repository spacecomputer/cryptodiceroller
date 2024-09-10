import { DiceAnimation } from './dice.js';

document.addEventListener('DOMContentLoaded', () => {
    const diceContainer = document.getElementById('dice-container');
    const rollButton = document.getElementById('roll-button');
    const recommendationContainer = document.getElementById('recommendation-container');

    const diceAnimation = new DiceAnimation(diceContainer);

    rollButton.addEventListener('click', async () => {
        rollButton.disabled = true;
        recommendationContainer.innerHTML = '';

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
        } catch (error) {
            console.error('Error fetching recommendation:', error);
            recommendationContainer.innerHTML = '<p class="text-red-500">Error fetching recommendation. Please try again.</p>';
        }

        rollButton.disabled = false;
    });
});
