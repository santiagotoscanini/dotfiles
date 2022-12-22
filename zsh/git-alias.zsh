commitDotfiles() {
    pushd "$DOTFILES_DIR" || exit
        pushd work-dotfiles || exit
            git add .
            git commit -m "[Automatically]: Update work-dotfiles."
            git push
        popd || exit

        pushd smart-home-automations || exit
            git add .
            git commit -m "[Automatically]: Update smart-home-automations."
            git push
        popd || exit

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
