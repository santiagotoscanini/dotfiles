vim.opt.list = true

-- nvim-lspconfig ships the server definitions (its lsp/ folder); Neovim's own
-- vim.lsp.enable starts them. blink.cmp adds its completion capabilities to
-- every server by itself.
-- TODO(santiagotoscanini): make buffers aware of current virtual env (pyenv, poetry, venv, conda, etc)
--⋅https://github.com/younger-1/nvim/blob/one/lua/young/lang/python.lua
local servers = {
	gopls = "gopls",
	tsc = "tsc", -- TypeScript 7+, whose compiler is also the language server
	vimls = "vim-language-server",
	graphql = "graphql-lsp",
	pyright = "pyright-langserver",
}

-- Only start the servers that are installed, so a missing one is silent
-- instead of an error on every file of that type.
for name, binary in pairs(servers) do
	if vim.fn.executable(binary) == 1 then
		vim.lsp.enable(name)
	end
end

-- Go
vim.lsp.config("gopls", {
	settings = {
		gopls = {
			gofumpt = true, -- stricter gofmt, used by format on save
			staticcheck = true,
			analyses = { unusedparams = true, nilness = true, unusedwrite = true },
		},
	},
})

-- Add missing imports and drop unused ones before saving a Go file. It runs
-- before the format on save in lua/linter.lua, which then formats with gopls.
vim.api.nvim_create_autocmd("BufWritePre", {
	group = vim.api.nvim_create_augroup("AuGoImports", { clear = true }),
	pattern = "*.go",
	callback = function(args)
		local client = vim.lsp.get_clients({ bufnr = args.buf, name = "gopls" })[1]
		if not client then
			return
		end
		local params = vim.lsp.util.make_range_params(0, client.offset_encoding)
		params.context = { only = { "source.organizeImports" } }
		local result = client:request_sync("textDocument/codeAction", params, 1000, args.buf)
		for _, action in ipairs(result and result.result or {}) do
			if action.edit then
				vim.lsp.util.apply_workspace_edit(action.edit, client.offset_encoding)
			end
		end
	end,
})
