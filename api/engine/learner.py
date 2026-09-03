import numpy as np
from database import get_supabase

class PersistentPredictor:
    def __init__(self):
        self.supabase = get_supabase()
        self.learning_rate = 0.05
        self.load_latest_weights()

    def load_latest_weights(self):
        """Loads learned weights directly from Supabase DB."""
        try:
            res = self.supabase.table("model_weights").select("*").order("id", desc=True).limit(1).execute()
            if res.data:
                latest = res.data[0]
                self.weights = np.array([latest["price_weight"], latest["time_weight"], latest["volatility_weight"]])
            else:
                self.weights = np.array([0.4, 0.3, 0.3])
        except Exception:
            self.weights = np.array([0.4, 0.3, 0.3])

    def predict_entry(self, price_signal: float, time_signal: float, vol_signal: float):
        features = np.array([price_signal, time_signal, vol_signal])
        score = float(np.dot(features, self.weights))
        
        is_risky = score < 0.65
        should_enter = score >= 0.45
        
        return {
            "should_enter": should_enter,
            "entry_type": "RISKY_ENTRY" if is_risky and should_enter else "STANDARD_ENTRY",
            "confidence_score": round(score, 3)
        }

    def learn_from_mistake(self, features_used: list, outcome: int):
        """
        Updates weights based on trade outcome (1 = Win, -1 = Loss)
        and persists the new weights back into Supabase.
        """
        X = np.array(features_used)
        if outcome == -1: # Adjust weights down on loss/mistake
            self.weights -= self.learning_rate * X
        else:             # Reinforce successful feature combo
            self.weights += self.learning_rate * X
            
        self.weights = np.clip(self.weights, 0.01, 1.0)
        self.weights /= np.sum(self.weights)
        
        # Save new weights to Supabase
        self.supabase.table("model_weights").insert({
            "price_weight": float(self.weights[0]),
            "time_weight": float(self.weights[1]),
            "volatility_weight": float(self.weights[2])
        }).execute()

        return {"updated_weights": self.weights.tolist()}