#!/usr/bin/env bash
#
# Usage:
#   ./prepend_headers.sh [project_root]
#
# If [project_root] is omitted, the current directory (.) is used.
#
# The script:
#  1) Recursively searches for all files under [project_root], excluding .git, node_modules, and .next.
#  2) Skips any file not recognized as "text/" by `file --mime-type`.
#  3) Skips package.json specifically, since true JSON does not allow comments.
#  4) Determines an appropriate comment style based on file extension (including Dockerfile and .mjs).
#  5) Prepends a single comment line with the file's relative path if the file doesn't already have it.
#
# MacOS specifics:
#  - We exclude .next (build artifacts).
#  - We rely on python3 to compute relative paths (instead of realpath --relative-to).
#  - We use LC_CTYPE=C LANG=C with sed to avoid "illegal byte sequence" issues.

BASE_DIR="${1:-.}"

# -----------------------------------------------------------------------------
# 1) Check if a file is text, skipping binary files.
# -----------------------------------------------------------------------------
is_text_file() {
  local f="$1"
  local mimetype
  mimetype="$(file --mime-type -b "$f" 2>/dev/null)"
  if echo "$mimetype" | grep -qi '^text/'; then
    return 0  # It's a recognized text file
  else
    return 1  # Not recognized as text
  fi
}

# -----------------------------------------------------------------------------
# 2) Compute relative path using Python (works on macOS).
# -----------------------------------------------------------------------------
get_relative_path() {
  local target="$1"
  local base="$2"
  python3 -c "import os; print(os.path.relpath('$target', '$base'))"
}

# -----------------------------------------------------------------------------
# 3) Determine the comment style start symbol.
# -----------------------------------------------------------------------------
get_comment_style() {
  local full_filename="$1"
  local filename
  filename="$(basename "$full_filename")"
  local ext="${filename##*.}"

  # Special-case Dockerfile (no extension).
  if [[ "$filename" == "Dockerfile" ]]; then
    echo "#"
    return
  fi

  case "$ext" in
    ts|tsx|js|jsx|json|mjs )
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
      # Default fallback to '#'
      echo "#"
      ;;
  esac
}

# -----------------------------------------------------------------------------
# 4) Determine the comment style end symbol.
# -----------------------------------------------------------------------------
get_comment_ending_style() {
  local full_filename="$1"
  local filename
  filename="$(basename "$full_filename")"
  local ext="${filename##*.}"

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
# 5) Main logic
# -----------------------------------------------------------------------------
while IFS= read -r -d '' file; do
  # Skip binary (non-text) files
  if ! is_text_file "$file"; then
    continue
  fi

  # Skip package.json because valid package.json must have no comments.
  if [[ "$(basename "$file")" == "package.json" ]]; then
    continue
  fi

  comment_start="$(get_comment_style "$file")"
  comment_end="$(get_comment_ending_style "$file")"
  rel_path="$(get_relative_path "$file" "$BASE_DIR")"
  expected_comment="${comment_start} ${rel_path}${comment_end}"

  # Check the file’s first line
  first_line="$(head -n 1 "$file")"

  # If missing or incorrect, prepend the new header line
  if [[ "$first_line" != "$expected_comment" ]]; then
    # Force locale to avoid "illegal byte sequence" errors on macOS
    if ! LC_CTYPE=C LANG=C sed -i '' -e "1s|^|${expected_comment}\n|" "$file" 2>/dev/null; then
      echo "Skipping file due to sed error: $file"
      continue
    fi
    echo "Prepended header in: $file"
  fi
done < <(
  find "$BASE_DIR" -type f \
    ! -path '*/.git/*' \
    ! -path '*/node_modules/*' \
    ! -path '*/.next/*' \
    -print0
)
