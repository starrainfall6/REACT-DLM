#!/usr/bin/env bash
# 启动 Vite dev server（默认端口 5173）
# 用法: ./scripts/start-dev.sh [端口号]   例: ./scripts/start-dev.sh 5173
set -euo pipefail

PORT="${1:-5173}"
echo ">> 启动 Vite dev server（端口 $PORT）..."
# 透传 --port 给 vite（package.json 中 dev = "vite"）
npm run dev -- --port "$PORT"
