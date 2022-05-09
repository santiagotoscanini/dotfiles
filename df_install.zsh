#!/usr/bin/env zsh

source zsh/.zshenv

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

# QMK Files go inside QMK Firmware directory, not XDG Compatible
pushd qmk
    keymap_root=keyboards/crkbd/keymaps/santi_km

    mkdir -p $QMK_DIR/$keymap_root
    echo ------ qmk ------

    stow -D -t $QMK_DIR/$keymap_root santi_km
    echo 'Unstowed'

    stow -t $QMK_DIR/$keymap_root santi_km
    echo 'Stowed'
popd


pushd work-dotfiles
echo
echo --- WORK DOTFILES ------
zsh install.zsh
popd

popd
