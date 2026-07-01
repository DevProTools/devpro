#!/bin/bash
# DevPro - Production startup script
# To run: screen -dmS devpro bash start.sh

NODE="/Users/ouze/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
DIR="/Users/ouze/Desktop/DevPro"
export PATH="/Users/ouze/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"

cd "$DIR"

log() { echo "[$(date '+%H:%M:%S')] $@"; }

# Kill leftovers
kill $(lsof -ti:3000 2>/dev/null) 2>/dev/null

# Build frontend
log "Building frontend..."
$NODE node_modules/.pnpm/vite@5.4.21_@types+node@26.0.1/node_modules/vite/bin/vite.js build > /dev/null 2>&1 && log "Frontend build OK"

# Start server
log "Starting server..."
nohup $NODE server/index.js > /tmp/devpro-server.log 2>&1 &
SERVER_PID=$!
sleep 2

if ! kill -0 $SERVER_PID 2>/dev/null; then
  log "ERROR: Server failed to start"
  cat /tmp/devpro-server.log
  exit 1
fi
log "Server PID $SERVER_PID: $(curl -s http://localhost:3000/api/health)"

# Start tunnel
log "Starting SSH tunnel..."
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 \
    -R 80:localhost:3000 serveo.net > /tmp/devpro-tunnel.log 2>&1 &
TUNNEL_PID=$!
sleep 5

TUNNEL_URL=$(grep -o 'https://[^ ]*\.serveousercontent\.com' /tmp/devpro-tunnel.log 2>/dev/null)
log "Tunnel PID $TUNNEL_PID"
log "URL: ${TUNNEL_URL:-checking tunnel...}"

# Health check loop (runs every 60s)
while true; do
  # Check server
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    log "Server died! Restarting..."
    nohup $NODE server/index.js > /tmp/devpro-server.log 2>&1 &
    SERVER_PID=$!
    sleep 2
  fi

  # Check tunnel
  if ! kill -0 $TUNNEL_PID 2>/dev/null; then
    log "Tunnel died! Restarting..."
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 \
        -R 80:localhost:3000 serveo.net > /tmp/devpro-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 5
    TUNNEL_URL=$(grep -o 'https://[^ ]*\.serveousercontent\.com' /tmp/devpro-tunnel.log 2>/dev/null)
  fi

  log "OK - Server:${SERVER_PID} Tunnel:${TUNNEL_PID} ${TUNNEL_URL}"
  sleep 60
done
