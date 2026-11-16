# ===========================================
# ZSH Aliases and Functions
# ===========================================

# =========== System Operations ===========
# Toggle dark mode on macOS
alias ,osLights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"

# Terminal operations
alias ,bclean="clear && printf '\e[3J'"  # Clear terminal and scrollback buffer
alias copy="pbcopy"                       # Quick access to clipboard
alias notify="afplay /System/Library/Sounds/Glass.aiff"  # Used to notify when a command completes

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
alias ,idot="idea $DOTFILES_DIR"

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

# =========== QMK Keyboard Tools ===========
# $DOTFILES_DIR/qmk is a QMK External Userspace: qmk builds the keymap from
# there and writes the firmware next to it. Setup steps: qmk/README.md.
alias ,qmkc="qmk compile -kb crkbd -km santi_km"   # compile
alias ,qmkf="qmk flash -kb crkbd -km santi_km"     # compile and flash

# =========== Docker Tools ===========
# Run bash inside a container
function docker_bash() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: docker_bash <container_id>" >&2
    return 1
  fi
  docker exec -it "$1" /bin/bash
}
alias ,dkbash='docker_bash'

# =========== Node.js Tools ===========
# Run Node.js REPL with a script file loaded
function _noderepl() {
  if [[ $# -eq 0 || ! -f "$1" ]]; then
    echo "Usage: _noderepl <file.js>" >&2
    return 1
  fi
  node -i -e "$(< "$1")"
}
alias ,noderepl='_noderepl'

# =========== AWS Tools ===========
# Convert HTTP URL to S3 URL format
function url_to_s3() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: url_to_s3 <url>" >&2
    return 1
  fi
  
  local url="$1"
  local s3_url="s3://"

  # Remove the protocol prefix
  url="${url#*://}"

  # Extract the bucket name
  local bucket_name="${url%%.s3.amazonaws.com*}"

  # Remove the bucket name and the s3 domain part
  url="${url#*.s3.amazonaws.com/}"

  # Combine the S3 URL prefix with the bucket name and the remaining path
  s3_url="${s3_url}${bucket_name}/${url}"

  echo "$s3_url"
}

# Download file from S3 using converted URL
function download_s3_file() {
  if [[ $# -lt 2 ]]; then
    echo "Usage: download_s3_file <url> <output_file>" >&2
    return 1
  fi
  
  local url="$1"
  local output_file="$2"

  # Convert the URL to an S3 URL
  local s3_url=$(url_to_s3 "$url")
  
  # Check if conversion was successful
  if [[ -z "$s3_url" ]]; then
    echo "Failed to convert URL to S3 format" >&2
    return 1
  fi

  # Download the file using the AWS CLI
  aws s3 cp "$s3_url" "$output_file"
}

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

# =========== Temporary Aliases ===========
# Docker build and run with SYS_ADMIN capability
alias mydocker='docker build -t mydocker . && docker run --cap-add="SYS_ADMIN" mydocker'

