#!/bin/bash

# Function to cleanup processes
cleanup() {
    echo "Cleaning up processes..."
    pkill -f ngrok
    pkill -f "next dev"
    exit 0
}

# Set up trap for Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Kill any existing ngrok processes
pkill -f ngrok

# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9

# Start ngrok first
ngrok http --domain tolerant-bengal-hideously.ngrok-free.app 3000 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Then start Next.js
pnpm dev &
NEXT_PID=$!

# Wait for either process to exit
wait $NGROK_PID $NEXT_PID
