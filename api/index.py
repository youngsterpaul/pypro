from fastapi import FastAPI
from pydantic import BaseModel
from engine.live_data import fetch_asset_price
from engine.learner import PersistentPredictor
from database import get_supabase

app = FastAPI()
predictor = PersistentPredictor()

class TradeExecutionRequest(BaseModel):
    symbol_key: str  # e.g., "EURUSD", "BTCUSD", "US500", "GOLD"
    account_balance: float
    target_goal: float
    mode: str        # "less_aggressive", "medium_aggressive", "aggressive"
    sl_points: float
    auto_execute: bool = False

@app.post("/api/analyze_and_execute")
def process_trade(req: TradeExecutionRequest):
    # 1. Fetch live market price across enabled multi-assets
    market = fetch_asset_price(req.symbol_key)
    entry_price = market["current_price"]
    
    # 2. Calculate Position Sizing (2:1 Win:Loss)
    risk_ratios = {"less_aggressive": 0.01, "medium_aggressive": 0.025, "aggressive": 0.05}
    risk_pct = risk_ratios.get(req.mode, 0.025)
    
    risk_amount = req.account_balance * risk_pct
    take_profit = entry_price + (req.sl_points * 2.0)
    stop_loss = entry_price - req.sl_points
    lot_size = round(risk_amount / (req.sl_points * 10000), 2)

    # 3. Predict Entry Quality
    prediction = predictor.predict_entry(0.6, 0.5, market["volatility"] * 100)

    # 4. Optional MT5 Auto Execution
    execution_result = {"status": "SKIPPED"}
    ticket_id = None

    if req.auto_execute and prediction["should_enter"]:
        # Bridge to MT5 Execution (using credentials stored in environment variables)
        from engine.mt5_executor import MT5ExecutionBridge
        executor = MT5ExecutionBridge(login=123456, password="mt5_password", server="Broker-Server")
        
        mt5_symbol = market["info"]["mt5"]
        execution_result = executor.execute_order(
            symbol=mt5_symbol,
            action_type="BUY",
            lot_size=lot_size,
            sl_price=stop_loss,
            tp_price=take_profit
        )
        if execution_result.get("status") == "SUCCESS":
            ticket_id = execution_result.get("ticket_id")

    # 5. Log to Supabase
    get_supabase().table("trade_logs").insert({
        "ticker_symbol": req.symbol_key,
        "asset_class": market["info"]["type"],
        "entry_price": entry_price,
        "stop_loss": stop_loss,
        "take_profit": take_profit,
        "lot_size": lot_size,
        "mode": req.mode,
        "is_risky": prediction["entry_type"] == "RISKY_ENTRY",
        "mt5_ticket_id": ticket_id,
        "execution_status": execution_result.get("status", "PENDING")
    }).execute()

    return {
        "market": market,
        "position": {
            "lot_size": lot_size,
            "stop_loss": round(stop_loss, 5),
            "take_profit": round(take_profit, 5),
            "risk_amount": risk_amount
        },
        "prediction": prediction,
        "execution": execution_result
    }