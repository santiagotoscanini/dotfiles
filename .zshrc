source ~/.alias

plugins=(git)

if [[ -n $SSH_CONNECTION ]]; then
    export EDITOR='vim'
else
    export EDITOR='nvim'
fi

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

source $ZSH/oh-my-zsh.sh
