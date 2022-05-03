vim.g.completeopt= { "menu" ,"menuone", "noselect", "noinsert" }
vim.opt.list = true
vim.opt.listchars:append("space:⋅")

require("indent_blankline").setup {
    space_char_blankline = " ",
    show_current_context = true,
    show_current_context_start = true,
}

local lspkind = require("lspkind")
lspkind.init()

local cmp = require("cmp")

cmp.setup({
    mapping = {
        ['<C-b>'] = cmp.mapping(cmp.mapping.scroll_docs(-4), { 'i', 'c' }),
        ['<C-f>'] = cmp.mapping(cmp.mapping.scroll_docs(4), { 'i', 'c' }),
        ['<C-Space>'] = cmp.mapping(cmp.mapping.complete(), { 'i', 'c' }),
        ['<C-y>'] = cmp.config.disable, -- Specify `cmp.config.disable` if you want to remove the default `<C-y>` mapping.
        ['<C-e>'] = cmp.mapping({ i = cmp.mapping.abort(), c = cmp.mapping.close() }),
        ['<CR>'] = cmp.mapping.confirm({ select = true }),
        ['<Tab>'] = function(fallback)
            if cmp.visible() then
                cmp.select_next_item()
            else
                fallback()
            end
        end,
        ['<S-Tab>'] = function(fallback)
            if cmp.visible() then
                cmp.select_prev_item()
            else
                fallback()
            end
        end,
    },
    -- the order of your sources matter (by default). That gives them priority
    sources = cmp.config.sources({
        { name = "nvim_lua" },
        { name = "nvim_lsp" },
        { name = "path" },
        { name = "luasnip" },
        { name = "buffer", keyword_length = 5 },
    }),
    snippet = {
        expand = function(args)
            require('luasnip').lsp_expand(args.body)
        end,
    },
    formatting = {
        format = lspkind.cmp_format {
            with_text = true,
            menu = {
                nvim_lsp = "[LSP]",
                path = "[Path]",
                luasnip = "[Snippet]",
                buffer = "[Buffer]",
            },
        },
    },
    experimental = {
        native_menu = false,
        ghost_text = true,
    },
})

cmp.setup.cmdline('/', {
    sources = {
        { name = 'buffer', keyword_length = 5 },
    },
})

cmp.setup.cmdline(':', {
    sources = cmp.config.sources({
        { name = 'path' }
    }, {
        { name = 'cmdline' }
    })
})


local nvim_lsp = require('lspconfig')
local capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())

nvim_lsp.dartls.setup{ capabilities = capabilities }
nvim_lsp.tsserver.setup{ capabilities = capabilities }
nvim_lsp.solc.setup{ capabilities = capabilities }
nvim_lsp.gopls.setup{ capabilities = capabilities }

-- TODO(santiagotoscanini): make buffers aware of current virtual env (pyenv, poetry, venv, conda, etc)
-- local path = util.path
-- local function get_python_path(workspace)
--   -- Use activated virtualenv.
--   if vim.env.VIRTUAL_ENV then
--     return path.join(vim.env.VIRTUAL_ENV, 'bin', 'python')
--   end
--
--   -- Find and use virtualenv in workspace directory.
--   for _, pattern in ipairs({'*', '.*'}) do
--     local match = vim.fn.glob(path.join(workspace, pattern, 'pyvenv.cfg'))
--     if match ~= '' then
--         return path.join(path.dirname(match), 'bin', 'python')
--     end
--
--     local match = vim.fn.glob(path.join(workspace, 'poetry.lock'))
--     if match ~= '' then
--         local venv = vim.fn.trim(vim.fn.system('poetry env info -p'))
--         return path.join(venv, 'bin', 'python')
--     end
--   end
--
--   -- Fallback to system Python.
--   return exepath('python3') or exepath('python') or 'python'
-- end
nvim_lsp.pyright.setup{
    capabilities = capabilities,
    -- before_init = function(_, config)
    --     config.settings.python.pythonPath = get_python_path(config.root_dir)
    -- end
}
