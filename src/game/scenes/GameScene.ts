import Phaser from 'phaser';
import { ASSETS, SPRITE_CONFIG } from '../../utils/constants';
import { PowerMeter } from '../systems/PowerMeter';
import { ScoreSystem } from '../systems/ScoreSystem';
import { RandomEvents } from '../systems/RandomEvents';

export class GameScene extends Phaser.Scene {
  private turtle?: Phaser.GameObjects.Image;
  private isAnimating: boolean = false;
  private currentStage: number = 0;
  private textDisplay?: Phaser.GameObjects.Text;
  private powerMeter?: PowerMeter;
  private scoreSystem?: ScoreSystem;
  private randomEvents?: RandomEvents;
  private loopingSound?: Phaser.Sound.BaseSound;
  private longSound?: Phaser.Sound.BaseSound;
  private baseScale: number = 1;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    console.log('GameScene: preload() started');
    console.log('Loading turtle images:', ASSETS.IMAGES.TURTLE_SHUT, ASSETS.IMAGES.TURTLE_OPEN_11, ASSETS.IMAGES.TURTLE_OPEN_22, ASSETS.IMAGES.TURTLE_OPEN_45);
    console.log('Loading sounds:', ASSETS.SOUNDS.HIIN_LONG, ASSETS.SOUNDS.HIIN_SHORT);

    // Load individual turtle images
    this.load.image('turtle_shut', ASSETS.IMAGES.TURTLE_SHUT);
    this.load.image('turtle_open_11', ASSETS.IMAGES.TURTLE_OPEN_11);
    this.load.image('turtle_open_22', ASSETS.IMAGES.TURTLE_OPEN_22);
    this.load.image('turtle_open_45', ASSETS.IMAGES.TURTLE_OPEN_45);

    // Load sounds
    this.load.audio('hiin_long', ASSETS.SOUNDS.HIIN_LONG);
    this.load.audio('hiin_short', ASSETS.SOUNDS.HIIN_SHORT);

    // Add load error handlers
    this.load.on('loaderror', (file: any) => {
      console.error('GameScene: Error loading file:', file.key, file.src);
    });

    this.load.on('complete', () => {
      console.log('GameScene: All assets loaded successfully');
    });
  }

  create() {
    console.log('GameScene: create() started');

    // Center the turtle image
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    console.log('GameScene: Camera center:', centerX, centerY);

    // Create the turtle image (start with mouth shut)
    this.turtle = this.add.image(centerX, centerY, 'turtle_shut');
    this.turtle.setInteractive();

    // Create text display (hidden initially)
    this.textDisplay = this.add.text(centerX, centerY - 200, '', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });
    this.textDisplay.setOrigin(0.5);
    this.textDisplay.setVisible(false);

    // Initialize game systems
    this.randomEvents = new RandomEvents(this);

    this.powerMeter = new PowerMeter(
      (power, threshold) => {
        // Threshold reached callback
        console.log(`Threshold reached: ${threshold}% at power ${power}`);

        // Trigger visual effects for this threshold
        if (this.randomEvents && this.turtle) {
          this.randomEvents.triggerThresholdEvents(threshold, this.turtle);
        }

        this.events.emit('threshold_reached', threshold, power);
      },
      (power) => {
        // Power change callback
        this.events.emit('power_changed', power);
      }
    );

    this.scoreSystem = new ScoreSystem((score, delta) => {
      // Score change callback
      this.events.emit('score_changed', score, delta);
    });

    // Make it responsive - fit to screen
    this.fitToScreen();

    // Handle window resize
    this.scale.on('resize', this.fitToScreen, this);

    // Setup input handlers
    this.setupInputHandlers();

    console.log('GameScene: create() completed');
  }

  private fitToScreen() {
    if (!this.turtle) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Calculate scale to fit screen while maintaining aspect ratio
    const scaleX = width / SPRITE_CONFIG.WIDTH;
    const scaleY = height / SPRITE_CONFIG.HEIGHT;
    const scale = Math.min(scaleX, scaleY) * 0.8; // 0.8 for some padding

    // Store base scale for smooth reset animations
    this.baseScale = scale;

    this.turtle.setScale(scale);
    this.turtle.setPosition(centerX, centerY);

    // Position text above turtle
    if (this.textDisplay) {
      this.textDisplay.setPosition(centerX, centerY - (SPRITE_CONFIG.HEIGHT * scale * 0.4));
      // Scale text based on screen size
      const textScale = Math.min(width / 800, height / 600) * 1.2;
      this.textDisplay.setScale(textScale);
    }
  }

  private setupInputHandlers() {
    if (!this.turtle) return;

    // Pointer down (mouse click / touch start)
    this.turtle.on('pointerdown', this.startAnimation, this);
    this.input.on('pointerdown', this.startAnimation, this);

    // Pointer up (mouse release / touch end)
    this.input.on('pointerup', this.stopAnimation, this);
    this.input.on('pointerupoutside', this.stopAnimation, this);

    // Also handle when pointer leaves the game area
    this.input.on('pointerout', this.stopAnimation, this);
  }

  private startAnimation() {
    if (this.isAnimating) return;

    console.log('Starting animation - 3 stage sequence');
    this.isAnimating = true;
    this.currentStage = 1;

    // Start power meter and score system
    if (this.powerMeter) {
      this.powerMeter.startCharging();
    }
    if (this.scoreSystem) {
      this.scoreSystem.startScoring(this.powerMeter?.getPower() || 0);
    }

    // STAGE 1: "Turtle" - slight opening
    if (this.turtle) {
      this.turtle.setTexture('turtle_open_11');
    }

    if (this.textDisplay) {
      this.textDisplay.setText('Turtle');
      this.textDisplay.setVisible(true);

      // Quick pulse for "Turtle"
      this.tweens.add({
        targets: this.textDisplay,
        scaleX: { from: 1.0, to: 1.2 },
        scaleY: { from: 1.0, to: 1.2 },
        duration: 150,
        yoyo: true,
        repeat: -1,
      });
    }

    // Start playing long sound
    this.longSound = this.sound.add('hiin_long');
    this.longSound.play();

    // STAGE 2: "Meeeeh!" - medium opening (after 500ms)
    this.time.delayedCall(500, () => {
      if (!this.isAnimating) return;

      this.currentStage = 2;
      console.log('Stage 2: Meeeeh!');

      if (this.turtle) {
        this.turtle.setTexture('turtle_open_22');
      }

      if (this.textDisplay) {
        this.textDisplay.setText('Meeeeh!');

        // Slower pulse for "Meeeeh!"
        this.tweens.killTweensOf(this.textDisplay);
        this.tweens.add({
          targets: this.textDisplay,
          scaleX: { from: 1.0, to: 1.15 },
          scaleY: { from: 1.0, to: 1.15 },
          duration: 200,
          yoyo: true,
          repeat: -1,
        });
      }
    });

    // STAGE 3: "Ahahahaha!" - full opening with kamehameha (after long sound completes)
    this.longSound.once('complete', () => {
      if (!this.isAnimating) return;

      this.currentStage = 3;
      console.log('Stage 3: Ahahahaha! + looping sound');

      if (this.turtle) {
        this.turtle.setTexture('turtle_open_45');
      }

      if (this.textDisplay) {
        this.textDisplay.setText('Ahahahaha!');

        // Fast energetic pulse for final stage
        this.tweens.killTweensOf(this.textDisplay);
        this.tweens.add({
          targets: this.textDisplay,
          scaleX: { from: 1.0, to: 1.2 },
          scaleY: { from: 1.0, to: 1.2 },
          duration: 120,
          yoyo: true,
          repeat: -1,
        });
      }

      // Start looping short sound
      this.loopingSound = this.sound.add('hiin_short', { loop: true });
      this.loopingSound.play();
    });

    // Emit event for game systems (power meter, score, etc.)
    this.events.emit('animation_started');
  }

  private stopAnimation() {
    if (!this.isAnimating) return;

    console.log('Stopping animation');
    this.isAnimating = false;
    this.currentStage = 0;

    // Stop power meter and score system
    if (this.powerMeter) {
      this.powerMeter.stopCharging();
    }
    if (this.scoreSystem) {
      this.scoreSystem.stopScoring();
      // Increment combo for completing a hold
      this.scoreSystem.incrementCombo();
    }

    // Smoothly de-zoom turtle back to base scale
    if (this.turtle) {
      // Kill any existing scale tweens first
      this.tweens.killTweensOf(this.turtle);

      // Smoothly return to base scale over 0.5 seconds
      this.tweens.add({
        targets: this.turtle,
        scaleX: this.baseScale,
        scaleY: this.baseScale,
        duration: 500,
        ease: 'Back.easeOut',
      });
    }

    // Reset visual effects (color, glow, etc.) without affecting scale
    if (this.randomEvents && this.turtle) {
      this.randomEvents.resetEffects(this.turtle);
    }

    // Hide and stop text animations
    if (this.textDisplay) {
      this.tweens.killTweensOf(this.textDisplay);
      this.textDisplay.setVisible(false);
      this.textDisplay.setScale(1.0); // Reset scale
    }

    // Stop looping sound first (before stopAll)
    if (this.loopingSound) {
      console.log('Stopping looping sound');
      this.loopingSound.stop();
      this.loopingSound.destroy();
      this.loopingSound = undefined;
    }

    // Stop long sound if still playing
    if (this.longSound) {
      this.longSound.stop();
      this.longSound.destroy();
      this.longSound = undefined;
    }

    // Stop all other sounds
    this.sound.stopAll();

    // Reset turtle to shut mouth
    if (this.turtle) {
      this.turtle.setTexture('turtle_shut');
    }

    // Emit event for game systems
    this.events.emit('animation_stopped');
  }

  update(time: number, delta: number) {
    // Update power meter
    if (this.powerMeter) {
      this.powerMeter.update(delta);
    }

    // Update score system
    if (this.scoreSystem && this.powerMeter) {
      this.scoreSystem.update(delta, this.powerMeter.getPower());
    }

    // Game loop - will handle particles, effects here
    if (this.isAnimating) {
      // Update animation/effects based on time
      this.events.emit('animation_update', delta);
    }
  }

  /**
   * Get the power meter instance
   */
  public getPowerMeter(): PowerMeter | undefined {
    return this.powerMeter;
  }

  /**
   * Get the score system instance
   */
  public getScoreSystem(): ScoreSystem | undefined {
    return this.scoreSystem;
  }
}
