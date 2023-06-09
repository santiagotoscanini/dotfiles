# We have to set the homebrew path here because macOS calls /etc/zprofile after .zshenv and this
# adds some system paths before homebrew's. More information on the README.md.
export PATH="/opt/homebrew/bin:$PATH"

source $ZDOTDIR/alias.zsh
source $ZDOTDIR/oh-my.zsh

# The work file can exist or not, so we don't want to see errors if they don't exist
source $ZDOTFIR/work.zsh 2> /dev/null || true
