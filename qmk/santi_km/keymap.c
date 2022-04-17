#include QMK_KEYBOARD_H

extern keymap_config_t keymap_config;
extern uint8_t is_master;

// Each layer gets a name for readability, which is then used in the keymap matrix below.
// The underscores don't mean anything - you can have a layer called STUFF or any other name.
// Layer names don't all need to be of the same length, obviously, and you can also skip them
// entirely and just use numbers.
enum layers {
  _QWERTY,
  _LOWER,
  _RAISE,
  _ADJUST
};

// Custom keycodes for layer keys
// Dual function escape with left command
enum custom_keycodes {
  QWERTY = SAFE_RANGE,
    LOWER,
    RAISE,
    ADJUST,
    MACRO1,
    MACRO2
};

// Tap Dance definitions
enum {
  TD_CAPLOCK,
  TD_ALT,
  // TD_SEMICOLON,
  // TD_QUOTES,
  // TD_SLASH,
  // TD_JJ,
};
qk_tap_dance_action_t tap_dance_actions[] = {
  [TD_CAPLOCK] =   ACTION_TAP_DANCE_DOUBLE(KC_LSFT, KC_CAPS),
  [TD_ALT] =       ACTION_TAP_DANCE_DOUBLE(KC_RALT, KC_LALT),
  // [TD_SEMICOLON] = ACTION_TAP_DANCE_DOUBLE(KC_SCLN, LSFT(KC_SCLN)),
  // [TD_QUOTES] =    ACTION_TAP_DANCE_DOUBLE(KC_QUOT, LSFT(KC_QUOT)),
  // [TD_SLASH] =     ACTION_TAP_DANCE_DOUBLE(KC_SLSH, LSFT(KC_SLSH)),
  // [TD_JJ] =        ACTION_TAP_DANCE_DOUBLE(KC_J,    KC_ESC),
};

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
  [_QWERTY] = LAYOUT(
      //|-----------------------------------------------------|                    |-----------------------------------------------------|
         KC_TAB,         KC_Q,   KC_W,    KC_E,    KC_R,    KC_T,                 KC_Y,    KC_U, KC_I,    KC_O,   KC_P,    KC_BSPC,
      //---------+--------+--------+--------+--------+--------|                    |--------+--------+--------+--------+--------+--------|
         KC_LCTL,        KC_A,   KC_S,    KC_D,    KC_F,    KC_G,                 KC_H,    KC_J, KC_K,    KC_L,   KC_SCLN, KC_QUOT,
      //---------+--------+--------+--------+--------+--------|                    |--------+--------+--------+--------+--------+--------|
         TD(TD_CAPLOCK), KC_Z,   KC_X,    KC_C,    KC_V,    KC_B,                 KC_N,    KC_M, KC_COMM, KC_DOT, KC_SLSH, KC_ESC,
      //---------+--------+--------+--------+--------+--------+--------|  |--------+--------+--------+--------+--------+--------+--------|
                                             KC_LGUI, LOWER, KC_SPC,           KC_ENT, RAISE, TD(TD_ALT)
                                            //|------------------------|  |----------------------------/
  ),

  [_LOWER] = LAYOUT(
      //|-----------------------------------------------------|                 |-----------------------------------------------------|
         KC_TAB,         KC_1,  KC_2,  KC_3,  KC_4,  KC_5,                      KC_6,    KC_7,    KC_8,    KC_9,    KC_0,    KC_BSPC,
      //|--------+--------+--------+--------+--------+--------|                 |--------+--------+--------+--------+--------+--------|
         KC_LCTL,        KC_F1, KC_F2, KC_F3, KC_F4, KC_F5,                     KC_LEFT, KC_DOWN, KC_UP,   KC_RGHT, KC_UP,   XXXXXXX,
      //|--------+--------+--------+--------+--------+--------|                 |--------+--------+--------+--------+--------+--------|
         TD(TD_CAPLOCK), KC_F6, KC_F7, KC_F8, KC_F9, KC_F10,                    KC_F11,  KC_F12,  XXXXXXX, KC_LEFT, KC_DOWN, KC_RGHT,
      //|--------+--------+--------+--------+--------+--------+--------|  |--------+--------+--------+--------+--------+--------+--------|
                                             KC_LGUI, _______, KC_SPC,       KC_ENT, ADJUST, TD(TD_ALT)
                                            //|------------------------|  |----------------------------|
  ),

  [_RAISE] = LAYOUT(
      //|-----------------------------------------------------|                   |-----------------------------------------------------|
         KC_TAB,         KC_EXLM, KC_AT,   KC_HASH, KC_DLR,  KC_PERC,               KC_CIRC, KC_AMPR, KC_ASTR, KC_LPRN, KC_RPRN, KC_BSPC,
      //|--------+--------+--------+--------+--------+--------|                   |--------+--------+--------+--------+--------+--------|
         KC_LCTL,        XXXXXXX, XXXXXXX, XXXXXXX, XXXXXXX, MACRO1,                KC_MINS, KC_EQL,  KC_LBRC, KC_RBRC, KC_BSLS, KC_GRV,
      //|--------+--------+--------+--------+--------+--------|                   |--------+--------+--------+--------+--------+--------|
         TD(TD_CAPLOCK), XXXXXXX, XXXXXXX, XXXXXXX, XXXXXXX, MACRO2,                KC_UNDS, KC_PLUS, KC_LCBR, KC_RCBR, KC_PIPE, KC_TILD,
      //|--------+--------+--------+--------+--------+--------+--------|  |--------+--------+--------+--------+--------+--------+--------|
                                             KC_LGUI, ADJUST, KC_SPC,       KC_ENT, _______, TD(TD_ALT)
                                            //|------------------------|  |----------------------------|
  ),

  [_ADJUST] = LAYOUT(
      //|-----------------------------------------------------|                    |-----------------------------------------------------|
         RESET, XXXXXXX,  XXXXXXX, XXXXXXX, XXXXXXX,  KC_SLEP,                       KC_BTN1, XXXXXXX,  XXXXXXX, XXXXXXX, KC_VOLD, KC_VOLU,
      //|-----------------------------------------------------|                    |-----------------------------------------------------|
         RGB_TOG, RGB_HUI, RGB_SAI, RGB_VAI, XXXXXXX, KC_MPLY,                       KC_MS_L, KC_MS_D,  KC_MS_U, KC_MS_R, KC_BRID, KC_BRIU,
      //|-----------------------------------------------------|                    |-----------------------------------------------------|
         RGB_MOD, RGB_HUD, RGB_SAD, RGB_VAD, XXXXXXX, KC_PSCR,                       KC_WH_R, KC_WH_U,  KC_WH_D, KC_WH_L, KC_MPRV, KC_MNXT,
      //|--------+--------+--------+--------+--------+--------+--------|  |--------+--------+--------+--------+--------+--------+--------|
                                             KC_LGUI, _______, KC_SPC,       KC_ENT, _______, TD(TD_ALT)
                                            //|------------------------|  |----------------------------|
  )
};




#ifdef OLED_ENABLE

oled_rotation_t oled_init_user(oled_rotation_t rotation) {
  return OLED_ROTATION_270;
}

void render_space(void) {
  oled_write_P(PSTR("     "), false);
}

void render_mod_status_gui_alt(uint8_t modifiers) {
  static const char PROGMEM gui_off_1[] = { 0x85, 0x86, 0 };
  static const char PROGMEM gui_off_2[] = { 0xa5, 0xa6, 0 };
  static const char PROGMEM gui_on_1[] = { 0x8d, 0x8e, 0 };
  static const char PROGMEM gui_on_2[] = { 0xad, 0xae, 0 };

  static const char PROGMEM alt_off_1[] = { 0x87, 0x88, 0 };
  static const char PROGMEM alt_off_2[] = { 0xa7, 0xa8, 0 };
  static const char PROGMEM alt_on_1[] = { 0x8f, 0x90, 0 };
  static const char PROGMEM alt_on_2[] = { 0xaf, 0xb0, 0 };

  // fillers between the modifier icons bleed into the icon frames
  static const char PROGMEM off_off_1[] = { 0xc5, 0 };
  static const char PROGMEM off_off_2[] = { 0xc6, 0 };
  static const char PROGMEM on_off_1[] = { 0xc7, 0 };
  static const char PROGMEM on_off_2[] = { 0xc8, 0 };
  static const char PROGMEM off_on_1[] = { 0xc9, 0 };
  static const char PROGMEM off_on_2[] = { 0xca, 0 };
  static const char PROGMEM on_on_1[] = { 0xcb, 0 };
  static const char PROGMEM on_on_2[] = { 0xcc, 0 };

  if (modifiers & MOD_MASK_GUI) {
    oled_write_P(gui_on_1, false);
  } else {
    oled_write_P(gui_off_1, false);
  }

  if ((modifiers & MOD_MASK_GUI) && (modifiers & MOD_MASK_ALT)) {
    oled_write_P(on_on_1, false);
  } else if (modifiers & MOD_MASK_GUI) {
    oled_write_P(on_off_1, false);
  } else if (modifiers & MOD_MASK_ALT) {
    oled_write_P(off_on_1, false);
  } else {
    oled_write_P(off_off_1, false);
  }

  if (modifiers & MOD_MASK_ALT) {
    oled_write_P(alt_on_1, false);
  } else {
    oled_write_P(alt_off_1, false);
  }

  if (modifiers & MOD_MASK_GUI) {
    oled_write_P(gui_on_2, false);
  } else {
    oled_write_P(gui_off_2, false);
  }

  if (modifiers & MOD_MASK_GUI & MOD_MASK_ALT) {
    oled_write_P(on_on_2, false);
  } else if (modifiers & MOD_MASK_GUI) {
    oled_write_P(on_off_2, false);
  } else if (modifiers & MOD_MASK_ALT) {
    oled_write_P(off_on_2, false);
  } else {
    oled_write_P(off_off_2, false);
  }

  if (modifiers & MOD_MASK_ALT) {
    oled_write_P(alt_on_2, false);
  } else {
    oled_write_P(alt_off_2, false);
  }
}

void render_mod_status_ctrl_shift(uint8_t modifiers) {
  static const char PROGMEM ctrl_off_1[] = { 0x89, 0x8a, 0 };
  static const char PROGMEM ctrl_off_2[] = { 0xa9, 0xaa, 0 };
  static const char PROGMEM ctrl_on_1[] = { 0x91, 0x92, 0 };
  static const char PROGMEM ctrl_on_2[] = { 0xb1, 0xb2, 0 };

  static const char PROGMEM shift_off_1[] = { 0x8b, 0x8c, 0 };
  static const char PROGMEM shift_off_2[] = { 0xab, 0xac, 0 };
  static const char PROGMEM shift_on_1[] = { 0xcd, 0xce, 0 };
  static const char PROGMEM shift_on_2[] = { 0xcf, 0xd0, 0 };

  // fillers between the modifier icons bleed into the icon frames
  static const char PROGMEM off_off_1[] = { 0xc5, 0 };
  static const char PROGMEM off_off_2[] = { 0xc6, 0 };
  static const char PROGMEM on_off_1[] = { 0xc7, 0 };
  static const char PROGMEM on_off_2[] = { 0xc8, 0 };
  static const char PROGMEM off_on_1[] = { 0xc9, 0 };
  static const char PROGMEM off_on_2[] = { 0xca, 0 };
  static const char PROGMEM on_on_1[] = { 0xcb, 0 };
  static const char PROGMEM on_on_2[] = { 0xcc, 0 };

  if (modifiers & MOD_MASK_CTRL) {
    oled_write_P(ctrl_on_1, false);
  } else {
    oled_write_P(ctrl_off_1, false);
  }

  if ((modifiers & MOD_MASK_CTRL) && (modifiers & MOD_MASK_SHIFT)) {
    oled_write_P(on_on_1, false);
  } else if (modifiers & MOD_MASK_CTRL) {
    oled_write_P(on_off_1, false);
  } else if (modifiers & MOD_MASK_SHIFT) {
    oled_write_P(off_on_1, false);
  } else {
    oled_write_P(off_off_1, false);
  }

  if ((modifiers & MOD_MASK_SHIFT)|| (host_keyboard_leds() & (1 << USB_LED_CAPS_LOCK))) {
    oled_write_P(shift_on_1, false);
  } else {
    oled_write_P(shift_off_1, false);
  }

  if (modifiers & MOD_MASK_CTRL) {
    oled_write_P(ctrl_on_2, false);
  } else {
    oled_write_P(ctrl_off_2, false);
  }

  if (modifiers & MOD_MASK_CTRL & MOD_MASK_SHIFT) {
    oled_write_P(on_on_2, false);
  } else if (modifiers & MOD_MASK_CTRL) {
    oled_write_P(on_off_2, false);
  } else if (modifiers & MOD_MASK_SHIFT) {
    oled_write_P(off_on_2, false);
  } else {
    oled_write_P(off_off_2, false);
  }

  if ((modifiers & MOD_MASK_SHIFT)|| (host_keyboard_leds() & (1 << USB_LED_CAPS_LOCK))) {
    oled_write_P(shift_on_2, false);
  } else {
    oled_write_P(shift_off_2, false);
  }
}

void render_logo(void) {
  static const char PROGMEM corne_logo[] = { 0x80, 0x81, 0x82, 0x83, 0x84, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0 };
  oled_write_P(corne_logo, false);
  oled_write_P(PSTR("santi"), false);
}

void render_layer_state(void) {
  static const char PROGMEM default_layer[] = { 0x20, 0x94, 0x95, 0x96, 0x20, 0x20, 0xb4, 0xb5, 0xb6, 0x20, 0x20, 0xd4, 0xd5, 0xd6, 0x20, 0 };
  static const char PROGMEM raise_layer[] = { 0x20, 0x97, 0x98, 0x99, 0x20, 0x20, 0xb7, 0xb8, 0xb9, 0x20, 0x20, 0xd7, 0xd8, 0xd9, 0x20, 0 };
  static const char PROGMEM lower_layer[] = { 0x20, 0x9a, 0x9b, 0x9c, 0x20, 0x20, 0xba, 0xbb, 0xbc, 0x20, 0x20, 0xda, 0xdb, 0xdc, 0x20, 0 };
  static const char PROGMEM adjust_layer[] = { 0x20, 0x9d, 0x9e, 0x9f, 0x20, 0x20, 0xbd, 0xbe, 0xbf, 0x20, 0x20, 0xdd, 0xde, 0xdf, 0x20, 0 };

  if (layer_state_is(_ADJUST)) {
    oled_write_P(adjust_layer, false);
  } else if (layer_state_is(_LOWER)) {
    oled_write_P(lower_layer, false);
  } else if (layer_state_is(_RAISE)) {
    oled_write_P(raise_layer, false);
  } else {
    oled_write_P(default_layer, false);
  }
}

void render_wpm(void) {
    // (char *data, invert)
    // invert = true  => if bit is true, write inverted
    oled_write_P(PSTR(" WPM  "), false);
    oled_write(
        // converts uint8_t into char array
        // A padding character may be specified
        // ' ' for leading spaces, '0' for leading zeros.
        get_u8_str(get_current_wpm(), ' '),
        false
    );
}

void render_screen(void) {
  // Renders the current keyboard state (layer, lock, caps, scroll, etc)
  render_logo();
  render_space();
  render_layer_state();
  render_space();
  render_mod_status_gui_alt(get_mods() | get_oneshot_mods());
  render_mod_status_ctrl_shift(get_mods() | get_oneshot_mods());
  render_space();
  render_wpm();
}

bool oled_task_user(void) {
  if (timer_elapsed32(timer_read32()) > 1500000) {
    oled_off();
    return false;
  }
  oled_on(); // not essential but turns on animation OLED with any alpha keypress

  if (is_master) {
    render_screen();
  } else {
    render_screen();
  }

  return false;
}

#endif




int RGB_current_mode;

void rgb_matrix_indicators_user(void) {
  #ifdef RGB_MATRIX_ENABLE
  switch (biton32(layer_state)) {
      case _RAISE:
        for (int i = 0; i < DRIVER_LED_TOTAL; i++) {
          rgb_matrix_set_color(i, 255, 0, 0);
        }
        break;

      case _LOWER:
        for (int i = 0; i < DRIVER_LED_TOTAL; i++) {
          rgb_matrix_set_color(i, 0, 0, 255);
        }
        break;

      default:
        if (host_keyboard_leds() & (1 << USB_LED_CAPS_LOCK)) {
          for (int i = 0; i < DRIVER_LED_TOTAL; i++) {
            rgb_matrix_set_color(i, 0, 255, 0);
          }
        }
        break;
  }
  #endif
}

void update_tri_layer_RGB(uint8_t layer1, uint8_t layer2, uint8_t layer3) {
    // Setting ADJUST layer RGB back to default
    if (IS_LAYER_ON(layer1) && IS_LAYER_ON(layer2)) {
        layer_on(layer3);
    } else {
        layer_off(layer3);
    }
}

bool process_record_user(uint16_t keycode, keyrecord_t * record) {
  if (record -> event.pressed) {
    #ifdef OLED_DRIVER_ENABLE
    oled_timer = timer_read32();
    #endif
    // set_timelog();
  }

  switch (keycode) {
      case LOWER:
        if (record -> event.pressed) {
          layer_on(_LOWER);
          update_tri_layer_RGB(_LOWER, _RAISE, _ADJUST);
        } else {
          layer_off(_LOWER);
          update_tri_layer_RGB(_LOWER, _RAISE, _ADJUST);
        }
        return false;
      case RAISE:
        if (record -> event.pressed) {
          layer_on(_RAISE);
          update_tri_layer_RGB(_LOWER, _RAISE, _ADJUST);
        } else {
          layer_off(_RAISE);
          update_tri_layer_RGB(_LOWER, _RAISE, _ADJUST);
        }
        return false;
      case ADJUST:
        if (record -> event.pressed) {
          layer_on(_ADJUST);
        } else {
          layer_off(_ADJUST);
        }
        return false;
      case MACRO1:
        if (record -> event.pressed) {
          SEND_STRING("Macro 1 text:\nsanti");
        }
        return false;
      case MACRO2:
        if (record -> event.pressed) {
          SEND_STRING("Macro 2 text:\nsanti");
        }
        return false;

        #ifdef RGB_MATRIX_ENABLE
        if (record -> event.pressed) {
          eeconfig_update_rgb_matrix_default();
          rgb_matrix_enable();
        }
        #endif

        break;
  }
  return true;
}

#ifdef RGB_MATRIX_ENABLE

void suspend_power_down_user(void) {
  rgb_matrix_set_suspend_state(true);
}

void suspend_wakeup_init_user(void) {
  rgb_matrix_set_suspend_state(false);
}

#endif
