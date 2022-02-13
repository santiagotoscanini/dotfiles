set incsearch                      " Incremental highlight while searching

set nowrap                         " No wrap lines (lines longer than the width of the window will wrap and display on the next line)
set scrolloff=10                   " Start to move up or down when we are 8 cells away
" let $FZF_DEFAULT_OPTS='--reverse'  " Reverse order of FZF

set nofixendofline                 " Prevent new empty lines at eof

set tabstop=4                      " Width of the tab character
set shiftwidth=4                   " Identation to use with identation commands
set expandtab                      " Forces spaces to be used in place of tab characters
set smartindent                    " Smart indent for braces, etc

set hidden                         " Hidden files instead of closing it, so avoid saving message when moving buffers.
set noswapfile                     " Don't use swapfiles for buffers
set undofile                       " Use undofiles, this means that we can use Undo and Redo in files even when we save, close and open again
set undodir=~/.vim/undodir         " Set the path for the undofiles

" set showmatch                      " When inserting a brace, put the closing one and jump to it
set noshowmode                     " Don't need to show the mode (Insert, Replace, Visual) because status line already do that

set clipboard^=unnamed,unnamedplus   " Copy between OS Clipboard and VIM Clipboard

set number                         " Show numbers
set numberwidth=1                  " Width of numbers
set signcolumn=number              " if apply, display symbols instead of numbers

" Switch between relative number and normal number if on insert mode or not.
augroup numbertoggle
  autocmd!
  autocmd BufEnter,FocusGained,InsertLeave,WinEnter * if &nu && mode() != "i" | set rnu   | endif
  autocmd BufLeave,FocusLost,InsertEnter,WinLeave   * if &nu                  | set nornu | endif
augroup END

set mouse=n

set colorcolumn=120                " line that shows the length of code
set cmdheight=2                    " Size of CMD bar at the bottom

filetype plugin indent on          " Enables `ftplugin` folder detection

" Syntax highlight
" work related files (probably only relevant on current company), it's a custom extension
au BufRead,BufNewFile *.work.zsh setfiletype csh
" .flake8 files (Python)
au BufRead,BufNewFile .flake8 setfiletype dosini

au BufWritePost <buffer> lua require('lint').try_lint()
