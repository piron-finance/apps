#!/bin/sh
# Refuses a commit that would put a credential into git.
#
# A key in git is a leaked key: it is in every clone and every fork from that commit on,
# and deleting it later does not take it back. Keys belong in the environment (.env
# locally, Railway variables when deployed) and are read from there at runtime.
#
#   check-secrets.sh            scan what is staged   (the pre-commit hook)
#   check-secrets.sh --tracked  scan every tracked file (CI)
#
# A real false positive can be let through with `git commit --no-verify`. Prefer fixing
# the pattern below, so the next person is not taught to skip the check.

set -u

MODE="${1:---staged}"

# One extended regex per line. Each describes a credential's shape, never a specific value.
PATTERNS='g\.alchemy\.com/v2/[A-Za-z0-9_-]{16,}
alch_[A-Za-z0-9_-]{16,}
infura\.io/v3/[a-f0-9]{32}
-----BEGIN [A-Z ]*PRIVATE KEY-----
(PRIVATE_KEY|private_key|privateKey|MNEMONIC)["'"'"' ]*[:=]["'"'"' ]*(0x)?[a-fA-F0-9]{64}
sk-ant-[A-Za-z0-9_-]{20,}
sk_live_[A-Za-z0-9]{16,}
phx_[A-Za-z0-9]{20,}
eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.
postgres(ql)?://[^:/ ]+:[^@ ]{6,}@'

# Placeholders that have a credential's shape and are not one.
ALLOW='YOUR_[A-Z_]*KEY|<[a-z_-]*key>|\$\{[A-Z_]+\}|\$[A-Z_]+|process\.env\.|://user:pass(word)?@'

patterns_file=$(mktemp)
trap 'rm -f "$patterns_file"' EXIT
printf '%s\n' "$PATTERNS" > "$patterns_file"

# Scans file contents as git holds them and prints "path:line:text" for each hit.
# This script's own patterns and lockfiles full of hashes are skipped.
scan() {
  git grep -nIE -f "$patterns_file" "$@" 2>/dev/null \
    | grep -vE '^(\.githooks/check-secrets\.sh|.*(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.lock)):' \
    | grep -vE "$ALLOW"
}

not_an_example() {
  grep -E '(^|/)\.env(\.[^/]*)?$' | grep -vE '\.(example|sample|template)$'
}

if [ "$MODE" = "--tracked" ]; then
  hits=$(scan -- .)
  env_files=$(git ls-files | not_an_example)
else
  # The staged version of each file being committed, whole: a file that still holds a
  # key is refused even when the lines changed this time are unrelated to it.
  staged=$(git diff --cached --name-only --diff-filter=ACMR)
  hits=""
  if [ -n "$staged" ]; then
    hits=$(git diff --cached --name-only -z --diff-filter=ACMR | xargs -0 sh -c '
      git grep --cached -nIE -f "$0" -- "$@" 2>/dev/null' "$patterns_file" \
      | grep -vE '^(\.githooks/check-secrets\.sh|.*(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.lock)):' \
      | grep -vE "$ALLOW")
  fi
  env_files=$(printf '%s\n' "$staged" | not_an_example)
fi

found=0

if [ -n "$hits" ]; then
  found=1
  echo "check-secrets: these lines look like a credential:" >&2
  # Where it is, never the value: this output ends up in terminals and CI logs.
  printf '%s\n' "$hits" | cut -d: -f1,2 | sed 's/^/  /' >&2
fi

if [ -n "$env_files" ]; then
  found=1
  echo "check-secrets: env files do not belong in git:" >&2
  printf '%s\n' "$env_files" | sed 's/^/  /' >&2
fi

if [ "$found" -ne 0 ]; then
  echo "" >&2
  echo "Move the value to the environment and read it at runtime. If it was ever pushed," >&2
  echo "rotate it: removing it from the code does not un-leak it." >&2
  exit 1
fi
