# QMK keymap (Corne / crkbd)

This folder is a [QMK External Userspace](https://docs.qmk.fm/newbs_external_userspace):
it holds only my keymap, laid out like the QMK repo
(`keyboards/crkbd/keymaps/santi_km/`). QMK builds it in place, so nothing gets
copied into a `qmk_firmware` clone. Compiled firmware lands in this folder
(`crkbd_rev1_santi_km.hex` is the last build I kept).

chezmoi doesn't deploy anything from here.

## One-time setup

```bash
brew install qmk/qmk/qmk   # not in the Brewfile; install when needed
qmk setup                  # clones QMK firmware to ~/qmk_firmware
qmk config user.overlay_dir="$DOTFILES_DIR/qmk"   # point QMK at this folder
```

Optional: `qmk userspace-add -kb crkbd -km santi_km` records the build target
in a `qmk.json` here, so `qmk userspace-compile` builds everything at once.

## Build and flash

```bash
,qmkc    # qmk compile -kb crkbd -km santi_km
,qmkf    # qmk flash   -kb crkbd -km santi_km
```
