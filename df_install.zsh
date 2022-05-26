#!/usr/bin/env zsh

source zsh/.zshenv

pushd $DOTFILES_DIR
    echo --- PERSONAL DOTFILES ---

    for package in $(echo $STOW_PACKAGES | sed "s/,/ /g")
    do
        mkdir -p $XDG_CONFIG_HOME/$package
        echo ------ $package -------

        # First delete the packages.
        stow -D -t $XDG_CONFIG_HOME/$package $package
        echo 'Unstowed'

        # Then stow it again.
        stow -t $XDG_CONFIG_HOME/$package $package
        echo 'Stowed'
    done


    # SSH is not compatible with XDG Standard,
    # because many programs expect this file to be here.
    # https://wiki.archlinux.org/title/XDG_Base_Directory
    pushd ssh
        mkdir -p ~/.ssh
        echo ------ ssh ------

        stow -D -t ~/.ssh .
        echo 'Unstowed'

        stow -t ~/.ssh .
        echo 'Stowed'
    popd


    # QMK Files go inside QMK Firmware directory
    # These also aren't XDG Compatible :(
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
        echo
        echo --- WORK DOTFILES ------
        zsh install.zsh
    popd
popd
