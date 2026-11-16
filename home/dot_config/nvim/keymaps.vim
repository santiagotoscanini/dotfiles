let mapleader = ' '

" To stop highlights when stop searching
nnoremap <esc> :noh<return><esc>

" To be consistent with C and D operators, the default behavior is to yank the whole line.
nnoremap Y y$

" While in visual mode, will delete what is currently highlighted and replace it with what is in the register.
" But it will yank it to a void register, meaning I still have what I originally had when I pasted.
vnoremap <leader>p "_dP

" Jump anywhere on screen: type what you are looking at, then the label.
nnoremap s <cmd>lua require("flash").jump()<cr>
xnoremap s <cmd>lua require("flash").jump()<cr>

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
    " <Tab> and <S-Tab> are in lua/completion.lua: they move through the
    " completion menu, or through the snippet when the menu is closed.
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
    endif

    " ----- PICKER ------
    " Find
    nnoremap <leader>f  <cmd>lua Snacks.picker.files()<cr>
    nnoremap <c-t>      <cmd>lua Snacks.picker.grep()<cr>
    " Git
    nnoremap <leader>gc <cmd>lua Snacks.picker.git_branches()<cr>


    " ----- GIT ------
    nnoremap <leader>gb <cmd>Gitsigns blame_line<cr>

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

    " ------ FILES ------
    " File tree in a sidebar
    nnoremap <leader>e  <cmd>lua Snacks.explorer()<cr>
    nnoremap <leader>sf <cmd>lua Snacks.explorer.reveal()<cr>
    " The current file's directory as an editable buffer
    nnoremap - <cmd>Oil<cr>

    " ------- LSP ---------
    " Neovim's own defaults also work: grn rename, gra code action, grr
    " references, gri implementation, K hover.
    nnoremap <silent> gd <cmd>lua Snacks.picker.lsp_definitions()<cr>
    nnoremap <silent> gi <cmd>lua Snacks.picker.lsp_implementations()<cr>
    nnoremap <silent> gr <cmd>lua Snacks.picker.lsp_references()<cr>
    nnoremap <silent> gD <cmd>lua vim.lsp.buf.declaration()<CR>
    nnoremap <silent> H  <cmd>lua vim.lsp.buf.hover()<CR>
    nnoremap <leader>, <cmd>lua vim.lsp.buf.rename()<cr>
    nnoremap <silent> ge <cmd>lua vim.diagnostic.open_float()<CR>
    nnoremap <silent> <C-n> <cmd>lua vim.diagnostic.jump({ count = -1, float = true })<CR>
    nnoremap <silent> <C-p> <cmd>lua vim.diagnostic.jump({ count = 1, float = true })<CR>

    " Debugger
    lua << EOF
    local dap, dapui, neotest = require("dap"), require("dapui"), require("neotest")
    -- steps
    vim.keymap.set("n", "<F5>", dap.continue, { desc = "Debug: continue" })
    vim.keymap.set("n", "<F10>", dap.step_over, { desc = "Debug: step over" })
    vim.keymap.set("n", "<F11>", dap.step_into, { desc = "Debug: step into" })
    vim.keymap.set("n", "<F12>", dap.step_out, { desc = "Debug: step out" })
    -- breakpoints
    vim.keymap.set("n", "<leader>b", dap.toggle_breakpoint, { desc = "Toggle breakpoint" })
    vim.keymap.set("n", "<leader>B", function()
        dap.set_breakpoint(vim.fn.input("Breakpoint condition: "))
    end, { desc = "Conditional breakpoint" })
    -- ui
    vim.keymap.set("n", "<leader>ui", dapui.toggle, { desc = "Toggle debugger UI" })

    -- tests
    vim.keymap.set("n", "<leader>tt", function()
        neotest.run.run({ strategy = "dap" })
    end, { desc = "Debug nearest test" })
    vim.keymap.set("n", "<leader>tf", function()
        neotest.run.run(vim.fn.expand("%"))
    end, { desc = "Run tests in file" })
    vim.keymap.set("n", "<leader>tn", function()
        neotest.run.run()
    end, { desc = "Run nearest test" })
    vim.keymap.set("n", "<leader>ts", neotest.summary.toggle, { desc = "Toggle test summary" })
    vim.keymap.set("n", "<leader>to", function()
        neotest.output.open({ enter = true })
    end, { desc = "Show test output" })
EOF
else
    nnoremap <leader>sa <cmd>lua require("flash").jump()<cr>

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

