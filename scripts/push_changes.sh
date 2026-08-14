#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/push_changes.sh <remote-url> [branch] [commit-message]
# Example: ./scripts/push_changes.sh git@github.com:mehrotra-raj/Duolingo-Clone.git main "Deploy: prepare Fly deploy"

REMOTE_URL=${1:-}
BRANCH=${2:-main}
COMMIT_MSG=${3:-"chore: sync workspace changes"}

if [ -z "$REMOTE_URL" ]; then
  echo "Error: remote-url is required."
  echo "Usage: $0 <remote-url> [branch] [commit-message]"
  exit 1
fi

# Ensure we're at repo root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Initialize git if needed
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
fi

# Add remote if not present or different
if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_URL=$(git remote get-url origin)
  if [ "$CURRENT_URL" != "$REMOTE_URL" ]; then
    echo "Updating origin remote to $REMOTE_URL"
    git remote set-url origin "$REMOTE_URL"
  fi
else
  echo "Adding origin remote: $REMOTE_URL"
  git remote add origin "$REMOTE_URL"
fi

# Stage all changes
git add -A

# Commit if there are changes
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

# Fetch remote refs and create branch if needed
git fetch origin || true
if git show-ref --verify --quiet refs/heads/$BRANCH; then
  git checkout $BRANCH
else
  # create local branch
  git checkout -b $BRANCH
fi

# Push
echo "Pushing to origin/$BRANCH..."
# Use --set-upstream in case remote branch doesn't exist
git push --set-upstream origin $BRANCH

echo "Push complete."
