# FIXME(santiagotoscanini): This is a hack because homebrew is being added at the end of the path
#   I have to find where is being added and remove it.
export PATH="/opt/homebrew/bin:$PATH"

source $ZDOTDIR/aliases.zsh
source $ZDOTDIR/oh-my.zsh
