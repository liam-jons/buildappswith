#!/bin/bash

# Structurizr management script for Buildappswith
# Usage: ./structurizr.sh [start|stop|status]

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

function start_structurizr {
  echo "Starting Structurizr Lite..."
  docker-compose up -d
  echo "Structurizr Lite is running at http://localhost:8080"
}

function stop_structurizr {
  echo "Stopping Structurizr Lite..."
  docker-compose down
  echo "Structurizr Lite stopped"
}

function check_status {
  CONTAINER_STATUS=$(docker-compose ps -q)
  if [ -z "$CONTAINER_STATUS" ]; then
    echo "Structurizr Lite is not running"
    return 1
  else
    echo "Structurizr Lite is running at http://localhost:8080"
    return 0
  fi
}

case "$1" in
  start)
    start_structurizr
    ;;
  stop)
    stop_structurizr
    ;;
  status)
    check_status
    ;;
  restart)
    stop_structurizr
    start_structurizr
    ;;
  *)
    echo "Usage: $0 [start|stop|restart|status]"
    exit 1
    ;;
esac

exit 0
