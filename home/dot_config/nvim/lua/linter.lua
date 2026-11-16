-- Formatters (conform.nvim) and linters (nvim-lint). Both run external tools
-- and skip the ones that are not installed.

require("conform").setup({
	formatters_by_ft = {
		-- ruff sorts the imports, then formats: the same tool Zed uses.
		python = { "ruff_organize_imports", "ruff_format" },
		lua = { "stylua" },
	},
	-- Format on save; without a formatter above, fall back to the LSP server.
	-- Skip it once with <leader>nfw.
	format_on_save = {
		timeout_ms = 1000,
		lsp_format = "fallback",
	},
	notify_no_formatters = false,
})

local lint = require("lint")
lint.linters_by_ft = {
	go = { "golangcilint" },
	python = { "ruff" },
	zsh = { "zsh" },
	vim = { "vint" },
}

-- On open and on save. FileType rather than BufReadPost: the filetype, which
-- picks the linter, is not set yet when BufReadPost runs.
vim.api.nvim_create_autocmd({ "FileType", "BufWritePost" }, {
	group = vim.api.nvim_create_augroup("AuLint", { clear = true }),
	callback = function()
		lint.try_lint()
	end,
})
