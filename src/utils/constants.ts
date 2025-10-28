// Asset paths
export const ASSETS = {
  IMAGES: {
    TURTLE_SPRITE: '/assets/images/turtle_head_mouth_sprite.png',
    TURTLE_SHUT: '/assets/images/turtle_head_mouth_shut.png',
    TURTLE_OPEN_11: '/assets/images/turtle_head_mouth_open_11.png',
    TURTLE_OPEN_22: '/assets/images/turtle_head_mouth_open_22.png',
    TURTLE_OPEN_45: '/assets/images/turtle_head_mouth_open_45.png',
  },
  SOUNDS: {
    HIIN_LONG: '/assets/sounds/hiiin-long.ogg',
    HIIN_SHORT: '/assets/sounds/hiiin-short.ogg',
  },
};

// Sprite configuration
export const SPRITE_CONFIG = {
  WIDTH: 752,
  HEIGHT: 528,
  FRAMES: 3, // shut, opening, fully open
};

// Game mechanics
export const POWER_METER = {
  FILL_RATE: 20, // % per second
  DRAIN_RATE: 10, // % per second when not holding
  THRESHOLDS: [25, 50, 75, 100], // Event trigger points
};

export const SCORE = {
  BASE_RATE: 10, // Points per second
  POWER_MULTIPLIER: 0.02, // Multiplier per % of power
  COMBO_DECAY: 0.5, // Seconds before combo resets
};

// Audio configuration
export const AUDIO = {
  LONG_SOUND_DURATION: 1.537, // seconds
  FADE_IN: 0.1,
  FADE_OUT: 0.2,
};

// Random events configuration
export const EVENTS = {
  TIER_1: {
    THRESHOLD: 25,
    EFFECTS: ['color_shift', 'small_particles', 'audio_pitch_1'],
  },
  TIER_2: {
    THRESHOLD: 50,
    EFFECTS: ['size_change', 'medium_particles', 'audio_pitch_2', 'screen_shake_light'],
  },
  TIER_3: {
    THRESHOLD: 75,
    EFFECTS: ['glow_effect', 'large_particles', 'audio_pitch_3', 'screen_shake_medium'],
  },
  TIER_4: {
    THRESHOLD: 100,
    EFFECTS: ['golden_transform', 'explosion_particles', 'audio_pitch_max', 'screen_shake_heavy', 'beam_rainbow'],
  },
};
