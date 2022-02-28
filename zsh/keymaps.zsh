function _fzf_select_tmuxinator_project() {
    # Shamelessly stolen from https://github.com/camspiers/tmuxinator-fzf-start
    SELECTED_PROJECTS=$(
        tmuxinator list -n |
        tail -n +2 |
        fzf --prompt="Project: " -m -1 -q "$1"
    )

    if [ -n "$SELECTED_PROJECTS" ]; then
        # Iterate over \n delimited projects
        IFS=$'\n'

        # Start each project without attaching
        for PROJECT in $SELECTED_PROJECTS; do
            tmuxinator start "$PROJECT" --no-attach
        done

        # If inside tmux then select session to switch, otherwise just attach
        if [ -n "$TMUX" ]; then
            SESSION=$(tmux list-sessions -F "#S" | fzf --prompt="Session: ")
            if [ -n "$SESSION" ]; then
                tmux switch-client -t "$SESSION"
            fi
        else
            tmux attach-session
        fi
    fi
}
# FIXME(santiagotoscanini): this doesn't work

bindkey -ar "^P"
# zle (Zsh Line Editor) is the readkey engine for reading and processing the key events.
# With -N we create a new keymap
zle -N _fzf_select_tmuxinator_project
bindkey '^P' _fzf_select_tmuxinator_project


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
