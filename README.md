# RecoverAI – AI-Powered Revenue Recovery Agent

## Problem Statement
Businesses lose significant revenue due to failed payments. Identifying recoverable payments and taking the right action at the right time is critical for revenue recovery.

## Objectives
Help businesses identify potentially recoverable failed payments, prioritize recovery opportunities, recommend recovery actions, and generate personalized customer communication.

## Solution
RecoverAI is a dashboard that analyzes failed transactions, scores their recovery likelihood using AI, and provides actionable recommendations along with personalized customer outreach messages.

## Features
- Professional Dashboard with KPIs
- Transactions List with filtering
- Detailed Transaction Analysis
- AI-Powered Recovery Scoring & Recommendations
- AI-Generated Customer Messaging

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Python, FastAPI
- AI: Gemini API (with deterministic fallback)

## Setup Instructions

### Environment Variables
Copy `.env.example` to `.env` and configure your API keys.

### Backend
1. Navigate to `backend/`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn main:app --reload`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## Demo Workflow
1. View the Dashboard to see high-level metrics.
2. Navigate to Failed Transactions.
3. Select a transaction to view details.
4. Analyze the recovery opportunity.
5. Generate a customer message.
