" Number of colors the terminal support, iTerm2 supports 256
set t_Co=256

if exists('+termguicolors')
    let &t_8f="\<Esc>[38;2;%lu;%lu;%lum"
    let &t_8b="\<Esc>[48;2;%lu;%lu;%lum"
    set termguicolors
endif

colorscheme material

function! SetBackgroundMode(...)
    " https://github.com/marko-cerovac/material.nvim
    " There are 5 styles to choose from:
    " -oceanic
    " -deep ocean
    " -palenight
    " -darker
    " -lighter
    if systemlist('defaults read -g AppleInterfaceStyle')[0] ==? 'dark'
        lua require('material.functions').change_style('palenight')
    else
        lua require('material.functions').change_style('lighter')
    endif
endfunction

" First call
call SetBackgroundMode()

" Change the color scheme if we receive a SigUSR1
autocmd Signal SIGUSR1 call SetBackgroundMode()

lua << EOF
vim.fn.sign_define('DapBreakpoint',{ text ='🟥', texthl ='', linehl ='', numhl =''})
vim.fn.sign_define('DapStopped',{ text ='▶️', texthl ='', linehl ='', numhl =''})

-- Smoth scrolling
require("neoscroll").setup({
	-- All these keys will be mapped to their corresponding default scrolling animation
	mappings = { "<C-u>", "<C-d>", "<C-b>", "<C-f>", "<C-y>", "<C-e>", "zt", "zz", "zb" },
	hide_cursor = true,
	stop_eof = true, -- Stop at <EOF> when scrolling downwards
	use_local_scrolloff = false, -- Use the local scope of scrolloff instead of the global scope
	respect_scrolloff = false, -- Stop scrolling when the cursor reaches the scrolloff margin of the file
	cursor_scrolls_alone = true, -- The cursor will keep on scrolling even if the window cannot scroll further
	easing_function = "sine", -- Default easing function
})

-- Left side file explorer
require("nvim-tree").setup({
	view = {
		relativenumber = true,
		signcolumn = "no",
		width = 40,
	},
	filters = {
		-- Hide .git folder
		-- custom = { ".git$" },
	},
})

-- require("indent_blankline").setup({
-- 	space_char_blankline = " ",
-- 	show_current_context = true,
-- 	show_current_context_start = true,
-- })
EOF

