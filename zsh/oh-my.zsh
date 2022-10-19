# ----- THEME ---------------

# Minimal zsh prompt
# It's a custom plugin so it needs to be installed with:
# git clone https://github.com/reobin/typewritten $ZSH_CUSTOM/themes/typewritten
ZSH_THEME="typewritten/typewritten"
# In case we want to customize the output https://typewritten.dev/#/prompt_customization?id=use-a-custom-function
TYPEWRITTEN_LEFT_PROMPT_PREFIX_FUNCTION=(date +%H:%M:%S)


# ----- PLUGINS -------------

# -------------- history-substring-search -------
# Search history for a substring
plugins+=(history-substring-search)

bindkey "^[[A" history-beginning-search-backward
bindkey "^[[B" history-beginning-search-forward

# -------------- TMUX -------
# Aliases and utilities for tmux.
# https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/tmux

# Avoid auto-starting tmux in IDEs
if [ "$TERM_PROGRAM" != "vscode" ] && [ "$TERMINAL_EMULATOR" != "JetBrains-JediTerm" ] && [ -z "$INTELLIJ_ENVIRONMENT_READER" ]; then
    plugins+=(tmux)

    ZSH_TMUX_AUTOSTART=true                         # Automatically start tmux session (if doesn't exist one).
    ZSH_TMUX_AUTOSTART_ONCE=true                    # Only if tmux hasn't been started previously.
    ZSH_TMUX_AUTOQUIT=true                          # Automatically closes terminal once tmux exits.
    ZSH_TMUX_CONFIG=$XDG_CONFIG_HOME/tmux/tmux.conf # Source a different tmux config
fi

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
# It's a custom plugin so it needs to be installed with:
# git clone https://github.com/jeffreytse/zsh-vi-mode $ZSH_CUSTOM/plugins/zsh-vi-mode
plugins+=(zsh-vi-mode)

ZVM_VI_INSERT_ESCAPE_BINDKEY=jj
ZVM_KEYTIMEOUT=0.4
ZVM_LINE_INIT_MODE=$ZVM_MODE_INSERT
ZVM_VI_EDITOR=$EDITOR


# ----- SOURCE OH MY ZSH ----
source $ZSH/oh-my-zsh.sh
