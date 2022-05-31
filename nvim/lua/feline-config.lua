require('feline').setup {
    force_inactive = {
        filetypes = {
            '^NvimTree$',
            '^help$',
        },
        buftypes = {
            '^terminal$',
            '^nofile$'
        },
    },
}

require('feline').winbar.setup {
    components = {
        active = {
            {
                {
                    provider = '%f',
                    hl = {
                        fg = 'skyblue',
                        bg = 'NONE',
                        style = 'bold',
                    },
                },
            },
        },
        inactive = {
            {
                {
                    provider = '%f',
                    hl = {
                        fg = 'white',
                        bg = 'NONE',
                        style = 'bold',
                    },
                },
            },
        },
    }
}
