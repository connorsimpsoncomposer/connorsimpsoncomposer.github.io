#!/bin/bash

# Set the root directory to start from (default to current dir if none provided)
ROOT_DIR="${1:-.}"

# Function to process a single file
process_file() {
  local file="$1"
  if grep -q 'class="back-to-works"' "$file" && grep -q '<div class="work-title">' "$file"; then
    # Extract the title text using grep
    TITLE=$(grep -oP '<h2>\K.*?(?=</h2>)' "$file")
    
    # Use temporary file for safe replacement
    tmpfile=$(mktemp)
    
    # Replace lines using awk
    awk -v title="$TITLE" '
      BEGIN { found = 0 }
      /<a href="\/works" class="back-to-works">← Back to Works<\/a>/ {
        found = 1
        skip = 1
        print "<div class=\"work-header\">"
        print "  <h2 class=\"work-title\">" title "</h2>"
        print "  <a href=\"/works\" class=\"back-to-works\">← Back to Works</a>"
        next
      }
      found && /<\/div>/ && skip {
        skip = 0
        next
      }
      { print }
    ' "$file" > "$tmpfile"

    mv "$tmpfile" "$file"
    echo "✔ Updated $file"
  fi
}

# Recursively find and process all HTML files
find "$ROOT_DIR" -type f -name "*.html" | while read -r file; do
  process_file "$file"
done
