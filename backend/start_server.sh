#!/bin/bash
# Script to start the backend server with virtual environment

cd "$(dirname "$0")"

# Activate virtual environment
source .venv/bin/activate

# Start the server
python -m app.app

