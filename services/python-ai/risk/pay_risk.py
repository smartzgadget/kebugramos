from pydantic import BaseModel

class PayRiskInput(BaseModel):
    amount_minor: int
    currency: str
    counterparty: str
    idempotency_key: str

# Python intelligence — scores, Java records. Rule-based sibling to fraud-risk.
def score_pay_risk(inp: PayRiskInput) -> dict:
    risk = "low"
    if inp.amount_minor > 5_000_00:  # >5k RWF showcase threshold
        risk = "review"
    if inp.counterparty.lower() in {"blocked-handle"}:
        risk = "block"
    return {"risk": risk, "score": 12 if risk == "low" else 78, "explain": "python-ai/risk — amountMinor + blocklist"}
