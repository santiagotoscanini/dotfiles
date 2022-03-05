# Only Relevant Configs for Current Company
source $ZDOTDIR/alias.work.zsh

# Toggle dark mode on macOS
alias osLights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"
alias termLights='_change_alacritty_theme'

# Commonly used directories
alias cdev="cd ~/dev"
alias cdp="cd ~/dev/python"
alias cdg="cd ~/dev/go"
alias cdot="cd $DOTFILES_DIR"

# neovim
if [ -n "$NVIM_LISTEN_ADDRESS" ] ; then
    alias nvim="nvr --remote-tab"
fi
alias vi="nvim"
alias vim="nvim"
alias chvim="nvim $XDG_CONFIG_HOME/nvim/init.lua"

# Docker
function _docker_build_and_push_image(){
    docker build . -t $1 && docker push $1
}
alias dbp='_docker_build_and_push_image $1'                 # Build and push image by a tag
alias dbash='docker exec -it $1 /bin/bash'                  # Run bash inside a container
alias docker_start="open --hide --background -a Docker"     # Don't need this line if using Linux
