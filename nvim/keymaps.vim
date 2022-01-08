let mapleader = ' '

inoremap jj <ESC>

" Zoom the tmux runner pane
nnoremap <leader>vz :VimuxZoomRunner<CR>
" Run last command executed by VimuxRunCommand
map <Leader>vl :VimuxRunLastCommand<CR>
" Prompt for a command to run
map <Leader>vp :VimuxPromptCommand<CR>

nnoremap <leader>gc :GBranches<CR>
nnoremap <leader>gj :diffget //3<CR>
nnoremap <leader>gf :diffget //2<CR>

nnoremap <leader>ss <Plug>(easymotion-s2)

nnoremap <leader>f :Files<CR>

vmap <Leader>/ <Plug>NERDCommenterToggle
nmap <Leader>/ <Plug>NERDCommenterToggle

" To stop highlights when stop searching
nnoremap <esc> :noh<return><esc>

nnoremap <leader>w :w<CR>
nnoremap <leader>q :q!<CR>
nnoremap <leader>x :x<CR>

nnoremap <Up> <Nop>
nnoremap <Down> <Nop>
nnoremap <Left> <Nop>
nnoremap <Right> <Nop>

function! ClearRegisters()
    let regs='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-="*+'
    let i=0
    while (i<strlen(regs))
        exec 'let @'.regs[i].'=""'
        let i=i+1
    endwhile
endfunction
noremap <leader>cr :call ClearRegisters()<cr>

function! RenameFile()
    let old_name = expand('%')
    let new_name = input('New file name: ', expand('%'), 'file')
    if new_name !=# '' && new_name !=# old_name
        exec ':saveas ' . new_name
        exec ':silent !rm ' . old_name
        exec ':bd ' . old_name
        redraw!
    endif
endfunction
nnoremap <leader>rf :call RenameFile()<cr>

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

" FIXME(santiagotoscanini): This doesn't work
function Newscratch()
    execute 'tabnew '
    setlocal buftype=nofile
    setlocal bufhidden=hide
    setlocal noswapfile
endfunction
nnoremap <leader><leader> sf <cmd> Newscratch()<CR>

nnoremap <leader><C-n> :NvimTreeToggle<CR>
