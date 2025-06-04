#!/usr/bin/python3

import errno
import os


def check_required_variables(vars):
    for var in vars:
        if os.environ.get(var) is None:
            print(f"{var} not set")
            exit(1)


# Check if required variables are set
check_required_variables(["XDG_CONFIG_HOME", "QMK_DIR", "HOME", "DOTFILES_DIR"])
XDG_CONFIG_HOME = os.environ["XDG_CONFIG_HOME"]
HOME = os.environ["HOME"]
QMK_DIR = os.environ["QMK_DIR"]
DOTFILES_DIR = os.environ["DOTFILES_DIR"]

mappings = {
    "Git": {
        "src": "git",
        "dst": os.path.join(XDG_CONFIG_HOME, "git"),
    },
    "GitHub CLI": {
        "src": "gh",
        "dst": os.path.join(XDG_CONFIG_HOME, "gh"),
    },
    "ZSH": {
        "src": "shell/zsh",
        "dst": os.path.join(XDG_CONFIG_HOME, "zsh"),
    },
    "Neovim": {
        "src": "editors/nvim",
        "dst": os.path.join(XDG_CONFIG_HOME, "nvim"),
    },
    "Alacritty": {
        "src": "terminal/alacritty",
        "dst": os.path.join(XDG_CONFIG_HOME, "alacritty"),
    },
    "Tmux": {
        "src": "terminal/tmux",
        "dst": os.path.join(XDG_CONFIG_HOME, "tmux"),
    },
    "Tmuxinator": {
        "src": "terminal/tmuxinator",
        "dst": os.path.join(XDG_CONFIG_HOME, "tmuxinator"),
    },
    "IdeaVim": {
        "src": "editors/jetbrains/ideavim",
        "dst": os.path.join(XDG_CONFIG_HOME, "ideavim"),
    },
    "SSH": {
        # Only symlink config file, to avoid overriding keys, known_hosts, and allowed_singers.
        "src": "ssh/config",
        # SSH is not compatible with XDG Standard, because many programs expect this file to be here.
        # https://wiki.archlinux.org/title/XDG_Base_Directory
        "dst": os.path.join(HOME, ".ssh", "config"),
        "is_directory": False,
    },
    "QMK": {
        # QMK Files go inside QMK Firmware directory (aren't XDG Compatible).
        "src": "qmk/santi_km",
        "dst": os.path.join(QMK_DIR, "keyboards/crkbd/keymaps/santi_km"),
    }
}


def force_symlink(src, dst, is_dir):
    try:
        os.symlink(src, dst, target_is_directory=is_dir)
    except OSError as e:
        if e.errno == errno.EEXIST:
            os.remove(dst)
            os.symlink(src, dst, target_is_directory=True)


for service_name, mapping in mappings.items():
    src = os.path.join(DOTFILES_DIR, mapping["src"])
    dst = mapping["dst"]
    is_dir = mapping.get("file", True)
    print(f"------ {service_name} ------")
    print(f"Source: {src}")
    print(f"Destination: {dst}")

    print("Symlinking service...")
    force_symlink(src, dst, is_dir)
