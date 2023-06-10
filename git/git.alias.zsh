commitDotfiles() {
    pushd "$DOTFILES_DIR" || exit
        git add .
        git commit -m "[Automatically]: Update dotfiles."
        git push origin main
    popd || exit
}

commitNotes() {
    pushd "$NOTES_DIR" || exit
        git add .
        git commit -m "[Automatically]: Vault backup from $HOSTNAME (CLI)"
        git push
    popd || exit
}
