#!/bin/bash

for file in *.html; do
  # Skip non-HTML files (like .css, .js)
  [[ "$file" == *.css || "$file" == *.js || "$file" == "index.html" ]] && continue

  # Get the base name without extension
  name="${file%.html}"

  # Create a directory and move the file inside as index.html
  mkdir -p "$name"
  mv "$file" "$name/index.html"
done
