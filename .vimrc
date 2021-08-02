" Default by neovim
" :syntax enable
" :set number
" :set sw=2
" :set hlsearch

" START
set tabstop=4 softtabstop=4
set shiftwidth=4
set expandtab
set smartindent

set exrc            " To use different .vimrc at project level
set guicursor=      " dont show thick cursor in insert mode

set nohlsearch      " Don't keep search highlighted 
set hidden          " Keeps buffers of non saved files

set noerrorbells
set nowrap          " No wrap line
set noswapfile
set nobackup
set undodir=~/.vim/undodir
set undofile

set incsearch       " highlights searchs

set scrolloff=8     " Start to move up or down when we are 8 cells away
set colorcolumn=120  " linea que muestra el largo del codigo
set signcolumn=yes

set cmdheight=2

set updatetime=50
" END


" Left bar
:set numberwidth=2
:set number
:set relativenumber

:set clipboard=unnamed
:set mouse=a

:set showcmd
:set cursorline
:set showmatch

" Bar
:set ruler
:set laststatus=2
:set noshowmode

" -----------------------------------------------------------------------------

:call plug#begin('~/.vim/plugged')
" Themes -----------------------------------------------------------------------

" Plug 'morhetz/gruvbox'
Plug 'sonph/onehalf', { 'rtp': 'vim' }

" ------------------------------------------------------------------------------

" 'IDE' Utils -------------------------------------------------------------------
Plug 'easymotion/vim-easymotion'                   " Move inside a File.
Plug 'itchyny/lightline.vim'			   " Status Bar.
Plug 'scrooloose/nerdtree'			   " File Explorer.
Plug 'ryanoasis/vim-devicons'			   " Icons
Plug 'christoomey/vim-tmux-navigator'		   " Navigate Between Terminals with Ctrl + hjlk
Plug 'neoclide/coc.nvim', {'branch': 'release'}	   " Intellisense.
Plug 'scrooloose/nerdcommenter'			   " Toggle Comments
" -------------------------------------------------------------------------------
:call plug#end()

" ------------------------------------------------------------------------------

:let NERDTreeQuitOnOpen=1

" Themes ------------------------------------------------------------------------
:set t_co=256

if exists('+termguicolors')
  let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
  set termguicolors
endif

" -- Gruvbox --
" colorscheme gruvbox
" let g:gruvbox_contrast_dark = "hard"

" -- OneHalf --
let g:lightline = {
  \ 'colorscheme': 'onehalfdark',
  \ }
:colorscheme onehalfdark
" -------------------------------------------------------------------------------

" Shortcuts ---------------------------------------------------------------------
:let mapleader=" "

" 2 means 2 letters to search by.
:nmap <Leader>s <Plug>(easymotion-s2)
:nmap <Leader>nt :NERDTreeFind<CR>

:vmap <Leader>/ <Plug>NERDCommenterToggle
:nmap <Leader>/ <Plug>NERDCommenterToggle

:nmap <Leader>w :w<CR>
:nmap <Leader>q :q<CR>

:nmap <Leader>d :colorscheme onehalfdark<CR>
:nmap <Leader>l :colorscheme onehalflight<CR>
" -------------------------------------------------------------------------------

" File Types --------------------------------------------------------------------
:au BufRead,BufNewFile .flake8 setfiletype dosini

" Automatically install missing plugins on startup
autocmd VimEnter *
  \  if len(filter(values(g:plugs), '!isdirectory(v:val.dir)'))
  \|   PlugInstal --sync | q
  \| endif
 
" source ~/.config/nvim/plug-config/coc.vim

