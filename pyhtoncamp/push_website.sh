#!/usr/bin/env bash
set -e

REPO_URL="$1"

if ! command -v git >/dev/null 2>&1; then
  echo "Git is not installed or not in PATH. Please install Git and re-run this script." >&2
  exit 1
fi

if [ ! -d .git ]; then
  git init
fi

git add .
if ! git commit -m "Add website files" >/dev/null 2>&1; then
  # ignore commit failure if nothing to commit
  true
fi

if [ -z "$REPO_URL" ]; then
  echo "Repository URL not provided. Usage: ./push_website.sh https://github.com/USER/REPO.git"
  exit 0
fi

if git remote | grep -q origin; then
  git remote remove origin
fi
git remote add origin "$REPO_URL"
git branch -M main
git push -u origin main
