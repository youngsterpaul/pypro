"use client";

import React, { useState } from "react";

// Asset configuration mapping
const ASSET_CLASSES = [
  {
    category: "Forex",
    symbols: [
      { id: "EURUSD", name: "EUR / USD" },
      { id: "GBPUSD", name: "GBP / USD" },
    ],
  },
  {
    category: "Crypto",
    symbols: [
      { id: "BTCUSD", name: "BTC / USD" },
      { id: "ETHUSD", name: "ETH / USD" },
    ],
  },
  {
    category: "Indices & Commodities",
    symbols: [
      { id: "US500", name: "S&P 500 (US500)" },
      { id: "GOLD", name: "Gold (XAUUSD)" },
    ],
  },
];

interface ExecutionResponse {
  market: { current_price: number };
  position: { lot_size: number; stop_loss: number; take_profit: number; risk_amount: number };
  prediction: { entry_type: string; confidence_score: number; should_enter: boolean };
  execution: { status: string; ticket_id?: number };
}

export const QuantControlPanel: React.FC = () => {
  // State management
  const [selectedSymbol, setSelectedSymbol] = useState<string>("EURUSD");
  const [riskMode, setRiskMode] = useState<string>("medium_aggressive");
  const [autoExecute, setAutoExecute] = useState<boolean>(false);
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [targetGoal, setTargetGoal] = useState<number>(15000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);

  // Trigger analysis and execution against FastAPI serverless endpoint
  const handleAnalyzeAndExecute = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze_and_execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol_key: selectedSymbol,
          account_balance: accountBalance,
          target_goal: targetGoal,
          mode: riskMode,
          sl_points: selectedSymbol.includes("USD") && !selectedSymbol.includes("BTC") ? 0.002 : 2.5,
          auto_execute: autoExecute,
        }),
      });

      const data: ExecutionResponse = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Execution request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide">Quant Strategy & MT5 Execution Engine</h2>
          <p className="text-xs text-gray-400">2:1 Win/Loss Ratio | Persistent Self-Learning Engine</p>
        </div>

        {/* Auto-Execution Toggle */}
        <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          <span className="text-sm font-medium text-gray-300">Automated MT5 Trading</span>
          <button
            type="button"
            onClick={() => setAutoExecute(!autoExecute)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              autoExecute ? "bg-emerald-500 justify-end" : "bg-gray-600 justify-start"
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Market Asset</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ASSET_CLASSES.map((group) => (
            <div key={group.category} className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">{group.category}</span>
              <div className="flex flex-col gap-1">
                {group.symbols.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedSymbol(asset.id)}
                    className={`px-3 py-2 text-sm rounded-md font-medium text-left transition-all ${
                      selectedSymbol === asset.id
                        ? "bg-blue-600 text-white border-l-4 border-blue-300"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {asset.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Profile & Capital Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-800 pt-4">
        {/* Aggressiveness Mode */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Aggressive Profile</label>
          <select
            value={riskMode}
            onChange={(e) => setRiskMode(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="less_aggressive">Less Aggressive (1% Risk)</option>
            <option value="medium_aggressive">Medium Aggressive (2.5% Risk)</option>
            <option value="aggressive">Aggressive (5% Risk)</option>
          </select>
        </div>

        {/* Account Balance Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Account Balance ($)</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Target Goal Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Target Goal ($)</label>
          <input
            type="number"
            value={targetGoal}
            onChange={(e) => setTargetGoal(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleAnalyzeAndExecute}
        disabled={isLoading}
        className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${
          autoExecute
            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {isLoading
          ? "Processing Market Data & Signals..."
          : autoExecute
          ? `ANALYZE & EXECUTE ON MT5 (${selectedSymbol})`
          : `RUN QUANT ANALYSIS (${selectedSymbol})`}
      </button>

      {/* Output Panel */}
      {result && (
        <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 space-y-3">
          <div className="flex justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
            <span>Asset: <strong>{selectedSymbol}</strong></span>
            <span>Live Price: <strong>${result.market.current_price}</strong></span>
            <span>
              Entry Quality:{" "}
              <strong className={result.prediction.entry_type === "RISKY_ENTRY" ? "text-amber-400" : "text-emerald-400"}>
                {result.prediction.entry_type}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="bg-gray-900 p-2 rounded">
              <span className="text-xs text-gray-500">Calculated Lot</span>
              <p className="text-base font-bold text-blue-400">{result.position.lot_size}</p>
            </div>
            <div className="bg-gray-900 p-2 rounded">
              <span className="text-xs text-gray-500">Stop Loss</span>
              <p className="text-base font-bold text-rose-400">${result.position.stop_loss}</p>
            </div>
            <div className="bg-gray-900 p-2 rounded">
              <span className="text-xs text-gray-500">Take Profit (2:1)</span>
              <p className="text-base font-bold text-emerald-400">${result.position.take_profit}</p>
            </div>
            <div className="bg-gray-900 p-2 rounded">
              <span className="text-xs text-gray-500">MT5 Status</span>
              <p className="text-base font-bold text-amber-300">{result.execution.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};