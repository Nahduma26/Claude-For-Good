# Claude-For-Good

> Professor Inbox Copilot — a semantic inbox assistant for instructors (Gemini-powered)

## Table of Contents
- [Overview](#overview)
- [Problem](#problem)
- [Solution & Core Capabilities](#solution--core-capabilities)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Status](#project-status)
- [Contributors](#contributors)

## Overview

Professor Inbox Copilot is a full-stack web application that uses Google Gemini models to help instructors manage high-volume, ambiguous, and emotionally charged inboxes with minimal manual configuration. Rather than relying on keyword rules, the system applies semantic reasoning to triage, summarize, draft replies, and surface trends across an instructor's email history.

## Problem

Instructors receive a continuous stream of messages from students, TAs, collaborators, and administrators. Emails are often repetitive, urgent, or require policy-aware responses. Existing tools (filters, rules, Copilot Agents) are limited because they do not understand meaning, urgency, or policy context.

## Solution & Core Capabilities

- Semantic triage: intent, topic, urgency, and policy relevance detection.
- Thread summaries and policy-aware draft replies.
- Daily digests and multi-email trend detection (e.g., repeated questions).
- Ask-the-Inbox: conversational RAG (retrieval-augmented generation) search across your full inbox history.

## Key Features

- Semantic classification of messages
- Urgency and emotional load detection
- Topic grouping and triage dashboard
- Thread summaries and tone-matched draft replies
- Automated daily digests
- Conversational RAG search over inbox history
- Zero configuration required for basic operation

## Architecture

High level:

- Frontend: React application (dashboard, thread view, digests, Ask-the-Inbox)
- Backend: Flask API (authentication, Microsoft Graph integration, Gemini orchestration, RAG pipeline)
- Database: PostgreSQL for users, messages, embeddings, and preferences
- Vector store: embeddings for RAG search

Gemini models used:

- Gemini Reasoning — semantic triage and intent detection
- Gemini 2.0 (Flash / Pro) — summarization and drafting
- Embedding-001 — vector embeddings for RAG search

## Getting Started

Prerequisites

- Node.js (LTS) for the frontend
- Python 3.10+ and pip for the backend
- PostgreSQL (or a compatible database)
- A Microsoft Azure app or Microsoft 365 credentials for Graph API access

### Quick start (development)

1. Frontend

```powershell
cd .\frontend
npm install
npm start
```

2. Backend (from repo root)

```powershell
cd .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy .env.template to .env and fill values (CLIENT_ID, CLIENT_SECRET, DATABASE_URL, etc.)
# Then run the Flask app (or use uvicorn/gunicorn as configured)
flask run
```

Notes

- If PowerShell blocks npm scripts (e.g. `npm.ps1` errors), use `npm.cmd` or temporarily set the execution policy for the session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

### Detailed startup (recommended)

Follow these steps to start both frontend and backend for local development (PowerShell examples):

1) Prepare backend

```powershell
cd .\backend
# create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# install Python deps
pip install -r requirements.txt

# copy environment template and edit values
copy ..\.env.template .env
# Edit .env and set DATABASE_URL, MICROSOFT_CLIENT_ID/SECRET, GEMINI_API_KEY, etc.

# run database migrations (Alembic)
alembic upgrade head

# start backend (app is in backend/app)
python -m app.app
```

2) Start frontend (new terminal)

```powershell
cd .\frontend
# on PowerShell use npm.cmd if you see execution-policy errors
npm.cmd install
npm.cmd start
```

Notes

- Backend defaults to `http://0.0.0.0:8000` (CORS allowed from `http://localhost:3000` by default).
- Frontend runs on `http://localhost:3000` by default.
- If you prefer `flask run`, set `FLASK_APP=app.app` and run `flask run --host=0.0.0.0 --port=8000` from the `backend` folder after activating the venv.
- If `alembic` is not on PATH, run it via the module: `python -m alembic upgrade head` from the `backend` folder.
- If PowerShell blocks npm scripts (e.g. `npm.ps1` errors), use `npm.cmd` or temporarily set the execution policy for the session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

Run both services in separate terminals so you can see logs from each.

## Development

- The `frontend` folder contains a React + TypeScript app using `react-scripts`.
- The `backend` folder contains a Flask app with authentication, processing, and Gemini integrations.
- Database migrations use Alembic (see `backend/alembic`).

## Project Status

This repository contains the core backend implementation, React frontend, Microsoft Graph OAuth integration, RAG search pipeline, and semantic triage / digest functionality. Execution and deployment instructions are being finalized; follow the `Getting Started` section for local development.

## Contributors

- Amudhan Selvam
- Altaf Syed
- Joshua Krishnappa

---
