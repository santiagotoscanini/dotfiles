# ===========================================
# Git dotfiles commit helper function
# Used by the 'git dotfiles' alias
# ===========================================

# Commit and push all changes in the dotfiles repository
# This function:
# 1. Updates all submodules recursively
# 2. Adds all changes in the repository
# 3. Commits with an automatic message
# 4. Pushes to the main branch
commitDotfiles() {
    # Save current directory to return later
    local current_dir="$(pwd)"
    
    # Check if DOTFILES_DIR is set
    if [[ -z "$DOTFILES_DIR" ]]; then
        echo "Error: DOTFILES_DIR environment variable is not set" >&2
        return 1
    fi
    
    # Check if dotfiles directory exists
    if [[ ! -d "$DOTFILES_DIR" ]]; then
        echo "Error: Dotfiles directory not found at $DOTFILES_DIR" >&2
        return 1
    fi
    
    echo "Updating dotfiles repository..."
    cd "$DOTFILES_DIR" || {
        echo "Error: Failed to change to dotfiles directory" >&2
        return 1
    }
    
    # Update all submodules
    echo "Updating submodules..."
    git submodule foreach --recursive git pull origin main
    
    # Add all changes
    echo "Adding changes..."
    git add .
    
    # Check if there are changes to commit
    if git diff-index --quiet HEAD --; then
        echo "No changes to commit"
    else
        # Commit with timestamp
        echo "Committing changes..."
        git commit -m "[Automatically]: Update dotfiles on $(date '+%Y-%m-%d %H:%M:%S')"
        
        # Push changes
        echo "Pushing changes..."
        git push origin main
    fi
    
    # Return to original directory
    cd "$current_dir" || echo "Warning: Could not return to original directory"
    
    echo "Dotfiles update complete!"
}
