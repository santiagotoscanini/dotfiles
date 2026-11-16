uint32_t anim_timer = 0;
uint32_t anim_sleep = 0;

uint8_t current_frame = 0;

bool isJumping  = false;
bool showedJump = true;

# define ANIM_FRAME_DURATION 200  // how long each frame lasts in ms
# define ANIM_SIZE           16   // number of bytes in array. If you change sprites, minimize for adequate firmware size. max is 1024

void render_dino(void) {
    static const char PROGMEM walk[2][ANIM_SIZE] = {
        {
            0x80, 0x81, 0x82, 0x83, 0x84,
            0xa0, 0xa1, 0xa2, 0xa3, 0xa4,
            0xc0, 0xc1, 0xc4, 0x80, 0x80,
            0
        },
        {
            0x80, 0x81, 0x82, 0x83, 0x84,
            0xa0, 0xa1, 0xa2, 0xa3, 0xa4,
            0xc0, 0xc3, 0xc2, 0x80, 0x80,
            0
        }
    };
    // static const char PROGMEM stand[1] = {
    //     0x80, 0x81, 0x82, 0x83, 0x84,
    //     0xa0, 0xa1, 0xa2, 0xa3, 0xa4,
    //     0xc0, 0xc1, 0xc2, 0x80, 0x80,
    //     0
    // };

    void animate_dino(void) {
        // TODO(santiagotoscanini): if is jumping show jump animation

        current_frame = (current_frame + 1) % 2;
        oled_write_P(walk[abs(1 - current_frame)], ANIM_SIZE);
    }

    if (get_current_wpm() != 000) {
        oled_on(); // not essential but turns on animation OLED with any alpha keypress
        if (timer_elapsed32(anim_timer) > ANIM_FRAME_DURATION) {
            anim_timer = timer_read32();
            oled_clear();
            animate_dino();
        }
        anim_sleep = timer_read32();
    } else {
        if (timer_elapsed32(anim_sleep) > OLED_TIMEOUT) {
            oled_off();
        } else if (timer_elapsed32(anim_timer) > ANIM_FRAME_DURATION) {
            anim_timer = timer_read32();
            oled_clear();
            animate_dino();
        }
    }

        // anim_timer = timer_read32();
        // oled_write_raw_P(get_u8_str(anim_timer, ' '), false);

    /* this fixes the screen on and off bug */
    // if (get_current_wpm() > 0) {
    //     oled_on();
    //     anim_sleep = timer_read32();
    // } else if (timer_elapsed32(anim_sleep) > OLED_TIMEOUT) {
    //     oled_off();
    // }
}


// And this on the process_record_user
/*
      case KC_SPC:
        if (record->event.pressed) {
            isJumping  = true;
            showedJump = false;
        } else {
            isJumping = false;
        }
        break;
*/