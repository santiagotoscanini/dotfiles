source $ZDOTDIR/path.zsh
source $ZDOTDIR/aliases.zsh
source $ZDOTDIR/oh-my.zsh

if [[ "$TERM_PROGRAM" != "vscode" ]]; then
    source $ZDOTDIR/alacritty-theme.zsh
fi
