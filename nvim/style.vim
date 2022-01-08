" let g:fzf_layout = {'window': {'width': 0.8, 'height': 0.8}}  " Style of FZF window

set t_Co=256                       " Number of colors the terminal support, iTerm2 supports 256
if exists('+termguicolors')
  let &t_8f="\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b="\<Esc>[48;2;%lu;%lu;%lum"
  set termguicolors
endif

function! SetBackgroundMode(...)
    if systemlist('defaults read -g AppleInterfaceStyle')[0] ==? 'dark'
        let s:new_bg = 'dark'
        colorscheme onedark
    else
        let s:new_bg = 'light'
        colorscheme github_light
    endif

    if &background !=? s:new_bg
        let &background = s:new_bg
    endif
endfunction

call SetBackgroundMode() " First call
call timer_start(3000, 'SetBackgroundMode', {'repeat': -1})
