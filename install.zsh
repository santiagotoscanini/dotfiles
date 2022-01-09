if [[ ! -v DOTFILES_DIR || ! -v STOW_FOLDERS || ! -v XDG_CONFIG_HOME ]]; then
    export DOTFILES_DIR=$HOME/dev/.tooling/dotfiles
    source $DOTFILES_DIR/zsh/.zshenv
fi

pushd $DOTFILES_DIR

echo --- PERSONAL DOTFILES ---

for package in $(echo $STOW_PACKAGES | sed "s/,/ /g")
do
    mkdir -p $XDG_CONFIG_HOME/$package
    echo ------ $package -------

    stow -D -t $XDG_CONFIG_HOME/$package $package # First delete the packages.
    echo 'Unstowed'

    stow -t $XDG_CONFIG_HOME/$package $package    # Then stow it again.
    echo 'Stowed'
done

pushd work-dotfiles
echo --- WORK DOTFILES ------
zsh install.zsh
popd

popd
