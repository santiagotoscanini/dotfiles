# https://github.com/camspiers/tmuxinator-fzf-start
function _fzf_select_tmuxinator_project() {
    SELECTED_PROJECTS=$(tmuxinator list -n |
        tail -n +2
        fzf --prompt="Project: " -m -1 -q "$1")

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

# TODO(santiagotoscanini): this doesn't work
bindkey -ar "^P"
zle -N _fzf_select_tmuxinator_project
bindkey '^P' _fzf_select_tmuxinator_project
