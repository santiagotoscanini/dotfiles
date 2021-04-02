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
