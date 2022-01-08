vim.g.completeopt= { "menu" ,"menuone", "noselect", "noinsert" }

local cmp = require("cmp")

local lspkind = require("lspkind")
lspkind.init()

local nvim_lsp = require('lspconfig')
local ls = require('luasnip')

vim.opt.list = true
vim.opt.listchars:append("space:⋅")

require("indent_blankline").setup {
    space_char_blankline = " ",
    show_current_context = true,
    show_current_context_start = true,
}


cmp.setup({
    mapping = {
        ['<C-b>'] = cmp.mapping(cmp.mapping.scroll_docs(-4), { 'i', 'c' }),
        ['<C-f>'] = cmp.mapping(cmp.mapping.scroll_docs(4), { 'i', 'c' }),
        ['<C-Space>'] = cmp.mapping(cmp.mapping.complete(), { 'i', 'c' }),
        ['<C-y>'] = cmp.config.disable, -- Specify `cmp.config.disable` if you want to remove the default `<C-y>` mapping.
        ['<C-e>'] = cmp.mapping({
            i = cmp.mapping.abort(),
            c = cmp.mapping.close(),
        }),
        ['<CR>'] = cmp.mapping.confirm({ select = true }),
    },
    -- the order of your sources matter (by default). That gives them priority
    sources = cmp.config.sources({
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
                buffer = "[Buffer]",
                path = "[Path]",
                luasnip = "[Snippet]",
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

local capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())

nvim_lsp.tsserver.setup{ capabilities = capabilities }
nvim_lsp.gopls.setup{ capabilities = capabilities }
nvim_lsp.pyright.setup{ capabilities = capabilities }
-- nvim_lsp.dartls.setup{ capabilities = capabilities }

-- Snippets
require("luasnip/loaders/from_vscode").lazy_load()
-- ls.filetype_extend("dart", {"flutter"})
