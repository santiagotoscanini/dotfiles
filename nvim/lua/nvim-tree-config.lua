require("nvim-tree").setup({
	view = {
		relativenumber = true,
		signcolumn = "no",
		width = 40,
	},
	filters = {
		-- Hide .git folder
		custom = { ".git$" },
	},
})
