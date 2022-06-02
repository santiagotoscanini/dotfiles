source $ZDOTDIR/path.zsh
source $ZDOTDIR/aliases.zsh
source $ZDOTDIR/oh-my.zsh

. $(brew --prefix)/etc/profile.d/z.sh

if [[ "$TERM_PROGRAM" != "vscode" ]]; then
    source $ZDOTDIR/alacritty-theme.zsh
fi
