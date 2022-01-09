# ----- THEME ---------------

# Minimal zsh prompt
# It's a custom plugin so it needs to be installed in $ZSH_CUSTOM/themes
# https://github.com/reobin/typewritten.git
ZSH_THEME="typewritten/typewritten"


# ----- PLUGINS -------------

# -------------- TMUX -------

# Aliases and utitlies for tmux.
# https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/tmux
plugins+=(tmux)

ZSH_TMUX_AUTOSTART=true                         # Automatically start tmux session (if doesn't exist one).
ZSH_TMUX_AUTOSTART_ONCE=true                    # Only if tmux hasn't been started previously.
ZSH_TMUX_AUTOQUIT=true                          # Automatically closes terminal once tmux exits.
ZSH_TMUX_CONFIG=$XDG_CONFIG_HOME/tmux/tmux.conf # Source a different tmux config

# -------------- DOTENV -----

# Automatically load your project ENV variables from .env file when you cd into project root directory.
# https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/dotenv
plugins+=(dotenv)

ZSH_DOTENV_FILE=.env         # File to detect.
ZSH_DOTENV_PROMPT=true       # Ask for confirmation.
# ZSH_DOTENV_ALLOWED_LIST=/path/to/dotenv/allowed/list
# ZSH_DOTENV_DISALLOWED_LIST=/path/to/dotenv/disallowed/list

# -------------- VI MODE ----

# Vi mode for ZSH
# It's a custom plugin so it needs to be installed in $ZSH_CUSTOM/plugins
# https://github.com/jeffreytse/zsh-vi-mode
plugins+=(zsh-vi-mode)

ZVM_VI_INSERT_ESCAPE_BINDKEY=jj
ZVM_KEYTIMEOUT=0.4
ZVM_LINE_INIT_MODE=$ZVM_MODE_INSERT
ZVM_VI_EDITOR=$EDITOR


# ----- SOURCE OH MY ZSH ----
source $ZSH/oh-my-zsh.sh
