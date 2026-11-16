set termguicolors

" Catppuccin, like Ghostty: Latte in light mode, Frappe in dark mode.
lua require("catppuccin").setup({ background = { light = "latte", dark = "frappe" } })

" Follow the macOS appearance. Asking macOS (instead of the terminal) also
" works inside tmux.
function! SetBackgroundMode(...)
    if systemlist('defaults read -g AppleInterfaceStyle')[0] ==? 'dark'
        set background=dark
    else
        set background=light
    endif
    colorscheme catppuccin
endfunction

" First call
call SetBackgroundMode()

" Change the color scheme if we receive a SigUSR1
autocmd Signal SIGUSR1 call SetBackgroundMode()

" Show syntax highlighting in markdown code blocks
let g:markdown_fenced_languages = ['html', 'js=javascript', 'lua']
