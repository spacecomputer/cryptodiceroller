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
        
        # Generate a comprehensive and factual reason for recommendation
        reason = generate_comprehensive_reason(selected_crypto)
        
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

def generate_comprehensive_reason(crypto):
    reasons = []
    
    # Market cap ranking
    if 'market_cap_rank' in crypto:
        reasons.append(f"It is currently ranked #{crypto['market_cap_rank']} by market capitalization")
    
    # Price change
    if 'price_change_percentage_24h' in crypto:
        price_change = crypto['price_change_percentage_24h']
        if price_change > 0:
            reasons.append(f"It has shown positive growth of {price_change:.2f}% in the last 24 hours")
        elif price_change < 0:
            reasons.append(f"It has experienced a dip of {abs(price_change):.2f}% in the last 24 hours, which might present a buying opportunity")
    
    # Trading volume
    if 'total_volume' in crypto:
        reasons.append(f"It has a 24-hour trading volume of ${crypto['total_volume']:,}")
    
    # All-time high comparison
    if 'ath' in crypto and 'current_price' in crypto:
        ath = crypto['ath']
        current_price = crypto['current_price']
        ath_percentage = (current_price / ath) * 100
        if ath_percentage < 90:
            reasons.append(f"It is currently trading at {ath_percentage:.2f}% of its all-time high of ${ath:,}")
    
    # Market sentiment (based on price change)
    if 'price_change_percentage_24h' in crypto:
        price_change = crypto['price_change_percentage_24h']
        if price_change > 5:
            reasons.append("The market sentiment appears bullish based on recent price action")
        elif price_change < -5:
            reasons.append("The market sentiment appears bearish, which could present a potential entry point for long-term investors")
    
    # Market cap
    if 'market_cap' in crypto:
        reasons.append(f"It has a market capitalization of ${crypto['market_cap']:,}")
    
    # Circulating supply
    if 'circulating_supply' in crypto:
        reasons.append(f"It has a circulating supply of {crypto['circulating_supply']:,.0f} tokens")
    
    # Price-to-ATH ratio
    if 'ath' in crypto and 'current_price' in crypto:
        price_to_ath_ratio = crypto['current_price'] / crypto['ath']
        reasons.append(f"Its current price is {price_to_ath_ratio:.2f}x its all-time high")
    
    # 7-day price change
    if 'price_change_percentage_7d_in_currency' in crypto:
        price_change_7d = crypto['price_change_percentage_7d_in_currency']
        reasons.append(f"It has {'gained' if price_change_7d > 0 else 'lost'} {abs(price_change_7d):.2f}% in the last 7 days")
    
    # Combine reasons
    if reasons:
        return " and ".join(reasons) + "."
    else:
        return "It shows potential based on current market trends."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
