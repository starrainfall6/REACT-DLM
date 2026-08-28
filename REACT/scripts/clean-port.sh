#!/usr/bin/env bash
# 清理占用指定端口的进程（默认 5173）
# 用法: ./scripts/clean-port.sh [端口号]   例: ./scripts/clean-port.sh 5173
set -euo pipefail

PORT="${1:-5173}"
echo ">> 查找占用端口 $PORT 的进程..."

# 仅取 LISTENING 状态、本地地址含 :PORT 的行的 PID（netstat 第5列）
PIDS=$(netstat -ano 2>/dev/null \
  | grep LISTENING \
  | awk -v p=":$PORT" '$2 ~ p {print $5}' \
  | sort -u)

if [ -z "$PIDS" ]; then
  echo "端口 $PORT 未被占用。"
  exit 0
fi

for PID in $PIDS; do
  echo "结束 PID=$PID ..."
  # cmd //c 包装，避免 Git Bash 把 /PID 当作路径转义
  cmd //c "taskkill /F /PID $PID" >/dev/null 2>&1 || true
done

sleep 1

REMAIN=$(netstat -ano 2>/dev/null \
  | grep LISTENING \
  | awk -v p=":$PORT" '$2 ~ p {print $5}')

if [ -z "$REMAIN" ]; then
  echo "端口 $PORT 已释放。"
else
  echo "警告：端口 $PORT 仍被占用，请手动检查。"
  exit 1
fi
