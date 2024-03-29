**B**ourne **A**gain **Sh**ell versus **Z** **Sh**ell.

Execution order comparison.

![bash vs zsh execution order comparison](https://github.com/santiagotoscanini/dotfiles/blob/main/shell/zsh/images/shell%20execution%20order%20comparision.png)

Summary of zsh:

`.zshenv` → [`.zprofile` if login] → [`.zshrc` if interactive] → [`.zlogin` if login] → [`.zlogout` if login, on exit]. **\[2\]**

`.zprofile` is based on the Bash's `.bash_profile` while `.zlogin` is a derivative of CSH's `.login`. Since Bash was the default shell for everything up to Mojave, I stick with `.zprofile`. **\[3\]**

[Startup files documentation](https://zsh.sourceforge.io/Intro/intro_3.html)

### Some Caveats \[3\]
Apple does things a little differently so it's best to be aware of this. Specifically, Terminal initially opens both a login and interactive shell even though you don't authenticate (enter login credentials). However, any subsequent shells that are opened are only interactive.

SSH sessions are login and interactive so they'll behave just like your initial Terminal session and read both .zprofile and .zshrc

---

### Setup

To be able to load configurations from `XDG_CONFIG_HOME` we have to create a `.zshenv` file in `$HOME` with the following line:
```bash
export ZDOTDIR=$HOME/.config/zsh
. $ZDOTDIR/.zshenv
```

---

Some concepts: **\[1\]**

**Interactive**: As the term implies, interactive means that the commands are run with user-interaction from keyboard. E.g. the shell can prompt the user to enter input.

**Non-interactive**: the shell is probably run from an automated process, so it can't assume it can request input or that someone will see the output. E.g., maybe it is best to write output to a log file.


**Login**: Means that the shell is run as part of the login of the user to the system. Typically, used to do any configuration that a user needs/wants to establish his work environment.

**Non-login**: Any other shell run by the user after logging on, or which is run by any automated process which is not coupled to a logged-in user.

---

**Important for macOS**

If you are using macOS, be aware that the file `/etc/zprofile` is loaded after `.zshenv`. This file is used to set the `PATH` variable for the system.

If we take a look at it, looks something like this:
```zsh
# System-wide profile for interactive zsh(1) login shells.

# Setup user specific overrides for this in ~/.zprofile. See zshbuiltins(1)
# and zshoptions(1) for more details.

if [ -x /usr/libexec/path_helper ]; then
    eval `/usr/libexec/path_helper -s`
fi
```

And if we take a look at the `path_helper` script running `/usr/libexec/path_helper -s` we can see that it outputs the following:
```bash
PATH="{some_system_paths}:{previous_path}"; export PATH;
```

So in case we want to use the homebrew binaries instead of the system ones, we have to add it on the `.zshrc` file.

---

Popular ZSH Frameworks:

- [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh)
- [Prezto](https://github.com/sorin-ionescu/prezto)
- [Zim](https://github.com/zimfw/zimfw)

---

Cites:

1. [What is the difference between interactive shells, login shells, non-login shell and their use cases?](https://unix.stackexchange.com/a/50667)
2. [What should/shouldn't go in .zshenv, .zshrc, .zlogin, .zprofile, .zlogout?](https://unix.stackexchange.com/questions/71253/what-should-shouldnt-go-in-zshenv-zshrc-zlogin-zprofile-zlogout#comment494583_71258)
3. [ZSH: .zprofile, .zshrc, .zlogin - What goes where?](https://apple.stackexchange.com/a/388623)
