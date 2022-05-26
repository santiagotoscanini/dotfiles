if !exists('g:vscode')
    " Identation
    set tabstop=4                      " Width of the tab character
    set shiftwidth=4                   " Identation to use with identation commands
    set expandtab                      " Forces spaces to be used in place of tab characters
    set smartindent                    " Smart indent for braces, etc

    " Buffers and undofiles
    set hidden                         " Hidden files instead of closing it, so avoid saving message when moving between buffers
    set noswapfile                     " Don't use swapfiles for buffers
    set undofile                       " Use undofiles, so we can use Undo and Redo in files even when we save, close and open again
    set undodir=~/.vim/undodir         " Set the path for the undofiles

    " Left column
    set number                         " Show numbers
    set numberwidth=1                  " Width of numbers
    set signcolumn=number              " if apply, display symbols instead of numbers

    " Status bar
    set noshowmode                     " Don't need to show the mode (Insert, Replace, Visual) because status line already do that
    set cmdheight=2                    " Size of CMD bar at the bottom

    " Extra
    set nowrap                         " No wrap lines (lines longer than the width of the window will wrap and display on the next line)
    set scrolloff=10                   " Start to move up or down when we are 8 cells away
    set showmatch                      " When inserting a brace, put the closing one and jump to it
    set colorcolumn=120                " vertical line, to maintain the length of the code
    set mouse=n                        " Mouse usage in vim

    let $GIT_EDITOR = 'nvr -cc split --remote-wait'
    augroup AuDeleteBufferGitEditor
        autocmd!
        autocmd FileType gitcommit,gitrebase,gitconfig set bufhidden=delete
    augroup END

    augroup AuNoNumberAndInsertInTerminal
        autocmd!
        autocmd TermOpen * setlocal nonumber norelativenumber
        autocmd TermOpen * startinsert
    augroup END

    augroup AuToggleRelativeNumber
        autocmd!
        " When exiting insert mode, or opening a file in general, we set relative numbers
        autocmd BufEnter,FocusGained,InsertLeave,WinEnter * if &nu && mode() != "i" | set rnu   | endif
        " When enter insert mode, we avoid relative numbers
        autocmd BufLeave,FocusLost,InsertEnter,WinLeave   * if &nu                  | set nornu | endif
    augroup END

    augroup AuFileTypes
        autocmd!
        autocmd BufRead,BufNewFile .flake8        setf dosini
        autocmd BufRead,BufNewFile gitconfig-work setf gitconfig
        autocmd BufRead,BufNewFile */ssh/config   setf sshconfig
    augroup END

    augroup AuRunLinting
        autocmd!
        autocmd BufEnter,BufNew,InsertLeave,TextChanged,VimEnter <buffer> lua require('lint').try_lint()
    augroup END

    augroup AuTrailingSpacesAndLines
        autocmd!
        autocmd BufWritePre * let current_pos = getpos(".")
        " Find all \s (spaces) at the end of line, and deletes them
        autocmd BufWritePre * silent! undojoin | %s/\s\+$//e
        " Find all \n (new line) at the end of file, and deletes them
        autocmd BufWritePre * silent! undojoin | %s/\n\+\%$//e
        autocmd BufWritePre * call setpos(".", current_pos)
        autocmd BufWritePre,FileWritePre * silent! call mkdir(expand('<afile>:p:h'), 'p')
    augroup END
endif

set clipboard=unnamedplus " Copy between OS Clipboard and VIM Clipboard, Unnamed is vim copy register and + is OS reg.

" Search
set ignorecase                     " Case insensitive searches
set smartcase                      " Case sensitive only if pattern contains at least one uppercase char.

augroup AuHighlightYank
    autocmd!
    autocmd TextYankPost * lua vim.highlight.on_yank{higroup="IncSearch", timeout=250, on_visual=true}
augroup END
