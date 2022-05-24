addToPath() {
    if [[ "$PATH" != *"$1"* ]]; then
        export PATH=$PATH:$1
    fi
}

commitDotfiles() {
    pushd $DOTFILES_DIR
    pushd work-dotfiles
    git add .
    git commit -m "[Automatically]: Update work-dotfiles."
    git push
    popd
    git add .
    git commit -m "[Automatically]: Update dotfiles."
    git push origin main
    popd
}

export QMK_DIR=$HOME/qmk_firmware
export STOW_PACKAGES="alacritty,git,nvim,tmux,tmuxinator,zsh,ideavim,gh"
export XDG_CONFIG_HOME=$HOME/.config
export DOTFILES_DIR=$HOME/dev/dotfiles
export ZSH=~/.oh-my-zsh
export GO111MODULE=on
export ANDROID_HOME=$HOME/android-sdk
export EDITOR='nvim'
