" Number of colors the terminal support, iTerm2 supports 256
set t_Co=256

if exists('+termguicolors')
    let &t_8f="\<Esc>[38;2;%lu;%lu;%lum"
    let &t_8b="\<Esc>[48;2;%lu;%lu;%lum"
    set termguicolors
endif

colorscheme tokyonight
function! SetBackgroundMode(...)
    if systemlist('defaults read -g AppleInterfaceStyle')[0] ==? 'dark'
        let s:new_bg = 'dark'
        let g:tokyonight_style = 'storm'
    else
        let s:new_bg = 'light'
        let g:tokyonight_style = 'day'
    endif

    if &background !=? s:new_bg
        let &background = s:new_bg
    endif
endfunction

call SetBackgroundMode() " First call
call timer_start(3000, 'SetBackgroundMode', {'repeat': -1})
