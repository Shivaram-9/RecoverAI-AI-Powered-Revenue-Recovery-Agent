import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="RecoverAI API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None

# Mock Database
mock_transactions = [
    {
        "id": "TXN-1001",
        "customer": "Rahul Sharma",
        "amount": 25000,
        "status": "failed",
        "reason": "Insufficient funds",
        "attempts": 2,
        "history": "good",
        "date": "2026-08-19"
    },
    {
        "id": "TXN-1002",
        "customer": "Priya Patel",
        "amount": 4500,
        "status": "failed",
        "reason": "Bank decline",
        "attempts": 1,
        "history": "excellent",
        "date": "2026-08-20"
    },
    {
        "id": "TXN-1003",
        "customer": "Amit Kumar",
        "amount": 1250,
        "status": "failed",
        "reason": "Timeout",
        "attempts": 3,
        "history": "poor",
        "date": "2026-08-18"
    },
    {
        "id": "TXN-1004",
        "customer": "Neha Gupta",
        "amount": 8900,
        "status": "failed",
        "reason": "Authentication failure",
        "attempts": 1,
        "history": "good",
        "date": "2026-08-19"
    },
    {
        "id": "TXN-1005",
        "customer": "Vikram Singh",
        "amount": 150000,
        "status": "failed",
        "reason": "Payment method issue",
        "attempts": 1,
        "history": "fair",
        "date": "2026-08-20"
    },
    {
        "id": "TXN-1006",
        "customer": "Sneha Reddy",
        "amount": 3200,
        "status": "success",
        "reason": "N/A",
        "attempts": 1,
        "history": "good",
        "date": "2026-08-20"
    }
]

class TransactionResponse(BaseModel):
    id: str
    customer: str
    amount: float
    status: str
    reason: str
    attempts: int
    history: str
    date: str

class MetricsResponse(BaseModel):
    total_transactions: int
    total_value: float
    failed_payments: int
    recoverable_payments: int
    estimated_recoverable_revenue: float
    recovery_rate: float

class AnalysisResponse(BaseModel):
    score: int
    priority: str
    recommended_action: str
    estimated_amount: float
    explanation: str

class MessageResponse(BaseModel):
    message: str

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/transactions", response_model=List[TransactionResponse])
def get_transactions():
    return mock_transactions

@app.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: str):
    for txn in mock_transactions:
        if txn["id"] == transaction_id:
            return txn
    raise HTTPException(status_code=404, detail="Transaction not found")

@app.get("/dashboard/metrics", response_model=MetricsResponse)
def get_metrics():
    total = len(mock_transactions)
    total_val = sum(t["amount"] for t in mock_transactions)
    failed = [t for t in mock_transactions if t["status"] == "failed"]
    num_failed = len(failed)
    
    # Simple deterministic logic for mock metrics
    recoverable = [t for t in failed if t["reason"] != "Payment method issue" and t["attempts"] < 3]
    num_recoverable = len(recoverable)
    est_rev = sum(t["amount"] for t in recoverable) * 0.7  # assume 70% recovery rate on recoverable
    
    rec_rate = (num_recoverable / num_failed * 100) if num_failed > 0 else 0
    
    return MetricsResponse(
        total_transactions=total,
        total_value=total_val,
        failed_payments=num_failed,
        recoverable_payments=num_recoverable,
        estimated_recoverable_revenue=est_rev,
        recovery_rate=rec_rate
    )

@app.post("/analyze/{transaction_id}", response_model=AnalysisResponse)
def analyze_transaction(transaction_id: str):
    txn = get_transaction(transaction_id)
    
    # Deterministic fallback logic
    score = 50
    priority = "Medium"
    action = "Send payment reminder"
    
    if txn["history"] == "excellent" or txn["history"] == "good":
        score += 20
    if txn["attempts"] >= 3:
        score -= 30
    if txn["amount"] > 10000:
        priority = "High"
        action = "Contact customer support directly"
    elif txn["reason"] == "Insufficient funds":
        action = "Retry payment after 24 hours"
    elif txn["reason"] == "Bank decline":
        action = "Suggest alternative payment method"
        
    if score > 80:
        priority = "High"
    elif score < 40:
        priority = "Low"
        action = "Do not prioritize recovery"
        
    explanation = f"Based on the customer's {txn['history']} history and the failure reason ({txn['reason']}), this transaction is given a score of {score}. "
    if txn['attempts'] >= 3:
        explanation += "Multiple failed attempts reduce the likelihood of recovery."
    elif txn['amount'] > 10000:
        explanation += "High value transaction warrants personal attention."
        
    estimated = txn["amount"] * (score / 100)
    
    return AnalysisResponse(
        score=max(0, min(100, score)),
        priority=priority,
        recommended_action=action,
        estimated_amount=estimated,
        explanation=explanation
    )

@app.post("/generate-message/{transaction_id}", response_model=MessageResponse)
def generate_message(transaction_id: str):
    txn = get_transaction(transaction_id)
    
    if model:
        prompt = f"Generate a short, professional, and personalized email to a customer named {txn['customer']} about a failed payment of INR {txn['amount']} due to '{txn['reason']}'. Suggest they update their payment method or retry. Keep it empathetic but clear."
        try:
            response = model.generate_content(prompt)
            return MessageResponse(message=response.text)
        except Exception as e:
            print("Gemini API error:", e)
            # Fall back below
            
    # Deterministic fallback
    msg = f"Dear {txn['customer']},\n\nWe noticed an issue processing your recent payment of INR {txn['amount']}. The transaction failed due to '{txn['reason']}'.\n\nPlease review your payment details and consider using an alternative method or retrying the transaction.\n\nThank you,\nRecoverAI Support"
    return MessageResponse(message=msg)
