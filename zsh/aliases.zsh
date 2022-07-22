# Only Relevant Configs for Current Company
source $ZDOTDIR/alias.work.zsh

# Toggle dark mode on macOS
alias osLights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"
alias termLights='_change_alacritty_theme'

# Commonly used directories
alias cdev="cd ~/dev"
alias cdevw="cd ~/dev/work"
alias cdevp="cd ~/dev/personal"
alias cdot="cd $DOTFILES_DIR"
alias cdxdg="cd $XDG_CONFIG_HOME"

# Network
alias internal_ip="ipconfig getifaddr en0" # WiFi
alias external_ip="curl -s icanhazip.com"

# Browser
function _search_on_google() {
    search="" # Clean up search string
    for term in "$@"; do
        search="$search%20$term"
    done
    open "http://www.google.com/search?q=$search"
}
function _search_google_clipboard() {
    _search_on_google $(pbpaste)
}
alias googlecp="_search_google_clipboard"

# Terminal
alias bclean="clear && printf '\e[3J'"

# neovim
alias vi="nvim"
alias vim="nvim"
alias cleanvim="nvim -u NONE"

# change dotfiles
alias chvim="nvim $XDG_CONFIG_HOME/nvim"
alias chzsh="nvim $XDG_CONFIG_HOME/zsh"
alias chgit="nvim $XDG_CONFIG_HOME/git/config"
alias chgh="nvim $XDG_CONFIG_HOME/gh/config.yml"
alias idot="idea $DOTFILES_DIR"

# QMK
function _compile_my_keymap(){
    current_keyboard=crkbd
    current_keymap=santi_km
    file_name="$current_keyboard"_rev1_"$current_keymap".hex

    qmk compile -kb $current_keyboard -km $current_keymap
    cp $QMK_DIR/$file_name $DOTFILES_DIR/qmk/$current_keymap/$file_name
}
alias qmkc='_compile_my_keymap'

# Docker
function _docker_build_and_push_image(){
    docker build . -t $1 && docker push $1
}
alias dkbp='_docker_build_and_push_image $1'        # Build and push image by a tag
alias dkbash='docker exec -it $1 /bin/bash'         # Run bash inside a container
alias dkstart="open --hide --background -a Docker"  # Only for macOS
