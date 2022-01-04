# go
export GO111MODULE=on

# Python
export PATH="$HOME/Library/Python/3.8/bin:$PATH"

# Flutter
export PATH=~/.othersdk/flutter/bin:$PATH

# Android
export ANDROID_HOME=$HOME/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/tools/bin/:$PATH
export PATH=$ANDROID_HOME/emulator/:$PATH
export PATH=$ANDROID_HOME/platform-tools/:$PATH
export PATH=$ANDROID_HOME/sdk/tools:$PATH

# Para brew y exa
export PATH="/usr/local/bin:$PATH"

export ZSH=~/.oh-my-zsh

# Vim
if [[ -n $SSH_CONNECTION ]]; then
    export EDITOR='vim'
else
    export EDITOR='nvim'
fi

# Poetry
export PATH="$HOME/.poetry/bin:$PATH"

# THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="/Users/stoscanini/.sdkman"
[[ -s "/Users/stoscanini/.sdkman/bin/sdkman-init.sh" ]] && source "/Users/stoscanini/.sdkman/bin/sdkman-init.sh"
