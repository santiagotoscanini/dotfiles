if [[ ! -v DOTFILES_DIR || ! -v STOW_FOLDERS || ! -v XDG_CONFIG_HOME ]]; then
    export DOTFILES_DIR=$HOME/dev/.tooling/dotfiles
    source $DOTFILES_DIR/zsh/.zshenv
fi

pushd $DOTFILES_DIR

for folder in $(echo $STOW_FOLDERS | sed "s/,/ /g")
do
    mkdir -p $XDG_CONFIG_HOME/$folder
    stow -D $folder         		     # First delete the packages.
    stow -t $XDG_CONFIG_HOME/$folder $folder # Then stow it again.

    echo $folder 'stowed'
done

pushd work-dotfiles
zsh install.zsh
popd

popd
