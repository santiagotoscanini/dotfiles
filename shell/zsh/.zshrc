# ===========================================
# ~/.config/zsh/.zshrc
# Sourced only for interactive shells
# ===========================================

# Fix Homebrew PATH ordering issue
# macOS calls /etc/zprofile after .zshenv which adds some system paths before homebrew's.
# This ensures Homebrew binaries take precedence over system ones.
typeset -U PATH path  # Ensure PATH contains no duplicates
[[ -d /opt/homebrew/bin ]] && path=(/opt/homebrew/bin $path)

# History configuration
HISTSIZE=50000                   # Maximum events in internal history
SAVEHIST=10000                   # Maximum events in history file
setopt HIST_IGNORE_ALL_DUPS      # Don't record duplicates
setopt HIST_SAVE_NO_DUPS         # Don't write duplicates to history file
setopt HIST_REDUCE_BLANKS        # Remove superfluous blanks
setopt EXTENDED_HISTORY          # Record timestamp of command
setopt SHARE_HISTORY             # Share history between sessions
setopt HIST_IGNORE_SPACE         # Ignore commands that start with a space (useful for commands including passwords)

# Add custom completions to fpath (must be before Oh-My-Zsh loads compinit)
fpath=($ZDOTDIR/completions $fpath)

# Load additional configuration files
[[ -f $ZDOTDIR/alias.zsh ]] && source $ZDOTDIR/alias.zsh  # Load aliases
[[ -f $ZDOTDIR/oh-my.zsh ]] && source $ZDOTDIR/oh-my.zsh  # Load Oh-My-Zsh config

# Register custom completions (must be after oh-my-zsh loads compinit)
compdef _dots dots

# Santree shell integration (enables cd after create/switch, completions, aliases, useful functions, etc)
eval "$(santree helpers shell-init zsh)"

# Local customizations (if any)
[[ -f $ZDOTDIR/local.zsh ]] && source $ZDOTDIR/local.zsh

