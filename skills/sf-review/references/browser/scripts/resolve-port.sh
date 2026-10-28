#!/usr/bin/env bash
# Print the preferred local-preview port on stdout, alone, so a caller can capture it.
#
# Usage: resolve-port.sh [--free] [EXPLICIT_PORT]
#   --free         after resolving, scan upward to the first port with no listener
#   EXPLICIT_PORT  a port the caller already knows (the user's --port, or an in-context
#                  project instruction that states the dev-server port)
#
# Resolution order: EXPLICIT_PORT, a --port flag in package.json, PORT= in .env /
# .env.local / .env.development, then 3000 (Salesforce local preview default).
set -u

free=0
explicit=""
for arg in "$@"; do
  case "$arg" in
    --free) free=1 ;;
    "") ;;
    *[!0-9]*) ;;
    *) explicit="$arg" ;;
  esac
done

port="$explicit"
if [ -z "$port" ]; then
  port=$(grep -Eo -- '--port[= ]+[0-9]{2,5}' package.json 2>/dev/null | grep -Eo '[0-9]{2,5}' | head -1)
fi
if [ -z "$port" ]; then
  port=$(grep -h '^PORT=' .env .env.local .env.development 2>/dev/null | tail -1 | grep -Eo '[0-9]+' | head -1)
fi
port="${port:-3000}"

if [ "$free" = 1 ]; then
  while command -v lsof >/dev/null 2>&1 && lsof -i ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; do
    port=$((port + 1))
  done
fi

echo "$port"
