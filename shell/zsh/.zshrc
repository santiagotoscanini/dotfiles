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

# Load additional configuration files
[[ -f $ZDOTDIR/alias.zsh ]] && source $ZDOTDIR/alias.zsh  # Load aliases
[[ -f $ZDOTDIR/oh-my.zsh ]] && source $ZDOTDIR/oh-my.zsh  # Load Oh-My-Zsh config

# Enable command completion system
autoload -Uz compinit && compinit -d $ZSH_COMPDUMP

# Register completions (must be after compinit)
compdef _santree santree
compdef _santree_completions ,wts
compdef _santree_completions ,wtr

# Local customizations (if any)
[[ -f $ZDOTDIR/local.zsh ]] && source $ZDOTDIR/local.zsh

