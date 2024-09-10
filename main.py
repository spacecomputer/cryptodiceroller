from flask import Flask, render_template, jsonify
import random
import requests
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/roll_dice')
def roll_dice():
    # Simulate dice roll
    roll_result = random.randint(1, 6)
    
    # Fetch top 250 cryptocurrencies from CoinGecko API
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 250,
        "page": 1,
        "sparkline": False
    }
    try:
        app.logger.info(f"Sending request to CoinGecko API: {url}")
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes
        cryptos = response.json()
        
        app.logger.info(f"Received {len(cryptos)} cryptocurrencies from CoinGecko API")
        
        if not cryptos:
            raise ValueError("No cryptocurrency data received")
        
        # Select a random cryptocurrency
        selected_crypto = random.choice(cryptos)
        
        # Generate a random investment amount between $10 and $1000
        investment_amount = round(random.uniform(10, 1000), 2)
        
        # Generate a reason for recommendation
        reasons = [
            "shows strong market momentum",
            "has a promising technology roadmap",
            "is gaining adoption in various industries",
            "has a solid team and community backing",
            "demonstrates potential for long-term growth"
        ]
        reason = random.choice(reasons)
        
        recommendation = {
            "token_name": selected_crypto["name"],
            "token_symbol": selected_crypto["symbol"].upper(),
            "amount": investment_amount,
            "reason": reason
        }
        
        app.logger.info(f"Generated recommendation: {recommendation}")
        
        return jsonify({"roll": roll_result, "recommendation": recommendation})
    
    except requests.RequestException as e:
        app.logger.error(f"Error fetching cryptocurrency data: {str(e)}")
        return jsonify({"error": "Unable to fetch cryptocurrency data. Please try again later."}), 503
    
    except (KeyError, ValueError) as e:
        app.logger.error(f"Error processing cryptocurrency data: {str(e)}")
        return jsonify({"error": "Error processing cryptocurrency data. Please try again."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
