commitDotfiles() {
    pushd $DOTFILES_DIR
    cd work-dotfiles
    git add .
    git commit -m "[Automatically]: Update work-dotfiles."
    git push origin main
    cd ..
    git add .
    git commit -m "[Automatically]: Update public dotfiles."
    git push origin main
    popd
}
