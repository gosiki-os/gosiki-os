#!/bin/bash
# Demo script for Gosiki OS Port Manager
# Usage: ./scripts/demo.sh [clean|hold|list]

case "$1" in
  # GIF1: Clean environment + Port acquisition
  clean)
    echo "🧹 Cleaning registry..."
    rm -f ~/.gosiki-os/port-registry.json
    echo ""

    echo "📦 Acquiring port with Gosiki OS..."
    npx @gosiki-os/port-manager --label frontend
    ;;

  # GIF2: Acquire and hold port for 30 seconds
  hold)
    echo "📌 Acquiring and holding port..."
    npx @gosiki-os/port-manager --label backend
    echo ""
    echo "⏳ Holding port for 30 seconds (for demo purposes)..."
    sleep 30
    echo "✅ Demo completed"
    ;;

  # GIF3: List allocated ports
  list)
    echo "📋 Listing allocated ports..."
    npx @gosiki-os/port-manager --list
    ;;

  # Release demo
  release)
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/demo.sh release <port>"
      exit 1
    fi
    echo "🔓 Releasing port $2..."
    npx @gosiki-os/port-manager --release "$2"
    ;;

  *)
    echo "Usage: ./scripts/demo.sh [clean|hold|list|release <port>]"
    echo ""
    echo "Commands:"
    echo "  clean    - Clean registry and acquire new port"
    echo "  hold     - Acquire port and hold for 30 seconds"
    echo "  list     - List all allocated ports"
    echo "  release  - Release a specific port"
    exit 1
    ;;
esac
