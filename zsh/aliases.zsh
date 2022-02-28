# Only Relevant Configs for Current Company
source $ZDOTDIR/alias.work.zsh

# Toggle dark mode on macOS
alias lights="osascript -e 'tell app \"System Events\" to tell appearance preferences to set dark mode to not dark mode'"

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

# docker
function _docker_build_and_push_image(){
    docker build . -t $1 && docker push $1
}
alias dbp='_docker_build_and_push_image $1'                 # Build and push image by a tag
alias dbash='docker exec -it $1 /bin/bash'                  # Run bash inside a container
alias docker_start="open --hide --background -a Docker"     # Don't need this line if using Linux

# Commit dotfiles
commitDotfiles() {
    pushd $DOTFILES_DIR
        pushd work-dotfiles
        git add .
        git commit -m "[Automatically]: Update work-dotfiles."
        git push origin main
        popd
    git add .
    git commit -m "[Automatically]: Update dotfiles."
    git push origin main
    popd
}
alias cdf=commitDotfiles
