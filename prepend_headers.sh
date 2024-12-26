#!/usr/bin/env bash
#
# Usage:
#   ./prepend_headers.sh [project_root]
#
# If [project_root] is omitted, the current directory (.) is used.
# This script:
#  1) Recursively searches for all files under [project_root], excluding .git & node_modules.
#  2) Determines an appropriate comment style based on file extension.
#  3) Checks the file's first line; if it isn't the expected relative-path comment, it prepends it.
#
# MacOS NOTES:
#  - No native realpath
#  - BSD sed usage: sed -i '' -e "s/old/new/" file

BASE_DIR="${1:-.}"

# -----------------------------------------------------------------------------
# Function: get_relative_path
# Description: Returns the relative path of the first argument to the second (base) argument using Python.
# -----------------------------------------------------------------------------
get_relative_path() {
  local target="$1"
  local base="$2"
  # We'll rely on Python's os.path.relpath to get the relative path
  python3 -c "import os,sys; print(os.path.relpath('$target', '$base'))"
}

# -----------------------------------------------------------------------------
# Function: get_comment_style
# Description: Returns the appropriate comment style (start symbol) for a given file extension.
# -----------------------------------------------------------------------------
get_comment_style() {
  local ext="$1"
  case "$ext" in
    ts|tsx|js|jsx|json )
      echo "//"
      ;;
    css|scss )
      echo "/*"
      ;;
    sh|bash )
      echo "#"
      ;;
    yaml|yml )
      echo "#"
      ;;
    *)
      # Default comment style
      echo "#"
      ;;
  esac
}

# -----------------------------------------------------------------------------
# Function: get_comment_ending_style
# Description: Returns the appropriate comment style (end symbol) for a given file extension.
# -----------------------------------------------------------------------------
get_comment_ending_style() {
  local ext="$1"
  case "$ext" in
    css|scss )
      echo " */"
      ;;
    *)
      echo ""
      ;;
  esac
}

# -----------------------------------------------------------------------------
# Main logic
# -----------------------------------------------------------------------------
while IFS= read -r -d '' file; do
  # Make sure it's not a directory (though find -type f ensures they're files).
  if [[ -d "$file" ]]; then
    continue
  fi

  # Extract the file extension (anything after last dot).
  ext="${file##*.}"

  # Determine comment style.
  comment_start="$(get_comment_style "$ext")"
  comment_end="$(get_comment_ending_style "$ext")"

  # Build the expected header line using relative path to BASE_DIR.
  rel_path="$(get_relative_path "$file" "$BASE_DIR")"
  expected_comment="${comment_start} ${rel_path}${comment_end}"

  # Check the file’s first line.
  first_line="$(head -n 1 "$file")"

  if [[ "$first_line" != "$expected_comment" ]]; then
    # On macOS, BSD sed requires an empty string after -i to specify "no backup".
    sed -i '' -e "1s|^|${expected_comment}\n|" "$file"
    echo "Prepended header in: $file"
  fi
done < <(
  find "$BASE_DIR" -type f \
    ! -path '*/.git/*' \
    ! -path '*/node_modules/*' \
    -print0
)
