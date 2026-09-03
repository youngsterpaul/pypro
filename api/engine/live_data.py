import yfinance as yf

# Mapping internal asset keys to yfinance symbols
SYMBOL_MAP = {
    # Forex
    "EURUSD": {"yf": "EURUSD=X", "type": "forex", "mt5": "EURUSD"},
    "GBPUSD": {"yf": "GBPUSD=X", "type": "forex", "mt5": "GBPUSD"},
    # Crypto
    "BTCUSD": {"yf": "BTC-USD", "type": "crypto", "mt5": "BTCUSD"},
    "ETHUSD": {"yf": "ETH-USD", "type": "crypto", "mt5": "ETHUSD"},
    # Indices & Commodities
    "US500":  {"yf": "^GSPC", "type": "indices", "mt5": "US500"},
    "GOLD":   {"yf": "GC=F", "type": "commodities", "mt5": "XAUUSD"}
}

def fetch_asset_price(symbol_key: str):
    asset_info = SYMBOL_MAP.get(symbol_key.upper(), SYMBOL_MAP["EURUSD"])
    ticker = yf.Ticker(asset_info["yf"])
    data = ticker.history(period="1d", interval="1m")
    
    if data.empty:
        return {"symbol": symbol_key, "current_price": 0.0, "volatility": 0.001, "info": asset_info}
    
    latest_price = float(data["Close"].iloc[-1])
    volatility = float((data["High"] - data["Low"]).mean())
    
    return {
        "symbol": symbol_key,
        "current_price": round(latest_price, 5),
        "volatility": round(volatility, 5),
        "info": asset_info
    }