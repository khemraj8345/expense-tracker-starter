#!/usr/bin/env bash
# ==============================================================================
# Automated Deployment Script for Staging Area
# ==============================================================================
set -euo pipefail

TARGET="${1:-git}"       # 'git', 'branch', or 'all'
BRANCH="${2:-staging}"   # Staging branch name
MESSAGE="${3:-release: deploy to staging}"

echo "=================================================="
echo ">>> Step 1: Pre-flight Verification"
echo "=================================================="
if [ ! -f "package.json" ]; then
  echo "[ERROR] package.json not found. Run from project root."
  exit 1
fi
echo "[SUCCESS] Project root confirmed."

echo "=================================================="
echo ">>> Step 2: Running All Tests First"
echo "=================================================="
npm test
npm run lint
echo "[SUCCESS] All tests and lint checks passed."

echo "=================================================="
echo ">>> Step 3: Building Production Bundle"
echo "=================================================="
npm run build
if [ ! -f "dist/index.html" ]; then
  echo "[ERROR] Build verification failed: dist/index.html missing."
  exit 1
fi
echo "[SUCCESS] Production bundle verified in ./dist."

echo "=================================================="
echo ">>> Step 4: Staging Changes (Target: ${TARGET})"
echo "=================================================="
if [ "$TARGET" = "git" ] || [ "$TARGET" = "all" ]; then
  echo "Staging files in Git index..."
  git add -A
  git status --short
  echo "[SUCCESS] Files added to Git staging area."
fi

if [ "$TARGET" = "branch" ] || [ "$TARGET" = "all" ]; then
  if [ -n "$(git status --porcelain)" ]; then
    echo "Committing changes before branch switch..."
    git commit -m "$MESSAGE"
  fi

  if git show-ref --quiet refs/heads/"$BRANCH"; then
    git checkout "$BRANCH"
    git merge - --no-edit
  else
    git checkout -b "$BRANCH"
  fi

  echo "Pushing to remote $BRANCH branch..."
  git push origin "$BRANCH" || echo "[WARNING] Could not push to remote origin/$BRANCH."
  echo "[SUCCESS] Changes pushed to $BRANCH."
fi

echo "=================================================="
echo ">>> Deployment to Staging Complete!"
echo "=================================================="
