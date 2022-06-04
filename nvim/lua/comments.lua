require("Comment").setup({
	opleader = {
		line = "gc", -- line comments
		block = "gb", -- block comments
	},
	mappings = {
		-- `gcc`              -> line-comment the current line
		-- `gcb`              -> block-comment the current line
		-- `gc[count]{motion} -> line-comment the region contained in {motion}
		-- `gb[count]{motion} -> block-comment the region contained in {motion}
		basic = true,
		-- Includes `gco`, `gcO`, `gcA`
		extra = true,
	},
})
