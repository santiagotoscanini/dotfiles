# Inherits from https://github.com/qmk/qmk_firmware/blob/master/keyboards/crkbd/rules.mk
BOOTLOADER = atmel-dfu

RGB_MATRIX_ENABLE = yes
MOUSEKEY_ENABLE = no

OLED_ENABLE  = yes
OLED_DRIVER = SSD1306
WPM_ENABLE = yes

# Optimizations
LTO_ENABLE = yes
SPACE_CADET_ENABLE = no
GRAVE_ESCAPE_ENABLE = no
# ------------

TAP_DANCE_ENABLE   = yes # Tap dance functionality
