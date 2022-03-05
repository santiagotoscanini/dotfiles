local ls = require('luasnip')

ls.config.set_config {
    -- this tells luasnip to remember to keep around the last snippet.
    -- you can jump back into it even if you move outside of the selection.
    -- history = true,

    -- this one is cool cause if you have dynamic snippets, it updates as you type.
    -- updateevens = "textchanged, textchangedi",

    -- autosnippets:
    -- enable_autosnippets = true,

    -- crazy highlights
    -- ext_opts = {
    --   [types.choicenode] = {
    --       active = {
    --           virt_text = { { "<-", "error" } }
    --       }
    --   }
    -- }
}

require("luasnip/loaders/from_vscode").lazy_load()
ls.filetype_extend("dart", {"flutter"})
