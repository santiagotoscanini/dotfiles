# ===========================================
# ~/.config/zsh/.zshenv
# Sourced on all invocations of the shell
# ===========================================

# =========== PATH Configuration ===========
typeset -U PATH path  # Ensure PATH contains no duplicates

# Add Cargo (Rust) binaries to PATH
[[ -d $HOME/.cargo/bin ]] && path=($HOME/.cargo/bin $path)
[[ -d /opt/homebrew/bin ]] && path=(/opt/homebrew/bin $path)

# Add Postgres
[[ -d /opt/homebrew/opt/libpq/bin ]] && path=(/opt/homebrew/opt/libpq/bin $path)

# Add JetBrains scripts to PATH
[[ -d "$HOME/Library/Application Support/JetBrains/Toolbox/scripts" ]] && \
  path=("$HOME/Library/Application Support/JetBrains/Toolbox/scripts" $path)

# =========== Environment Variables ===========
# Directory configurations
export DOTFILES_DIR=$HOME/dev/personal/dotfiles
export QMK_DIR=$HOME/qmk_firmware

# Oh-My-Zsh configuration
export ZSH=$HOME/.oh-my-zsh
export ZSH_CUSTOM=$ZSH/custom    # Custom themes and plugins directory
export ZSH_COMPDUMP=$ZSH/cache/.zcompdump

# XDG Base Directory specification
export XDG_CONFIG_HOME=$HOME/.config
export XDG_CACHE_HOME=$HOME/.cache
export XDG_DATA_HOME=$HOME/.local/share
export XDG_STATE_HOME=$HOME/.local/state

# Default applications
export EDITOR='nvim'
export VISUAL='nvim'
export PAGER='less'

# Load work-specific configurations
[[ -f $XDG_CONFIG_HOME/zsh/work.zsh ]] && source $XDG_CONFIG_HOME/zsh/work.zsh
