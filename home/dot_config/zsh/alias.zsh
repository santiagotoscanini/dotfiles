# ===========================================
# ZSH Aliases and Functions
# ===========================================

# =========== System Operations ===========
# Toggle dark mode on macOS
alias ,osLights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"

# Terminal operations
alias ,bclean="clear && printf '\e[3J'"  # Clear terminal and scrollback buffer
alias copy="pbcopy"                       # Quick access to clipboard

# =========== Navigation Shortcuts ===========
# Commonly used directories
alias ,cdev="cd $DEV_DIR"
alias ,cdevw="cd $DEV_DIR/work"
alias ,cdevp="cd $DEV_DIR/personal"
alias ,cdot="cd $DOTFILES_DIR"
alias ,cdxdg="cd $XDG_CONFIG_HOME"

# =========== Network Tools ===========
alias ,internal_ip="ipconfig getifaddr en0"  # Get local IP (WiFi interface)
alias ,external_ip="curl -s icanhazip.com"   # Get public IP address

# =========== Editor and Config Access ===========
# Neovim shortcuts
alias ,vi="nvim"
alias ,vim="nvim"
alias ,cleanvim="nvim -u NONE"  # Start Neovim without any configuration

# Edit configuration files
alias ,chvim="nvim $XDG_CONFIG_HOME/nvim"
alias ,chzsh="nvim $XDG_CONFIG_HOME/zsh"
alias ,chgit="nvim $XDG_CONFIG_HOME/git/config"
alias ,chgh="nvim $XDG_CONFIG_HOME/gh/config.yml"

# =========== Web Search ===========
# Search Google from terminal
function _search_on_google() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: _search_on_google <search terms>" >&2
    return 1
  fi
  
  local search=""
  for term in "$@"; do
    search="${search}%20${term}"
  done
  search="${search#%20}"  # Remove leading %20
  open "http://www.google.com/search?q=$search"
}

# Search Google with clipboard contents
function _search_google_clipboard() {
  local clipboard="$(pbpaste)"
  if [[ -z "$clipboard" ]]; then
    echo "Clipboard is empty" >&2
    return 1
  fi
  _search_on_google "$clipboard"
}
alias ,googlecp="_search_google_clipboard"

# =========== Node ===========
# Run Node.js REPL with a script file loaded
function _noderepl() {
  if [[ $# -eq 0 || ! -f "$1" ]]; then
    echo "Usage: _noderepl <file.js>" >&2
    return 1
  fi
  node -i -e "$(< "$1")"
}
alias ,noderepl='_noderepl'

# =========== Homebrew on a Mac with several accounts ===========
# Homebrew supports one owning account per install. In any other account,
# `brew` runs as that owner through sudo (asks for this account's password),
# so both accounts install into the same Homebrew. Commands that only read
# run directly. It runs from /, because the owner cannot read this home
# folder; so give `brew bundle` its file on stdin: brew bundle --file=- < Brewfile
if [[ -d /opt/homebrew && ! -O /opt/homebrew ]]; then
  function brew() {
    case "$1" in
      list|ls|info|search|deps|uses|leaves|desc|home|config|shellenv|--prefix|--version|"")
        command brew "$@" ;;
      *)
        (cd / && sudo -Hu "$(stat -f %Su /opt/homebrew)" \
          env HOMEBREW_DOTFILES_PROFILE="$HOMEBREW_DOTFILES_PROFILE" /opt/homebrew/bin/brew "$@") ;;
    esac
  }
fi

# =========== Dotfiles (chezmoi) ===========
# The repo in $DOTFILES_DIR is chezmoi's source; see its README.md.
# The ,d* shortcuts keep the letters the old `dots` CLI used.
alias cz="chezmoi"
alias ,dd="chezmoi diff"              # what apply would change
alias ,di="chezmoi apply"             # install: make $HOME match the repo
alias ,dc="chezmoi status"            # check: list drifted files and pending scripts
alias ,da="chezmoi add"               # add a file from $HOME to the repo
alias ,dr="chezmoi forget"            # remove a file from the repo, keep it in $HOME
alias ,de="chezmoi edit"              # edit the repo copy, apply on close
alias ,dl="chezmoi managed"           # list managed files
alias ,dt="chezmoi unmanaged ~/.config"  # untracked: config not in the repo yet
alias ,du="chezmoi update"            # pull the repo and apply
alias ,dra="chezmoi re-add"           # pull app-made changes back into the repo
