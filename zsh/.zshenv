# This goes in `.zshenv` because it's called from a non-interactive process.
source $ZDOTDIR/alacritty-theme.zsh

addToPath() {
    if [[ "$PATH" != *"$1"* ]]; then
        export PATH=$PATH:$1
    fi
}

export STOW_FOLDERS="alacritty,git,nvim,tmux,tmuxinator,zsh"
export DOTENV_REPO=$HOME/dev/.tooling/dotfiles
export ZSH=~/.oh-my-zsh
export GO111MODULE=on
export ANDROID_HOME=$HOME/android-sdk
export EDITOR='nvim'
