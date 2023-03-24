# Only Relevant Configs for Current Company
source "$ZDOTDIR/alias.work.zsh"

# Toggle dark mode on macOS
alias ,osLights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"
alias ,deskOff="pushd $DOTFILES_DIR/smart-home-automations && poetry run python3 main.py off && popd"
alias ,deskOn="pushd $DOTFILES_DIR/smart-home-automations && poetry run python3 main.py on && popd"

# Commonly used directories
alias ,cdev="cd ~/dev"
alias ,cdevw="cd ~/dev/work"
alias ,cdevp="cd ~/dev/personal"
alias ,cdot="cd $DOTFILES_DIR"
alias ,cdxdg="cd $XDG_CONFIG_HOME"
alias ,cdnotes="cd ~/dev/personal/notes"

# Network
alias ,internal_ip="ipconfig getifaddr en0" # WiFi
alias ,external_ip="curl -s icanhazip.com"

# Browser
function _search_on_google() {
    search="" # Clean up search string
    for term in "$@"; do
        search="$search%20$term"
    done
    open "http://www.google.com/search?q=$search"
}
function _search_google_clipboard() {
    _search_on_google "$(pbpaste)"
}
alias ,googlecp="_search_google_clipboard"

# Terminal
alias ,bclean="clear && printf '\e[3J'"

# neovim
alias ,vi="nvim"
alias ,vim="nvim"
alias ,cleanvim="nvim -u NONE"

# change dotfiles
alias ,chvim="nvim $XDG_CONFIG_HOME/nvim"
alias ,chzsh="nvim $XDG_CONFIG_HOME/zsh"
alias ,chgit="nvim $XDG_CONFIG_HOME/git/config"
alias ,chgh="nvim $XDG_CONFIG_HOME/gh/config.yml"
alias ,idot="idea $DOTFILES_DIR"

################# QMK ######################
current_keyboard=crkbd
current_keymap=santi_km
function _compile_my_keymap(){
    file_name="$current_keyboard"_rev1_"$current_keymap".hex

    qmk compile -kb $current_keyboard -km $current_keymap
    cp "$QMK_DIR/$file_name" "$DOTFILES_DIR/qmk/$current_keymap/$file_name"
}
alias ,qmkc='_compile_my_keymap'

function _flash_my_keymap(){
    qmk flash -kb $current_keyboard -km $current_keymap
}
alias ,qmkf='_flash_my_keymap'
####################################################


################# Docker ######################
function _docker_build_and_push_image(){
    docker build . -t "$1" && docker push "$1"
}

# Build and push image by a tag
# shellcheck disable=SC2142
alias ,dkbp='_docker_build_and_push_image $1'

# Run bash inside a container
# shellcheck disable=SC2142
alias ,dkbash='docker exec -it $1 /bin/bash'

# Only for macOS
alias ,dkstart="open --hide --background -a Docker"
####################################################


################# Investments ######################
function _update_notion_investments(){
    pushd ~/dev/personal/tda-grid-trading || exit
    poetry run python3 main.py
    popd || exit
}
alias ,notionInvestments='_update_notion_investments'
####################################################


################### Node.js ########################
function _noderepl(){
    node -i -e "$(< $1)"
}
alias ,noderepl='_noderepl'
####################################################
