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

commitNotes() {
    pushd $NOTES_DIR
        git add .
        git commit -m "[Automatically]: Vault backup from $HOSTNAME (CLI)"
        git push
    popd
}
