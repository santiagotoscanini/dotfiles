addToPath ~/Library/Python/3.8/bin  # Python
addToPath ~/.othersdk/flutter/bin   # Flutter
addToPath ~/.poetry/bin             # Poetry

# Android
addToPath $ANDROID_HOME/cmdline-tools/tools/bin/
addToPath $ANDROID_HOME/emulator/
addToPath $ANDROID_HOME/platform-tools/
addToPath $ANDROID_HOME/sdk/tools

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('~/miniconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "~/miniconda3/etc/profile.d/conda.sh" ]; then
        . "~/miniconda3/etc/profile.d/conda.sh"
    else
        addToPath $HOME/miniconda3/bin
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

