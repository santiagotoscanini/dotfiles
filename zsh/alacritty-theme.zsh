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
