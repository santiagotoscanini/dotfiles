set termguicolors

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

" First call
call SetBackgroundMode()

" Change the color scheme if we receive a SigUSR1
autocmd Signal SIGUSR1 call SetBackgroundMode()

" Show syntax highlighting in markdown code blocks
let g:markdown_fenced_languages = ['html', 'js=javascript', 'lua']
