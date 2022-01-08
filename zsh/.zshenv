# ----- ALACRITTY ----
# This goes in `.zshenv` because it's called from a non-interactive process.
function _change_alacritty_theme() {
    sed -i '' "s/^colors:\ \*.*$/colors:\ \*$1/" $(realpath ~/.config/alacritty/color.yml)
}
function _auto_switch_alacritty_theme() {
    if  defaults read -g AppleInterfaceStyle > /dev/null 2>&1 = 'dark' ; then
        _change_alacritty_theme one_half_dark
    else
        _change_alacritty_theme one_half_light
    fi
}


# ----- PATH ---------
addToPath() {
    if [[ "$PATH" != *"$1"* ]]; then
        export PATH=$PATH:$1
    fi
}


# ----- ENVIRONMENT --
export DOTENV_REPO=$HOME/dev/.tooling/dotfiles
export ZSH=~/.oh-my-zsh
export GO111MODULE=on
export ANDROID_HOME=$HOME/android-sdk
export EDITOR='nvim'
