**B**ourne **A**gain **Sh**ell versus **Z** **Sh**ell.

Execution order comparison.

![bash vs zsh execution order comparison](https://github.com/santiagotoscanini/dotfiles/blob/main/zsh/images/shell%20execution%20order%20comparision.png)

Summary of zsh:

`.zshenv` → [`.zprofile` if login] → [`.zshrc` if interactive] → [`.zlogin` if login] → [`.zlogout` if login, on exit].

[Startup files documentation](https://zsh.sourceforge.io/Intro/intro_3.html)
