#!/usr/bin/env bash
set -e

cd "$(git rev-parse --show-toplevel)"

echo "📁 Repo: $(pwd)"

echo "🔎 Branch kontrol..."
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ main branch'te değilsin. Şu an: $BRANCH"
  echo "Lütfen main branch worktree içinde çalıştır."
  exit 1
fi

echo "🔎 Remote kontrol..."
git remote get-url origin >/dev/null

echo "🧹 Değişiklik kontrol..."
if [ -n "$(git status --porcelain)" ]; then
  echo "💾 Değişiklikler commitleniyor..."
  git add .
  git commit -m "auto deploy"
else
  echo "ℹ️ Değişiklik yok, deploy tetiklemek için boş commit atılıyor..."
  git commit --allow-empty -m "trigger deploy"
fi

echo "🚀 Push origin main..."
git push origin main

echo "✅ Push tamam. Vercel main branch deploy tetiklemeli."
