import Phaser from 'phaser';
import { ASSETS, SPRITE_CONFIG } from '../../utils/constants';

export class GameScene extends Phaser.Scene {
  private turtle?: Phaser.GameObjects.Sprite;
  private isAnimating: boolean = false;
  private currentFrame: number = 0;
  private textDisplay?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    console.log('GameScene: preload() started');
    console.log('Loading turtle sprite from:', ASSETS.IMAGES.TURTLE_SPRITE);
    console.log('Loading sounds:', ASSETS.SOUNDS.HIIN_LONG, ASSETS.SOUNDS.HIIN_SHORT);

    // Load turtle sprite sheet
    this.load.spritesheet('turtle', ASSETS.IMAGES.TURTLE_SPRITE, {
      frameWidth: SPRITE_CONFIG.WIDTH,
      frameHeight: SPRITE_CONFIG.HEIGHT,
    });

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

    // Center the turtle sprite
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    console.log('GameScene: Camera center:', centerX, centerY);

    // Create sprite animations
    this.anims.create({
      key: 'turtle_idle',
      frames: [{ key: 'turtle', frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'turtle_open',
      frames: [
        { key: 'turtle', frame: 0 },
        { key: 'turtle', frame: 1 },
        { key: 'turtle', frame: 2 },
      ],
      frameRate: 10,
      repeat: 0,
    });

    // Create the turtle sprite
    this.turtle = this.add.sprite(centerX, centerY, 'turtle');
    this.turtle.setInteractive();
    this.turtle.play('turtle_idle');

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

    console.log('Starting animation');
    this.isAnimating = true;

    // Play turtle animation
    if (this.turtle) {
      this.turtle.play('turtle_open');
    }

    // Show first text "Turtle Meeeeh!"
    if (this.textDisplay) {
      this.textDisplay.setText('Turtle Meeeeh!');
      this.textDisplay.setVisible(true);

      // Pulse animation for first text
      this.tweens.add({
        targets: this.textDisplay,
        scaleX: { from: 1.0, to: 1.2 },
        scaleY: { from: 1.0, to: 1.2 },
        duration: 200,
        yoyo: true,
        repeat: -1,
      });
    }

    // Play first sound (long)
    const longSound = this.sound.add('hiin_long');
    longSound.play();

    // After first sound, loop the short sound and change text
    longSound.once('complete', () => {
      if (this.isAnimating) {
        // Change text to "Ahahahaha!"
        if (this.textDisplay) {
          this.textDisplay.setText('Ahahahaha!');

          // Stop old tween and create new faster pulse
          this.tweens.killTweensOf(this.textDisplay);
          this.tweens.add({
            targets: this.textDisplay,
            scaleX: { from: 1.0, to: 1.15 },
            scaleY: { from: 1.0, to: 1.15 },
            duration: 150,
            yoyo: true,
            repeat: -1,
          });
        }

        const shortSound = this.sound.add('hiin_short', { loop: true });
        shortSound.play();
        this.registry.set('loopingSound', shortSound);
      }
    });

    // Emit event for game systems (power meter, score, etc.)
    this.events.emit('animation_started');
  }

  private stopAnimation() {
    if (!this.isAnimating) return;

    console.log('Stopping animation');
    this.isAnimating = false;

    // Hide and stop text animations
    if (this.textDisplay) {
      this.tweens.killTweensOf(this.textDisplay);
      this.textDisplay.setVisible(false);
      this.textDisplay.setScale(1.0); // Reset scale
    }

    // Stop all sounds
    this.sound.stopAll();

    // Also stop the looping sound specifically
    const loopingSound = this.registry.get('loopingSound');
    if (loopingSound) {
      loopingSound.stop();
      this.registry.remove('loopingSound');
    }

    // Reset turtle to idle
    if (this.turtle) {
      this.turtle.play('turtle_idle');
    }

    // Emit event for game systems
    this.events.emit('animation_stopped');
  }

  update(time: number, delta: number) {
    // Game loop - will handle power meter, particles, effects here
    if (this.isAnimating) {
      // Update animation/effects based on time
      this.events.emit('animation_update', delta);
    }
  }
}
