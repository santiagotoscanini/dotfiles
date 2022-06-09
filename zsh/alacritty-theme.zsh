function _change_alacritty_theme() {
    sed -i '' "s/^colors:\ \*.*$/colors:\ \*$1/" $(realpath $XDG_CONFIG_HOME/alacritty/color.yml)
}

function autoSwitchAlacrittyTheme() {
    if  defaults read -g AppleInterfaceStyle > /dev/null 2>&1 = 'dark' ; then
        _change_alacritty_theme tokyonight_night
    else
        _change_alacritty_theme material_lighter
    fi
}
autoSwitchAlacrittyTheme
