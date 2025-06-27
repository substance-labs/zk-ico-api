#!/bin/bash

echo "🚀 Starting Base Contract Deployment API with ngrok tunnel..."
echo ""

# Start the API server in the background
echo "📡 Starting API server on port 3000..."
npm run dev &
SERVER_PID=$!

# Wait a few seconds for the server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 &
NGROK_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

echo ""
echo "✅ API server and ngrok tunnel are running!"
echo "📝 Your API is now accessible from the internet via the ngrok URL"
echo "💡 Check the ngrok web interface at http://127.0.0.1:4040 for the public URL"
echo "🔗 API documentation will be available at: https://your-ngrok-url.ngrok.io/api"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user to interrupt
wait
