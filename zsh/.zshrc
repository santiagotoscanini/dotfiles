plugins=(tmux dotenv)

ZSH_TMUX_AUTOSTART=true

source $(brew --prefix)/opt/zsh-vi-mode/share/zsh-vi-mode/zsh-vi-mode.plugin.zsh # brew install zsh-vi-mode

ZSH_THEME="typewritten/typewritten" # git clone https://github.com/reobin/typewritten.git $ZSH_CUSTOM/themes/typewritten

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

source ~/.alias
source $ZSH/oh-my-zsh.sh
