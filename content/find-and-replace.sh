#!/bin/bash

# Usage:
#   ./find-and-replace.sh <start_directory> <filename> <find_string> <replace_string> <mode>
#
# Example:
#   ./find-and-replace.sh . page.html "response.profile" "response.data" test
#   ./find-and-replace.sh . page.html "currentUser = response" "currentUser = response.data" test
#
# Mode options:
#   test  - only list files containing the target string
#   apply - perform replacements directly (no backups)

if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <start_directory> <filename> <find_string> <replace_string> <mode>"
    echo "mode = test | apply"
    exit 1
fi

START_DIR="$1"
TARGET_FILE="$2"
FIND_STR="$3"
REPLACE_STR="$4"
MODE="$5"
LOG_FILE="./find-and-replace.log"

echo "----------------------------------------"
echo "Start directory : $START_DIR"
echo "Filename         : $TARGET_FILE"
echo "Find string      : $FIND_STR"
echo "Replace string   : $REPLACE_STR"
echo "Mode             : $MODE"
echo "Log file         : $LOG_FILE"
echo "----------------------------------------"
echo

# Clear the log file at the start
> "$LOG_FILE"

# Verify mode
if [[ "$MODE" != "test" && "$MODE" != "apply" ]]; then
    echo "Error: Mode must be 'test' or 'apply'"
    exit 1
fi

# Find and process matching files
find "$START_DIR" -type f -name "$TARGET_FILE" | while read -r file; do
    if grep -q "$FIND_STR" "$file"; then
        echo "Found in: $file"
        echo "$file" >> "$LOG_FILE"
        if [ "$MODE" = "apply" ]; then
            sed -i "s/${FIND_STR//\//\\/}/${REPLACE_STR//\//\\/}/g" "$file"
            echo "  → Updated"
        fi
    fi
done

echo
echo "----------------------------------------"
if [ "$MODE" = "test" ]; then
    echo "TEST mode complete. See $LOG_FILE for list of affected files."
else
    echo "APPLY mode complete. See $LOG_FILE for list of updated files."
fi
echo "----------------------------------------"
