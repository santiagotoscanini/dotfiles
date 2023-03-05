# We have to set the homebrew path here because macOS calls /etc/zprofile after .zshenv and this
# adds some system paths before homebrew's. More information on the README.md.
export PATH="/opt/homebrew/bin:$PATH"

source $ZDOTDIR/aliases.zsh
source $ZDOTDIR/oh-my.zsh
