function _change_alacritty_theme() {
    sed -i '' "s/^colors:\ \*.*$/colors:\ \*$1/" $(realpath $XDG_CONFIG_HOME/alacritty/color.yml)
}

function autoSwitchAlacrittyTheme() {
    if defaults read -g AppleInterfaceStyle > /dev/null 2>&1 = 'dark' ; then
        _change_alacritty_theme tokyonight_night
    else
        _change_alacritty_theme material_lighter
    fi
}

function autoSwitchVimTheme() {
    for pid in $(pgrep vim); do
        kill -SIGUSR1 $pid
    done
}

function autoSwitchDesktopLights() {
    pushd "$DOTFILES_DIR"/smart-home-automations || exit
    if defaults read -g AppleInterfaceStyle > /dev/null 2>&1 = 'dark' ; then
        poetry run python3 main.py on
    else
        poetry run python3 "$DOTFILES_DIR"/smart-home-automations/main.py off
    fi
    popd || exit
}

# TODO(santiagotoscanini): add more tmux themes
#function autoSwitchTmuxTheme() {
#}

function autoSwitchEverything() {
    autoSwitchAlacrittyTheme
    autoSwitchVimTheme
    autoSwitchDesktopLights
}

# This is to check the color settings when loading the file from alacritty
# if [ "$TERM_PROGRAM" != "vscode" ] && [ "$TERMINAL_EMULATOR" != "JetBrains-JediTerm" ] && [ -z "$INTELLIJ_ENVIRONMENT_READER" ]; then
#     autoSwitchAlacrittyTheme
# fi
