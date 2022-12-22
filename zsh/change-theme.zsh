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

function autoSwitchTmuxTheme() {
    # todo
}

function autoSwitchDesktopLights() {
    # todo
}

function autoSwitchEverything() {
    autoSwitchAllacrittyTheme
    autoSwitchVimTheme
    autoSwitchTmuxTheme
    autoSwitchDesktopLights
}

# This is to check the color settings when loading the file from alacritty
# if [ "$TERM_PROGRAM" != "vscode" ] && [ "$TERMINAL_EMULATOR" != "JetBrains-JediTerm" ] && [ -z "$INTELLIJ_ENVIRONMENT_READER" ]; then
#     autoSwitchAlacrittyTheme
# fi
