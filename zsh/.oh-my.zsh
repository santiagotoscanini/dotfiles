ZSH_THEME="typewritten/typewritten" # https://github.com/reobin/typewritten.git

plugins=(
    # Aliases and utitlies for tmux.
    # https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/tmux
    tmux

    # Automatically load your project ENV variables from .env file when you cd into project root directory.
    # https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/dotenv
    dotenv
)

ZSH_TMUX_AUTOSTART=true      # Automatically start tmux session (if doesn't exist one).
ZSH_TMUX_AUTOSTART_ONCE=true # Only if tmux hasn't been started previously.
ZSH_TMUX_AUTOQUIT=true       # Automatically closes terminal once tmux exits.

ZSH_DOTENV_FILE=.env         # File to detect.
ZSH_DOTENV_PROMPT=true       # Ask for confirmation.
# ZSH_DOTENV_ALLOWED_LIST=/path/to/dotenv/allowed/list
# ZSH_DOTENV_DISALLOWED_LIST=/path/to/dotenv/disallowed/list

source $ZSH/oh-my-zsh.sh
