" Number of colors the terminal support, iTerm2 supports 256
set t_Co=256

if exists('+termguicolors')
    let &t_8f="\<Esc>[38;2;%lu;%lu;%lum"
    let &t_8b="\<Esc>[48;2;%lu;%lu;%lum"
    set termguicolors
endif

colorscheme material
function! SetBackgroundMode(...)
    " https://github.com/marko-cerovac/material.nvim
    " There are 5 styles to choose from:
    " -oceanic
    " -deep ocean
    " -palenight
    " -darker
    " -lighter
    if systemlist('defaults read -g AppleInterfaceStyle')[0] ==? 'dark'
        lua require('material.functions').change_style('palenight')
    else
        lua require('material.functions').change_style('lighter')
    endif
endfunction

call SetBackgroundMode() " First call
call timer_start(3000, 'SetBackgroundMode', {'repeat': -1})
