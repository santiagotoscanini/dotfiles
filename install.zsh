pushd $DOTENV_REPO          # Move to the `dotenv` repo

for folder in $(echo $STOW_FOLDERS | sed "s/,/ /g")
do
    stow -D $folder         # First delete the packages.
    stow $folder            # Then stow it again.
done

work-dotfiles/install.zsh # install work-dotfiles

popd                        # Move back to where we were
