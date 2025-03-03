vim.g.completeopt = { "menu", "menuone", "noselect", "noinsert" }
vim.opt.list = true
-- vim.opt.listchars:append("space:⋅")

local nvim_lsp = require("lspconfig")
local capabilities = require("cmp_nvim_lsp").default_capabilities(vim.lsp.protocol.make_client_capabilities())

-- nvim_lsp.dartls.setup({ capabilities = capabilities })
nvim_lsp.ts_ls.setup({ capabilities = capabilities })
-- nvim_lsp.solc.setup({ capabilities = capabilities })
-- nvim_lsp.gopls.setup({ capabilities = capabilities })
nvim_lsp.vimls.setup({})
nvim_lsp.graphql.setup({})

-- TODO(santiagotoscanini): make buffers aware of current virtual env (pyenv, poetry, venv, conda, etc)
--⋅https://github.com/younger-1/nvim/blob/one/lua/young/lang/python.lua
nvim_lsp.pyright.setup({
	capabilities = capabilities,
	on_attach = require("lsp-format").on_attach,
})
