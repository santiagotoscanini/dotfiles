### PATH
# Cargo (Rust)
export PATH="~/.cargo/bin:$PATH"
# JetBrains scripts
export PATH="~/Library/Application\ Support/JetBrains/Toolbox/scripts:$PATH"

# Try to load nix since sometimes nix PATH is not loaded for some devs
if ! which nix > /dev/null 2>&1 && [ -e '/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh' ]; then
    # shellcheck source=/dev/null
    . '/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh'
fi

# End Nix
### CONFIGS

# TODO: migrate to git submodules inside respective folders
export QMK_DIR=$HOME/qmk_firmware
export ZSH=$HOME/.oh-my-zsh

# TODO: migrate to .dotfiles
export DOTFILES_DIR=$HOME/dev/personal/dotfiles
export ZSH_COMPDUMP=$ZSH/cache/.zcompdump
export XDG_CONFIG_HOME=$HOME/.config
export EDITOR='nvim'

# Load work specific configs
source $XDG_CONFIG_HOME/zsh/work.zsh

## Unused
# export NOTES_DIR=$HOME/dev/personal/notes
# export GO111MODULE=on
# export JAVA_HOME="/opt/homebrew/Cellar/openjdk/19.0.2/libexec/openjdk.jdk/Contents/Home"
