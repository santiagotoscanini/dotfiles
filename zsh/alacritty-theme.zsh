function _change_alacritty_theme() {
    sed -i '' "s/^colors:\ \*.*$/colors:\ \*$1/" $(realpath $XDG_CONFIG_HOME/alacritty/color.yml)
}

function autoSwitchAlacrittyTheme() {
    if  defaults read -g AppleInterfaceStyle > /dev/null 2>&1 = 'dark' ; then
        _change_alacritty_theme one_half_dark
    else
        _change_alacritty_theme one_half_light
    fi
}
autoSwitchAlacrittyTheme
