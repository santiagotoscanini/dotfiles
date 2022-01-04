source ~/.alias

plugins=(
    tmux   # https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/tmux
    dotenv # https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/dotenv
)

# Automatically start tmux session (if doesn't exist one)
ZSH_TMUX_AUTOSTART=true

# brew install zsh-vi-mode
source $(brew --prefix)/opt/zsh-vi-mode/share/zsh-vi-mode/zsh-vi-mode.plugin.zsh

# git clone https://github.com/reobin/typewritten.git $ZSH_CUSTOM/themes/typewritten
ZSH_THEME="typewritten/typewritten"

source $ZSH/oh-my-zsh.sh
bindkey -ar "^P"
# this goes after sourcing oh-my-zsh to avoiding overriding ^P keymap
# https://github.com/camspiers/tmuxinator-fzf-start
function _fzf_select_tmuxinator_project() {
    SELECTED_PROJECTS=$(tmuxinator list -n |
        tail -n +2 
        fzf --prompt="Project: " -m -1 -q "$1")

    if [ -n "$SELECTED_PROJECTS" ]; then
        # Set the IFS to \n to iterate over \n delimited projects
        IFS=$'\n'

        # Start each project without attaching
        for PROJECT in $SELECTED_PROJECTS; do
            tmuxinator start "$PROJECT" --no-attach # force disable attaching
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
zle -N _fzf_select_tmuxinator_project
# TODO(santiagotoscanini): this doesn't work
bindkey '^P' _fzf_select_tmuxinator_project

# Conda
__conda_setup="$('/Users/stoscanini/miniconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/stoscanini/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/stoscanini/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/Users/stoscanini/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
