#!/usr/bin/env bash
#
# Usage:
#   ./prepend_headers.sh [project_root]
#
# If [project_root] is omitted, the current directory (.) is used.
# The script:
# 1. Recursively searches for all files in project_root, excluding .git and node_modules.
# 2. Determines the comment style based on file extension.
# 3. Checks the file's first line; if it doesn't match the expected relative-path comment, it prepends it.

BASE_DIR="${1:-.}"

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
# Description: Returns the appropriate comment style (ending symbol) for a given file extension.
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
  # Skip directories (though `-type f` should only yield files).
  if [[ -d "$file" ]]; then
    continue
  fi

  # Extract extension (anything after the last dot).
  ext="${file##*.}"

  # Determine comment style start/end.
  comment_start="$(get_comment_style "$ext")"
  comment_end="$(get_comment_ending_style "$ext")"

  # Build the expected header line using *relative* path to BASE_DIR.
  rel_path="$(realpath --relative-to="$BASE_DIR" "$file")"
  expected_comment="${comment_start} ${rel_path}${comment_end}"

  # Check the file's first line.
  first_line="$(head -n 1 "$file")"

  if [[ "$first_line" != "$expected_comment" ]]; then
    # Prepend the correct comment line if missing/incorrect.
    sed -i "1s|^|${expected_comment}\n|" "$file"
    echo "Prepended header in: $file"
  fi
done < <(
  find "$BASE_DIR" -type f \
    ! -path '*/.git/*' \
    ! -path '*/node_modules/*' \
    -print0
)
