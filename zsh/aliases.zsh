# Only Relevant Configs for Current Company
source $ZDOTDIR/alias.work.zsh

# change directory
alias cdev="cd ~/dev"
alias cdp="cd ~/dev/python"
alias cdg="cd ~/dev/go"

# vim
alias vi="nvim"
alias vim="nvim"
alias chvim="nvim ~/.config/nvim/lua.vim"

# docker
function _docker_build_and_push_image(){
    docker build . -t $1 && docker push $1
}
alias dbp='_docker_build_and_push_image $1'                 # Build and push image by a tag
alias dbash='docker exec -it $1 /bin/bash'                  # Run bash inside a container
alias docker_start="open --hide --background -a Docker"     # Don't need this line if using Linux

# tmuxinator
alias txn='tmuxinator new'                                  # Create a new project
alias txcp='tmuxinator copy'                                # Copy a project (old, new)
alias txs="tmuxinator stop $(tmux display-message -p '#S')" # Close current project

commitDotfiles() {
    pushd $DOTFILES_DIR
    pushd work-dotfiles
    echo 'jaja' $(pwd)
    git add .
    git commit -m "[Automatically]: Update work-dotfiles."
    git push origin master
    echo 'pushed'
    popd
    git add .
    git commit -m "[Automatically]: Update public dotfiles."
    git push origin master
    popd
}
