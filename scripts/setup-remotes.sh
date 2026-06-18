#!/usr/bin/env bash
# 初始化 origin 的多 push 地址配置 (见 issue #1)
# 用法: 在新设备 clone 本仓库后执行一次:
#   ./scripts/setup-remotes.sh
set -euo pipefail

REMOTE="origin"
PUSH_URLS=(
  "https://git.meideng.net/liluhui/dino-open.git"
  "https://github.com/dajiaoai/dino-docs"
)

# 清除已存在的 push url 配置,避免重复追加
git config --unset-all "remote.${REMOTE}.pushurl" 2>/dev/null || true

for url in "${PUSH_URLS[@]}"; do
  git remote set-url --add --push "$REMOTE" "$url"
done

echo "已配置 ${REMOTE} 的 push 地址:"
git remote -v | grep "(push)"
