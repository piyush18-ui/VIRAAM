# pyrefly: ignore [missing-import]
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from typing import Dict, Any, List, Tuple
from ..schemas import Reason, RiskScoreResponse

FEATURE_NAMES = [
    "amount_vs_typical_ratio",
    "beneficiary_is_new",
    "beneficiary_account_age_days",
    "beneficiary_inbound_velocity",
    "beneficiary_fanout",
    "in_call",
    "call_duration_min",
    "caller_unsaved",
    "remote_access_active",
    "screen_share_active",
    "hour_of_day_unusual",
    "round_amount"
]

class RiskEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
        self.metrics: Dict[str, Any] = {}
        self.feature_weights: Dict[str, float] = {}
        self.means: np.ndarray = np.zeros(len(FEATURE_NAMES))
        self.scales: np.ndarray = np.ones(len(FEATURE_NAMES))
        self._train_initial_model()

    def _generate_synthetic_training_data(self, n_samples: int = 2500) -> Tuple[np.ndarray, np.ndarray]:
        np.random.seed(42)
        n_scam = n_samples // 2
        n_normal = n_samples - n_scam

        # Normal transfers
        normal_amount_ratio = np.random.exponential(scale=1.0, size=n_normal) + 0.3
        normal_beneficiary_new = np.random.binomial(1, 0.15, size=n_normal)
        normal_acc_age = np.random.uniform(30, 1500, size=n_normal)
        normal_velocity = np.random.poisson(lam=0.5, size=n_normal)
        normal_fanout = np.random.poisson(lam=0.3, size=n_normal)
        normal_in_call = np.random.binomial(1, 0.12, size=n_normal)
        normal_call_dur = np.where(normal_in_call, np.random.exponential(scale=4.0, size=n_normal), 0.0)
        normal_caller_unsaved = np.where(normal_in_call, np.random.binomial(1, 0.2, size=n_normal), 0)
        normal_remote_access = np.random.binomial(1, 0.01, size=n_normal)
        normal_screen_share = np.random.binomial(1, 0.02, size=n_normal)
        normal_hour_unusual = np.random.binomial(1, 0.08, size=n_normal)
        normal_round_amount = np.random.binomial(1, 0.25, size=n_normal)

        X_normal = np.column_stack([
            normal_amount_ratio, normal_beneficiary_new, normal_acc_age,
            normal_velocity, normal_fanout, normal_in_call, normal_call_dur,
            normal_caller_unsaved, normal_remote_access, normal_screen_share,
            normal_hour_unusual, normal_round_amount
        ])
        y_normal = np.zeros(n_normal)

        # Scam / Digital arrest transfers
        scam_amount_ratio = np.random.uniform(4.0, 25.0, size=n_scam)
        scam_beneficiary_new = np.random.binomial(1, 0.92, size=n_scam)
        scam_acc_age = np.random.exponential(scale=12.0, size=n_scam) + 1.0 # young mule accounts
        scam_velocity = np.random.poisson(lam=12.0, size=n_scam)
        scam_fanout = np.random.poisson(lam=6.0, size=n_scam)
        scam_in_call = np.random.binomial(1, 0.95, size=n_scam)
        scam_call_dur = np.where(scam_in_call, np.random.uniform(15.0, 95.0, size=n_scam), 0.0)
        scam_caller_unsaved = np.where(scam_in_call, np.random.binomial(1, 0.90, size=n_scam), 0)
        scam_remote_access = np.random.binomial(1, 0.70, size=n_scam)
        scam_screen_share = np.random.binomial(1, 0.75, size=n_scam)
        scam_hour_unusual = np.random.binomial(1, 0.35, size=n_scam)
        scam_round_amount = np.random.binomial(1, 0.88, size=n_scam)

        X_scam = np.column_stack([
            scam_amount_ratio, scam_beneficiary_new, scam_acc_age,
            scam_velocity, scam_fanout, scam_in_call, scam_call_dur,
            scam_caller_unsaved, scam_remote_access, scam_screen_share,
            scam_hour_unusual, scam_round_amount
        ])
        y_scam = np.ones(n_scam)

        X = np.vstack([X_normal, X_scam])
        y = np.concatenate([y_normal, y_scam])

        # Realistic noise: 4% label noise to simulate real-world overlap
        flip_mask = np.random.binomial(1, 0.04, size=len(y)).astype(bool)
        y[flip_mask] = 1 - y[flip_mask]

        return X, y

    def _train_initial_model(self):
        X, y = self._generate_synthetic_training_data()
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

        self.scaler.fit(X_train)
        self.means = self.scaler.mean_
        self.scales = self.scaler.scale_

        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.model.fit(X_train_scaled, y_train)

        # Compute offline test evaluation
        y_pred = self.model.predict(X_test_scaled)
        y_proba = self.model.predict_proba(X_test_scaled)[:, 1]

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        self.metrics = {
            "precision": round(float(precision_score(y_test, y_pred)), 4),
            "recall": round(float(recall_score(y_test, y_pred)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            },
            "dataset_disclaimer": "Metrics calculated on a held-out synthetic test partition (25% split, 625 samples with simulated noise). Not real customer traffic."
        }

        # Save feature weights
        coefs = self.model.coef_[0]
        self.feature_weights = {name: round(float(coefs[i]), 4) for i, name in enumerate(FEATURE_NAMES)}

    def get_metrics(self) -> Dict[str, Any]:
        weights_sorted = sorted(
            [{"feature": k, "weight": v} for k, v in self.feature_weights.items()],
            key=lambda x: abs(x["weight"]),
            reverse=True
        )
        return {
            **self.metrics,
            "feature_importances": weights_sorted
        }

    def score_transfer(
        self,
        amount_vs_typical_ratio: float,
        beneficiary_is_new: bool,
        beneficiary_account_age_days: float,
        beneficiary_inbound_velocity: float,
        beneficiary_fanout: float,
        in_call: bool,
        call_duration_min: float,
        caller_unsaved: bool,
        remote_access_active: bool,
        screen_share_active: bool,
        hour_of_day_unusual: bool,
        round_amount: bool
    ) -> RiskScoreResponse:
        raw_values = [
            amount_vs_typical_ratio,
            1.0 if beneficiary_is_new else 0.0,
            beneficiary_account_age_days,
            beneficiary_inbound_velocity,
            beneficiary_fanout,
            1.0 if in_call else 0.0,
            call_duration_min,
            1.0 if caller_unsaved else 0.0,
            1.0 if remote_access_active else 0.0,
            1.0 if screen_share_active else 0.0,
            1.0 if hour_of_day_unusual else 0.0,
            1.0 if round_amount else 0.0
        ]
        raw_vec = np.array(raw_values, dtype=float).reshape(1, -1)
        scaled_vec = self.scaler.transform(raw_vec)
        
        prob = float(self.model.predict_proba(scaled_vec)[0, 1])
        score = round(prob * 100.0, 1)

        # Feature contributions: c_i = w_i * z_i
        coefs = self.model.coef_[0]
        contributions: List[Tuple[str, float, str]] = []

        for i, name in enumerate(FEATURE_NAMES):
            w = coefs[i]
            z = scaled_vec[0, i]
            val = raw_values[i]
            contrib = float(w * z)

            # Generate human-readable explanation if feature is elevating risk
            human_text = ""
            if name == "call_duration_min" and val > 10 and in_call:
                human_text = f"You've been on an active call for {val:.0f} minutes during this transfer"
            elif name == "caller_unsaved" and val == 1.0 and in_call:
                human_text = "The active call is from an unsaved/unknown phone number"
            elif name == "remote_access_active" and val == 1.0:
                human_text = "Remote access tool (AnyDesk/TeamViewer) is running on your device"
            elif name == "screen_share_active" and val == 1.0:
                human_text = "Screen sharing is active, allowing third-party viewing of OTPs/PINs"
            elif name == "beneficiary_account_age_days" and val <= 14:
                human_text = f"Recipient account was created only {int(val)} days ago (mule pattern)"
            elif name == "beneficiary_is_new" and val == 1.0:
                human_text = "First-time transfer to a recently added beneficiary"
            elif name == "amount_vs_typical_ratio" and val >= 3.0:
                human_text = f"Transfer amount is {val:.1f}x higher than your regular spending baseline"
            elif name == "beneficiary_inbound_velocity" and val >= 5.0:
                human_text = f"Beneficiary has abnormal incoming money surge ({val:.0f} transactions/hr)"
            elif name == "round_amount" and val == 1.0 and amount_vs_typical_ratio >= 2.0:
                human_text = "Large rounded lump-sum transfer matching extortion demand pattern"
            elif name == "hour_of_day_unusual" and val == 1.0:
                human_text = "Transaction initiated during high-fraud night/early morning hours"

            if human_text and contrib > 0:
                contributions.append((name, round(contrib, 2), human_text))

        # Sort contributions descending
        contributions.sort(key=lambda x: x[1], reverse=True)

        # Ensure active call risk is represented if the victim is under an active coercive call
        selected_contributions = list(contributions)
        call_contribs = [c for c in contributions if "call" in c[2].lower()]
        if call_contribs and not any("call" in c[2].lower() for c in selected_contributions[:4]):
            top_call = call_contribs[0]
            selected_contributions.remove(top_call)
            selected_contributions.insert(1, top_call)

        reasons = [
            Reason(feature=c[0], contribution=c[1], human_text=c[2])
            for c in selected_contributions[:5]
        ]

        # Determine band & action
        if score < 35.0:
            band = "low"
            action = "pass"
            hold_min = 0
            cosign = False
        elif score < 65.0:
            band = "medium"
            action = "soft_nudge"
            hold_min = 0
            cosign = False
        elif score < 82.0:
            band = "high"
            action = "cooling_off_hold"
            hold_min = 10
            cosign = False
        else:
            band = "critical"
            action = "hold_and_cosign"
            hold_min = 30
            cosign = True

        return RiskScoreResponse(
            risk_score=score,
            band=band,
            action_recommended=action,
            reasons=reasons,
            hold_duration_minutes=hold_min,
            cosign_required=cosign
        )

risk_engine = RiskEngine()
