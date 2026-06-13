#!/bin/bash
clear
echo "==================================================="
echo "  LAUNCHING CAPSULE WARDROBE STUDIO"
echo "==================================================="
echo
echo "[1/2] Launching local Node application server..."
echo
# Navigate to script folder
cd "$(dirname "$0")"
npm run dev &
SERVER_PID=$!

echo
echo "[2/2] Opening Capsule Wardrobe interface in your browser..."
echo
sleep 3
open "http://localhost:3000"

echo
echo "System operates offline. Keep this Terminal window open to keep closet active!"
echo "To shut down, press Ctrl+C or close this window."
echo "==================================================="

# Keep script running to allow graceful shutdown
wait $SERVER_PID
