#!/bin/bash

# Replaces a string in every file of the given name. The strings are matched
# literally. Safe to run more than once: where the replacement contains the
# find string, text that has already been replaced is left alone.
#
# Usage:
#   ./find-and-replace.sh <start_directory> <filename> <find_string> <replace_string> <mode>
#
# Example:
#   ./find-and-replace.sh . page.html "response.profile" "response.data" test
#   ./find-and-replace.sh . page.html "currentUser = response;" "currentUser = response.data;" test
#
# Mode options:
#   test  - only list files that would change
#   apply - perform replacements directly (no backups)

set -euo pipefail

if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <start_directory> <filename> <find_string> <replace_string> <mode>"
    echo "mode = test | apply"
    exit 1
fi

START_DIR="$1"
TARGET_FILE="$2"
export FIND_STR="$3"
export REPLACE_STR="$4"
export MODE="$5"
LOG_FILE="./find-and-replace.log"

if [[ "$MODE" != "test" && "$MODE" != "apply" ]]; then
    echo "Error: Mode must be 'test' or 'apply'"
    exit 1
fi

if [ -z "$FIND_STR" ]; then
    echo "Error: The find string must not be empty"
    exit 1
fi

if [ ! -d "$START_DIR" ]; then
    echo "Error: $START_DIR is not a directory"
    exit 1
fi

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

# Prints the number of replacements; writes the file only in apply mode
replace_in_file() {
    perl -e '
        my ($file) = @ARGV;
        my ($find, $new) = ($ENV{FIND_STR}, $ENV{REPLACE_STR});
        open(my $in, "<:raw", $file) or die "Cannot read $file: $!\n";
        local $/; my $text = <$in>; close($in);
        my $pattern = quotemeta($find);
        my $at = index($new, $find);
        if ($at >= 0) {
            my $before = quotemeta(substr($new, 0, $at));
            my $after = quotemeta(substr($new, $at + length($find)));
            $pattern = "(?!(?<=$before)$pattern$after)$pattern";
        }
        my $count = ($text =~ s/$pattern/$new/g) || 0;
        if ($count && $ENV{MODE} eq "apply") {
            open(my $out, ">:raw", $file) or die "Cannot write $file: $!\n";
            print $out $text; close($out) or die "Cannot write $file: $!\n";
        }
        print $count;
    ' "$1"
}

while IFS= read -r -d '' file; do
    count=$(replace_in_file "$file")
    if [ "$count" -gt 0 ]; then
        echo "Found in: $file ($count)"
        echo "$file" >> "$LOG_FILE"
        if [ "$MODE" = "apply" ]; then
            echo "  → Updated"
        fi
    fi
done < <(find "$START_DIR" -type f -name "$TARGET_FILE" -print0)

echo
echo "----------------------------------------"
if [ "$MODE" = "test" ]; then
    echo "TEST mode complete. See $LOG_FILE for list of affected files."
else
    echo "APPLY mode complete. See $LOG_FILE for list of updated files."
fi
echo "----------------------------------------"
