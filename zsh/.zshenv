addToPath() {
    # only add in case it isn't already added
    if [[ "$PATH" != *"$1"* ]]; then
        export PATH=$1:$PATH
    fi
}
source $ZDOTDIR/path.zsh

export QMK_DIR=$HOME/qmk_firmware
export STOW_PACKAGES="alacritty,git,nvim,tmux,tmuxinator,zsh,ideavim,gh"
export XDG_CONFIG_HOME=$HOME/.config
export DOTFILES_DIR=$HOME/dev/personal/dotfiles
export NOTES_DIR=$HOME/dev/personal/notes
export ZSH=~/.oh-my-zsh
export GO111MODULE=on
export EDITOR='nvim'
export JAVA_HOME="/opt/homebrew/Cellar/openjdk/19.0.2/libexec/openjdk.jdk/Contents/Home"
