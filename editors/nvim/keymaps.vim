let mapleader = ' '

" To stop highlights when stop searching
nnoremap <esc> :noh<return><esc>

" FIXME(santiagotoscanini): This is not working.
" Google the clipboard contents
" nnoremap <leader>sog <cmd>! _search_google_clipboard<cr>

" To be consistent with C and D operators, the default behavior is to yank the whole line.
nnoremap Y y$

" While in visual mode, will delete what is currently highlighted and replace it with what is in the register.
" But it will yank it to a void register, meaning I still have what I originally had when I pasted.
vnoremap <leader>p "_dP

if !exists('g:vscode')
    " ------ BASICS ------
    inoremap jj <Esc>
    nnoremap <leader>w :wa<CR>
    nnoremap <leader>q :q!<CR>
    nnoremap <leader>x :x<CR>
    " Write without appliying autocommands (as formatting)
    nnoremap <leader>nfw :noa w<CR>

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

    " Debugger
    lua << EOF
    -- steps
    vim.keymap.set('n', '<F5>', require 'dap'.continue)
    vim.keymap.set('n', '<F10>', require 'dap'.step_over)
    vim.keymap.set('n', '<F11>', require 'dap'.step_into)
    vim.keymap.set('n', '<F12>', require 'dap'.step_out)
    -- breakpoints
    vim.keymap.set('n', '<leader>b', require 'dap'.toggle_breakpoint)
    vim.keymap.set('n', '<leader>B', function()
      require 'dap'.set_breakpoint(vim.fn.input('Breakpoint condition: '))
    end)
    -- ui
    vim.keymap.set('n', '<leader>ui', require 'dapui'.toggle)

    -- tests
    -- debug test
    vim.keymap.set('n', '<leader>tt', function()
        require("neotest").run.run({strategy = "dap"})
    end)
    vim.keymap.set('n', '<leader>tf', function()
        require("neotest").run.run(vim.fn.expand("%"))
    end)
EOF
else
    nnoremap <leader>sa <Plug>(easymotion-s2)

    " ------ NVIM-TREE ------
    "  This is only to reveal in explorer, the toggle is configured in vscode
    "  keymaps
    nnoremap <leader>sf <Cmd>call VSCodeNotify('revealInExplorer')<CR>

    nnoremap <leader>re <Cmd>call VSCodeNotify('editor.action.rename')<CR>

    " ------ SAVE AND CLOSE ------
    nnoremap <leader>w <Cmd>call VSCodeNotify('workbench.action.files.save')<CR>
    nnoremap <leader>q <Cmd>call VSCodeNotify('workbench.action.closeActiveEditor')<CR>

    " ------ PANEL NAVIGATION ------
    nnoremap <C-h> <Cmd>call VSCodeNotify('workbench.action.focusLeftGroup')<CR>
    nnoremap <C-l> <Cmd>call VSCodeNotify('workbench.action.focusRightGroup')<CR>
    nnoremap <C-j> <Cmd>call VSCodeNotify('workbench.action.focusBelowGroup')<CR>
    nnoremap <C-k> <Cmd>call VSCodeNotify('workbench.action.focusAboveGroup')<CR>

    " ------ SPLITS ------
    " Similar to tmux: - for horizontal split, _ for vertical split
    nnoremap <leader>- <Cmd>call VSCodeNotify('workbench.action.splitEditorDown')<CR>
    nnoremap <leader>_ <Cmd>call VSCodeNotify('workbench.action.splitEditor')<CR>

    " ------ FOLDING ------
    nnoremap zc <Cmd>call VSCodeNotify('editor.fold')<CR>
    nnoremap zo <Cmd>call VSCodeNotify('editor.unfold')<CR>
    nnoremap <leader>zc <Cmd>call VSCodeNotify('editor.foldAll')<CR>
    nnoremap <leader>zo <Cmd>call VSCodeNotify('editor.unfoldAll')<CR>

    " ------ FUZZY FINDER ------
    nnoremap <leader>f <Cmd>call VSCodeNotify('workbench.action.quickOpen')<CR>
    nnoremap <leader>rg <Cmd>call VSCodeNotify('workbench.action.findInFiles')<CR>
    nnoremap <leader>rcl <Cmd>call VSCodeNotify('workbench.action.openRecent')<CR>
    nnoremap <leader>e <Cmd>call VSCodeNotify('workbench.action.showAllEditorsByMostRecentlyUsed')<CR>
    nnoremap <C-a> <Cmd>call VSCodeNotify('workbench.action.showCommands')<CR>

    " ------ GIT ------
    nnoremap <leader>gc <Cmd>call VSCodeNotify('workbench.view.scm')<CR>
    nnoremap <leader>gp <Cmd>call VSCodeNotify('git.push')<CR>
    nnoremap <leader>gi <Cmd>call VSCodeNotify('git.ignore')<CR>
    nnoremap <leader>gm <Cmd>call VSCodeNotify('git.openChange')<CR>
    nnoremap <leader>gb <Cmd>call VSCodeNotify('git.checkout')<CR>
    nnoremap <leader>ghp <Cmd>call VSCodeNotify('pr.create')<CR>
endif

