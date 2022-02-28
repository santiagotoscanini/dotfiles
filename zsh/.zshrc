source $ZDOTDIR/alacritty-theme.zsh
source $ZDOTDIR/path.zsh
source $ZDOTDIR/aliases.zsh
source $ZDOTDIR/oh-my.zsh
source $ZDOTDIR/keymaps.zsh

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
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/Users/stoscanini/miniconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/stoscanini/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/stoscanini/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/Users/stoscanini/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
