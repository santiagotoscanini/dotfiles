let mapleader = ' '

" ------ BASICS ------
inoremap jj <Esc>
" Write without appliying autocommands (as formatting)
nnoremap <leader>nfw :noa w<CR>
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q!<CR>
nnoremap <leader>x :x<CR>
" To stop highlights when stop searching
nnoremap <esc> :noh<return><esc>

" ----- CUSTOM ------
" Rename the current file
function! RenameCurrentFile()
    let old_name = expand('%')
    let new_name = input('New file name: ', expand('%'), 'file')
    if new_name !=# '' && new_name !=# old_name
        exec ':saveas ' . new_name
        exec ':silent !rm ' . old_name
        exec ':bd ' . old_name
        redraw!
    endif
endfunction
nnoremap <leader>rf :call RenameCurrentFile()<cr>

" FIXME(santiagotoscanini): This is not working.
" Google the clipboard contents
nnoremap <leader>sog <cmd>! _search_google_clipboard<cr>

" ----- LUASNIP ------
imap <silent><expr> <Tab> luasnip#expand_or_jumpable() ? '<Plug>luasnip-expand-or-jump' : '<Tab>'
inoremap <silent> <S-Tab> <cmd>lua require'luasnip'.jump(-1)<Cr>

snoremap <silent> <Tab> <cmd>lua require('luasnip').jump(1)<Cr>
snoremap <silent> <S-Tab> <cmd>lua require('luasnip').jump(-1)<Cr>

imap <silent><expr> <C-E> luasnip#choice_active() ? '<Plug>luasnip-next-choice' : '<C-E>'
smap <silent><expr> <C-E> luasnip#choice_active() ? '<Plug>luasnip-next-choice' : '<C-E>'

" ---- TERMINAL ------
"
" Now we can go to normal mode in terminal with esc and with jj
tnoremap <Esc> <C-\><C-n>
tnoremap jj    <C-\><C-n>
" To send escape key to the terminal, we use ctrl-v esc
tnoremap <C-v><Esc> <Esc>

" ----- TMUX ------
if exists('$TMUX')
    " Zoom the tmux runner pane
    nnoremap <leader>vz :VimuxZoomRunner<CR>
    " Run last command executed by VimuxRunCommand
    map <Leader>vl :VimuxRunLastCommand<CR>
    " Prompt for a command to run
    map <Leader>vp :VimuxPromptCommand<CR>

    " Golang
    map <Leader>ra :GolangTestCurrentPackage<CR>
    map <Leader>grct :wa<CR> :GolangTestFocused<CR>
endif

" ----- TELESCOPE ------
" Find
nnoremap <leader>f  <cmd>Telescope find_files<cr>
nnoremap <c-t>      <cmd>Telescope live_grep <cr>
" Git
nnoremap <leader>gc <cmd>Telescope git_branches<cr>


" ----- GIT ------
nnoremap <leader>gb <cmd>Gitsigns blame_line<cr>
" nnoremap <leader>gj :diffget //3<CR>
" nnoremap <leader>gf :diffget //2<CR>

" ------ TABS -------
" Go to tab by number
noremap <leader>1 1gt
noremap <leader>2 2gt
noremap <leader>3 3gt
noremap <leader>4 4gt
noremap <leader>5 5gt
noremap <leader>6 6gt
noremap <leader>7 7gt
noremap <leader>8 8gt
noremap <leader>9 9gt
noremap <leader>0 :tablast<cr>

" Move between left and right tabs
nnoremap H gT
nnoremap L gt

" Switch between tabs
" au TabLeave * let g:lasttab = tabpagenr() " Save the tab number
" Go to that tab
" nnoremap <silent> <leader>l :exe "tabn ".g:lasttab<cr>
" vnoremap <silent> <leader>l :exe "tabn ".g:lasttab<cr>

" ------ SCRATCH FILES
function NewTabScratchFile()
    execute 'tabnew '
    setlocal buftype=nofile
    setlocal bufhidden=hide
    setlocal noswapfile
endfunction
nnoremap <leader><leader>sf :call NewTabScratchFile()<CR>

function SaveScratchFile()
    let save_path = input('Insert path to save file: ')
    if save_path !=# ''
        exec ':write ' . save_path
    endif
endfunction
nnoremap <leader><leader>save :call SaveScratchFile()<CR>

" ------ NVIM-TREE ------
nnoremap <leader>e :NvimTreeToggle<cr>
nnoremap <leader>sf :NvimTreeFindFile<cr>

" ------- COPILOT -------
let g:copilot_no_tab_map = v:true
imap <silent><script><expr> <C-J> copilot#Accept("\<CR>")

" ------- LSP ---------
" nnoremap <silent> gd <cmd>lua vim.lsp.buf.definition()<CR>
nnoremap <silent> gd <cmd>Telescope lsp_definitions<cr>
" nnoremap <silent> gi <cmd>lua vim.lsp.buf.implementation()<CR>
nnoremap <silent> gi <cmd>Telescope lsp_implementations<cr>
" nnoremap <silent> gr <cmd>lua vim.lsp.buf.references()<CR>
nnoremap <silent> gr <cmd>Telescope lsp_references<cr>
nnoremap <silent> gD <cmd>lua vim.lsp.buf.declaration()<CR>
nnoremap <silent> H  <cmd>lua vim.lsp.buf.hover()<CR>
" nnoremap <leader> rn <cmd>lua vim.lsp.buf.rename(vim.fn.input('New name: '))<CR>
nnoremap <leader>, <cmd> lua require('renamer').rename()<cr>
nnoremap <silent> ge <cmd>lua vim.diagnostic.open_float()<CR>
nnoremap <silent> <C-n> <cmd>lua vim.diagnostic.goto_prev()<CR>
nnoremap <silent> <C-p> <cmd>lua vim.diagnostic.goto_next()<CR> " nnoremap <silent> ca <cmd>lua vim.lsp.buf.code_action()<CR>

