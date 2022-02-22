let mapleader = ' '

inoremap jj <Esc>
tnoremap jj <C-\><C-n>

" Vimux
" Zoom the tmux runner pane
nnoremap <leader>vz :VimuxZoomRunner<CR>
" Run last command executed by VimuxRunCommand
map <Leader>vl :VimuxRunLastCommand<CR>
" Prompt for a command to run
map <Leader>vp :VimuxPromptCommand<CR>

" Git
nnoremap <leader>gc :GBranches<CR>
nnoremap <leader>gj :diffget //3<CR>
nnoremap <leader>gf :diffget //2<CR>

nnoremap <leader><C-n> :NvimTreeToggle<CR>

nnoremap <leader>ss <Plug>(easymotion-s2)

nnoremap <leader>f :Files<CR>

" To stop highlights when stop searching
nnoremap <esc> :noh<return><esc>

nnoremap <leader>w :w<CR>
nnoremap <leader>q :q!<CR>
nnoremap <leader>x :x<CR>

nnoremap <Up> <Nop>
nnoremap <Down> <Nop>
nnoremap <Left> <Nop>
nnoremap <Right> <Nop>

" ## Tabs
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

" Switch between tabs
au TabLeave * let g:lasttab = tabpagenr() " Save the tab number
" Go to that tab
nnoremap <silent> <leader>l :exe "tabn ".g:lasttab<cr>
vnoremap <silent> <leader>l :exe "tabn ".g:lasttab<cr>

" Move between left and right tabs
nnoremap H gT
nnoremap L gt


nnoremap <silent> gd <cmd>lua vim.lsp.buf.definition()<CR>
nnoremap <silent> gD <cmd>lua vim.lsp.buf.declaration()<CR>
nnoremap <silent> gr <cmd>lua vim.lsp.buf.references()<CR>
nnoremap <silent> gi <cmd>lua vim.lsp.buf.implementation()<CR>
nnoremap <silent> rn <cmd>lua vim.lsp.buf.rename(vim.fn.input('New name: '))<CR>
nnoremap <silent> K  <cmd>lua vim.lsp.buf.hover()<CR>
nnoremap <silent> ge <cmd>lua vim.lsp.diagnostic.show_line_diagnostics()<CR>
nnoremap <silent> <C-n> <cmd>lua vim.lsp.diagnostic.goto_prev()<CR>
nnoremap <silent> <C-p> <cmd>lua vim.lsp.diagnostic.goto_next()<CR>
nnoremap <silent> ca <cmd>lua vim.lsp.buf.code_action()<CR>

nnoremap <silent> ccp <cmd>%y+<CR>
nnoremap <silent> dA <cmd>%d<CR>

function! ClearRegisters()
    let regs='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-="*+'
    let i=0
    while (i<strlen(regs))
        exec 'let @'.regs[i].'=""'
        let i=i+1
    endwhile
endfunction
noremap <leader>cr :call ClearRegisters()<cr>

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
