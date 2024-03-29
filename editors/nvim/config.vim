" Search
set ignorecase                     " Case insensitive searches
set smartcase                      " Case sensitive only if pattern contains at least one uppercase char.

augroup AuHighlightYank
    autocmd!
    autocmd TextYankPost * lua vim.highlight.on_yank{higroup="IncSearch", timeout=250, on_visual=true}
augroup END

set clipboard=unnamedplus          " Copy between OS Clipboard and VIM Clipboard, Unnamed is vim copy register and + is OS reg.

if !exists('g:vscode')
    " Identation
    set tabstop=4                      " Width of the tab character
    set shiftwidth=4                   " Indentation to use with indentation commands
    set expandtab                      " Forces spaces to be used in place of tab characters
    set smartindent                    " Smart indent for braces, etc

    set noendofline                    " No end of line character

    " Buffers and undofiles
    set hidden                         " Hidden files instead of closing it, so avoid saving message when moving between buffers
    set noswapfile                     " Don't use swapfiles for buffers
    set undofile                       " Use undofiles, so we can use Undo and Redo in files even when we save, close and open again
    set undodir=~/.vim/undodir         " Set the path for the undofiles

   " Left column
    set number                         " Show numbers
    set numberwidth=1                  " Width of numbers
    set signcolumn=auto                " Display symbols on left of number
    set fillchars=eob:\                " Hide ~ for lines after the end of the file

    " Status bar
    set noshowmode                     " Don't need to show the mode (Insert, Replace, Visual) because status line already do that.
    set cmdheight=2                    " Size of CMD bar at the bottom, 2 lines.

    " Extra
    set nowrap                         " No wrap lines (lines longer than the width of the window will wrap and display on the next line)
    set scrolloff=10                   " Start to move up or down when we are some cells away
    set showmatch                      " When inserting a brace, put the closing one and jump to it
    set colorcolumn=140                " vertical line, to maintain the length of the code
    set mouse=n                        " Mouse usage in vim

    " Terminal
    " let $GIT_EDITOR = 'nvr -cc split --remote-wait'
    " augroup AuNoNumberAndInsertInTerminal
    "     autocmd!
    "     autocmd TermOpen * setlocal nonumber norelativenumber
    "     autocmd TermOpen * startinsert
    " augroup END

    " augroup AuDeleteBufferGitEditor
    "     autocmd!
    "     autocmd FileType gitcommit,gitrebase,gitconfig set bufhidden=delete
    " augroup END

    augroup AuToggleRelativeNumber
        autocmd!
        " When exiting insert mode, or opening a file in general, we set relative numbers
        autocmd BufEnter,FocusGained,InsertLeave,WinEnter * if &nu && mode() != "i" | set rnu   | endif
        " When enter insert mode, we avoid relative numbers
        autocmd BufLeave,FocusLost,InsertEnter,WinLeave   * if &nu                  | set nornu | endif
    augroup END

    augroup AuFileTypes
        autocmd!
        autocmd BufRead,BufNewFile .flake8                     setf dosini
        autocmd BufRead,BufNewFile */git/config,gitconfig-work setf gitconfig
        autocmd BufRead,BufNewFile */ssh/config                setf sshconfig
        autocmd BufRead,BufNewFile *.vtl                       setf json
    augroup END

    augroup AuRunFormatting
        autocmd BufWritePre * lua vim.lsp.buf.format()
    augroup END
endif

