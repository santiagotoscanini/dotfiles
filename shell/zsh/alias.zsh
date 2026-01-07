# ===========================================
# ZSH Aliases and Functions
# ===========================================

# =========== System Operations ===========
# Toggle dark mode on macOS
alias ,osLights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"

# Smart home controls
alias ,deskOff="pushd $DOTFILES_DIR/smart-home-automations && poetry run python3 main.py off && popd"
alias ,deskOn="pushd $DOTFILES_DIR/smart-home-automations && poetry run python3 main.py on && popd"

# Export macOS settings
alias ,exportMacos="defaults domains | tr \", \" \"\n\" | sed -r '/^\s*$/d' | xargs -I_ defaults export _ \"$DOTFILES_DIR/macos/backup/_.plist\""

# Terminal operations
alias ,bclean="clear && printf '\e[3J'"  # Clear terminal and scrollback buffer
alias copy="pbcopy"                       # Quick access to clipboard
alias notify="afplay /System/Library/Sounds/Glass.aiff"  # Used to notify when a command completes

# =========== Navigation Shortcuts ===========
# Commonly used directories
alias ,cdev="cd ~/dev"
alias ,cdevw="cd ~/dev/work"
alias ,cdevp="cd ~/dev/personal"
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
# Current keyboard configuration
current_keyboard=crkbd
current_keymap=santi_km

# Compile QMK keymap and save a copy
function _compile_my_keymap() {
  local file_name="${current_keyboard}_rev1_${current_keymap}.hex"
  local target_dir="$DOTFILES_DIR/qmk/$current_keymap"
  
  echo "Compiling $current_keyboard with keymap $current_keymap..."
  if ! qmk compile -kb "$current_keyboard" -km "$current_keymap"; then
    echo "Failed to compile keymap" >&2
    return 1
  fi
  
  # Ensure target directory exists
  mkdir -p "$target_dir"
  
  # Copy compiled firmware
  if [[ -f "$QMK_DIR/$file_name" ]]; then
    cp "$QMK_DIR/$file_name" "$target_dir/$file_name"
    echo "Firmware copied to $target_dir/$file_name"
  else
    echo "Compiled firmware not found at expected location" >&2
    return 1
  fi
}
alias ,qmkc='_compile_my_keymap'

# Flash QMK keymap to keyboard
function _flash_my_keymap() {
  echo "Flashing $current_keyboard with keymap $current_keymap..."
  qmk flash -kb "$current_keyboard" -km "$current_keymap"
}
alias ,qmkf='_flash_my_keymap'

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

# =========== Santree (Git Worktree Manager) ===========
# Wrapper function to handle directory switching
function santree() {
    local santree_dir="$DOTFILES_DIR/santree"

    # Only create/switch need output capture for cd
    if [[ "$1" == "create" || "$1" == "switch" || "$1" == "sw" ]]; then
        local output
        output=$(node "$santree_dir/dist/cli.js" "$@" 2>&1)
        local exit_code=$?

        # Check if output contains a path to cd into
        if [[ "$output" == *SANTREE_CD:* ]]; then
            # Print UI output (filter out SANTREE_CD/SANTREE_WORK lines)
            echo "$output" | grep -v "SANTREE_CD:" | grep -v "SANTREE_WORK:"

            # Extract target dir - strip ANSI codes and get path after SANTREE_CD:
            local target_dir=$(echo "$output" | sed 's/\x1b\[[0-9;]*m//g' | grep "SANTREE_CD:" | sed 's/.*SANTREE_CD://')
            if [[ -n "$target_dir" && -d "$target_dir" ]]; then
                cd "$target_dir" && echo "Switched to: $target_dir"
            fi

            # Launch Claude if --work flag was used
            if [[ "$output" == *SANTREE_WORK:* ]]; then
                local work_mode=$(echo "$output" | sed 's/\x1b\[[0-9;]*m//g' | grep "SANTREE_WORK:" | sed 's/.*SANTREE_WORK://')
                [[ "$work_mode" == "plan" ]] && santree work --plan || santree work
            fi
        else
            echo "$output"
        fi
        return $exit_code
    fi

    # All other commands run directly
    node "$santree_dir/dist/cli.js" "$@"
}

# Aliases for quick access
alias st="santree"
alias ,st="santree"
alias ,stc="santree create"
alias ,stl="santree list"
alias ,str="santree remove"
alias ,sts="santree switch"
alias ,sty="santree sync"
alias ,stw="santree work"
alias ,stf="santree work --fix-pr"

# Completions are loaded from shell/zsh/completions/_santree via fpath

# =========== Temporary Aliases ===========
# Docker build and run with SYS_ADMIN capability
alias mydocker='docker build -t mydocker . && docker run --cap-add="SYS_ADMIN" mydocker'

# Claude CLI - use local installation if available, otherwise fall back to ~/.local/bin
if [[ -x "$HOME/.claude/local/claude" ]]; then
    alias claude="$HOME/.claude/local/claude"
elif [[ -x "$HOME/.local/bin/claude" ]]; then
    alias claude="$HOME/.local/bin/claude"
fi
