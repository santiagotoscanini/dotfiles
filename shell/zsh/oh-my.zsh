# ===========================================
# Oh-My-Zsh Configuration
# ===========================================

# Disable URL-quote-magic and bracketed-paste-magic helpers (rarely missed in
# practice; they auto-escape special chars when pasting URLs into the prompt).
DISABLE_MAGIC_FUNCTIONS=true

# =========== Theme Configuration ===========
# Powerlevel10k — chosen for its Instant Prompt feature, which makes the shell
# feel responsive immediately even while init is still running in the
# background. Sourcing the theme itself takes ~1s (similar to typewritten) but
# the perceived latency drops to <100ms because Instant Prompt paints first.
# Configure interactively with `p10k configure`; settings live in ~/.p10k.zsh.
# Installation: git clone --depth=1 https://github.com/romkatv/powerlevel10k $ZSH_CUSTOM/themes/powerlevel10k
if [[ -d "$ZSH_CUSTOM/themes/powerlevel10k" ]]; then
  ZSH_THEME="powerlevel10k/powerlevel10k"
else
  echo "Warning: powerlevel10k theme not found. Install with: git clone --depth=1 https://github.com/romkatv/powerlevel10k $ZSH_CUSTOM/themes/powerlevel10k" >&2
  ZSH_THEME="robbyrussell"
fi

# =========== Plugin Configuration ===========
# Initialize plugins array
plugins=()

# -------------- History Substring Search -------
# Search history for a substring
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/history-substring-search
plugins+=(history-substring-search)

# Up/down arrow keys to search history based on current command
bindkey "^[[A" history-beginning-search-backward
bindkey "^[[B" history-beginning-search-forward

# -------------- TMUX -------
# Only start tmux automatically in standalone terminals, not in IDEs
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/tmux
if [[ "$TERM_PROGRAM" != "zed" &&
      "$TERM_PROGRAM" != "vscode" &&
      "$TERMINAL_EMULATOR" != "JetBrains-JediTerm" &&
      -z "$CONDUCTOR_WORKSPACE_NAME" &&
      -z "$INTELLIJ_ENVIRONMENT_READER" ]]; then

  # plugins+=(tmux)  # disabled to speed up shell startup

  ZSH_TMUX_AUTOSTART=false                        # Automatically start tmux session
  ZSH_TMUX_AUTOSTART_ONCE=true                    # Only if tmux hasn't been started previously
  ZSH_TMUX_AUTOQUIT=true                          # Automatically closes terminal once tmux exits
  ZSH_TMUX_CONFIG=$XDG_CONFIG_HOME/tmux/tmux.conf # Use custom tmux config
fi

# -------------- Development Tools -------
# Loads the asdf version manager plugin
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/asdf
plugins+=(asdf)

# Development tool completions and integrations
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/poetry
# plugins+=(poetry)  # disabled to speed up shell startup
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/golang
# plugins+=(golang)  # Go completions and environment management

# CLI tools and completions
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/gh
# plugins+=(gh)      # disabled to speed up shell startup
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/docker
# plugins+=(docker)  # disabled to speed up shell startup
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/aws
# plugins+=(aws)     # disabled to speed up shell startup
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/brew
# plugins+=(brew)    # disabled to speed up shell startup

# -------------- System Enhancements -------
# Suggestion system for command typos
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/command-not-found
# Note: Can be slow, hence commented out
# plugins+=(command-not-found)

# -------------- thefuck ----
# Loads thefuck and add the <esc>-<esc> key binding.
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/thefuck
plugins+=(thefuck)

# Common aliases for frequently used commands
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/common-aliases
# plugins+=(common-aliases)  # disabled to speed up shell startup

# Directory navigation
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/z
plugins+=(z)       # Jump to frequently used directories
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/fzf
# plugins+=(fzf)     # disabled to speed up shell startup

# -------------- Environment Management -------
# Auto-load environment variables from .env files
# Docs: https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/dotenv
plugins+=(dotenv)

ZSH_DOTENV_FILE=.env          # File to detect
ZSH_DOTENV_PROMPT=false       # Don't prompt before loading .env

# -------------- Vi Mode -------
# Custom plugin for Vi mode in ZSH
# Docs: https://github.com/jeffreytse/zsh-vi-mode#readme
# Installation: git clone https://github.com/jeffreytse/zsh-vi-mode $ZSH_CUSTOM/plugins/zsh-vi-mode
if [[ -d "$ZSH_CUSTOM/plugins/zsh-vi-mode" ]]; then
  plugins+=(zsh-vi-mode)

  # Vi mode configuration
  ZVM_VI_INSERT_ESCAPE_BINDKEY=jj  # Use 'jj' to escape insert mode
  ZVM_KEYTIMEOUT=0.4                # Timeout for key sequences
  ZVM_LINE_INIT_MODE=$ZVM_MODE_INSERT  # Start in insert mode
  ZVM_VI_EDITOR=$EDITOR             # Use $EDITOR for editing
else
  echo "Warning: zsh-vi-mode plugin not found. Install with: git clone https://github.com/jeffreytse/zsh-vi-mode $ZSH_CUSTOM/plugins/zsh-vi-mode" >&2
fi

# =========== Load Oh-My-Zsh Framework ===========
# Source Oh-My-Zsh
if [[ -f "$ZSH/oh-my-zsh.sh" ]]; then
  source "$ZSH/oh-my-zsh.sh"
else
  echo "Error: Oh-My-Zsh not found at $ZSH. Please install it first." >&2
fi
