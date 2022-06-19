commitDotfiles() {
    pushd $DOTFILES_DIR
        pushd work-dotfiles
            git add .
            git commit -m "[Automatically]: Update work-dotfiles."
            git push
        popd
        git add .
        git commit -m "[Automatically]: Update dotfiles."
        git push origin main
    popd
}

