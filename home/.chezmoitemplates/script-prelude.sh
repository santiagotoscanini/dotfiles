{{- /*
  Shared start of every script in .chezmoiscripts.
  Include it right after the shebang: {{ template "script-prelude.sh" . }}
*/ -}}
set -euo pipefail

# Make sure Homebrew's tools (brew, gh) are on PATH even when chezmoi was
# started from a shell that hasn't loaded them yet.
eval "$(/opt/homebrew/bin/brew shellenv)"

log()  { printf '\033[1;34m==>\033[0m \033[1m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWarning:\033[0m %s\n' "$*" >&2; }
