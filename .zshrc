# Load aliases
source ~/.alias




# Custom Reverse Search
_reverse_search() {
    # fc (fix command) lists the last commands
    # -l List the commands rather than invoking an editor on them.
    # -r Reverse the output list
    # and the 1 it's to start listing from first command (1st row)
    
    # Then we get the column with the commands (ignore the row number) and pass this to fzf that show a selector with arrows
    local selected_command=$(fc -rl 1 | awk '{$1="";print substr($0,2)}' | fzf)
    
    # LBUFFER put the command on the left of the buffer, so we end with the command in the terminal and the cursos at the end ;)
    LBUFFER=$selected_command
}
# (Zsh Line Editor) Create a new keymap
zle -N _reverse_search
# Bind the keymap to control + r
bindkey '^r' _reverse_search


# TODO: migrate to powerlevel10k
ZSH_THEME="powerlevel9k/powerlevel9k"
POWERLEVEL9K_MODE="nerdfont-complete"

POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(custom_gopher_icon dir vcs)

# To select an icon use https://char-map.herokuapp.com/
# To type UNICODE use ctrl + shift + U (Linux)
POWERLEVEL9K_CUSTOM_GOPHER_ICON="echo ﳑ"
# ANSI Colors
POWERLEVEL9K_CUSTOM_GOPHER_ICON_BACKGROUND=237
POWERLEVEL9K_CUSTOM_GOPHER_ICON_FOREGROUND=014

POWERLEVEL9K_SHORTEN_DIR_LENGTH=2
POWERLEVEL9K_SHORTEN_STRATEGY=truncate_folders
