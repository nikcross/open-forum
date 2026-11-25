#!/bin/bash
#
# Clears everything from content/source that must not go out in a release.
# Safe to run from any folder and to run more than once.
#
# Usage:
#   ./purge-source.sh --dry-run   list what would be removed, change nothing
#   ./purge-source.sh             remove it
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
SOURCE="./source"
OPENFORUM="$SOURCE/OpenForum"

DRY_RUN=false
case "${1:-}" in
  "") ;;
  --dry-run) DRY_RUN=true ;;
  *) echo "Usage: $0 [--dry-run]"; exit 1 ;;
esac

if [ ! -d "$OPENFORUM" ]; then
  echo "Error: $OPENFORUM not found in $(pwd)"
  exit 1
fi

# Reads NUL separated paths and removes each one
remove() {
  local path
  while IFS= read -r -d '' path; do
    if [ "$DRY_RUN" = true ]; then
      echo "would remove $path"
    else
      echo "removing $path"
      rm -rf -- "$path"
    fi
  done
}

# Page history
find "$SOURCE" -type d -name history -prune -print0 | remove

# Archives, logs and editor leftovers
find "$SOURCE" -type f \( -name '*.zip' -o -name '*.log' -o -name '*.swp' -o -name '*.old' -o -name '*.bak' -o -name '*~' \) -print0 | remove

# Cached page trees, which list the pages of the server they came from
find "$SOURCE" -type f -name 'tree--*.cached.js' -print0 | remove

# Pages created while a server runs
for page in Sandbox Journal MissingPages Temporary; do
  if [ -e "$OPENFORUM/$page" ]; then
    printf '%s\0' "$OPENFORUM/$page" | remove
  fi
done

# Deleted pages, keeping the DeletedPages page itself
if [ -d "$OPENFORUM/DeletedPages" ]; then
  find "$OPENFORUM/DeletedPages" -mindepth 1 -maxdepth 1 -type d -print0 | remove
fi

# Sign-in details of the server the content came from
for name in test.txt authentication.hash.a authentication.hash.b; do
  if [ -e "$OPENFORUM/Authentication/$name" ]; then
    printf '%s\0' "$OPENFORUM/Authentication/$name" | remove
  fi
done
if [ -d "$OPENFORUM/Users" ]; then
  find "$OPENFORUM/Users" -type f \( -name 'authentication.config' -o -name 'mailer.config' \) -print0 | remove
fi

# Placeholder password for the Admin user
if [ "$DRY_RUN" = true ]; then
  echo "would set the Admin placeholder password"
else
  echo "1234" > "$OPENFORUM/Users/Admin/password.txt"
  echo "Admin placeholder password set"
fi
