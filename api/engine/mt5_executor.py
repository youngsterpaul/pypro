import MetaTrader5 as mt5

class MT5ExecutionBridge:
    def __init__(self, login: int, password: str, server: str):
        self.login = login
        self.password = password
        self.server = server

    def initialize(self):
        if not mt5.initialize():
            return False
        return mt5.login(self.login, password=self.password, server=self.server)

    def execute_order(self, symbol: str, action_type: str, lot_size: float, sl_price: float, tp_price: float):
        if not self.initialize():
            return {"status": "FAILED", "error": "Could not initialize MT5 connection."}

        order_type = mt5.ORDER_TYPE_BUY if action_type == "BUY" else mt5.ORDER_TYPE_SELL
        price = mt5.symbol_info_tick(symbol).ask if action_type == "BUY" else mt5.symbol_info_tick(symbol).bid

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": float(lot_size),
            "type": order_type,
            "price": price,
            "sl": float(sl_price),
            "tp": float(tp_price),
            "deviation": 20,
            "magic": 100200,
            "comment": "Quant Platform Auto-Trade",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request)
        mt5.shutdown()

        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return {"status": "FAILED", "retcode": result.retcode}

        return {
            "status": "SUCCESS",
            "ticket_id": result.order,
            "executed_price": result.price
        }