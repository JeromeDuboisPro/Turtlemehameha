import Phaser from 'phaser';
import { EVENTS } from '../../utils/constants';

export type EventTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';

export class RandomEvents {
  private scene: Phaser.Scene;
  private activeEffects: Set<string> = new Set();
  private currentTier: EventTier | null = null;
  private originalColor: number = 0xffffff;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Trigger events when a threshold is reached
   */
  public triggerThresholdEvents(threshold: number, target?: Phaser.GameObjects.Image): void {
    const tier = this.getTierForThreshold(threshold);
    if (!tier || !target) return;

    console.log(`Triggering ${tier} events for threshold ${threshold}`);
    this.currentTier = tier;

    const effects = EVENTS[tier].EFFECTS;

    // Apply each effect
    effects.forEach((effect) => {
      this.applyEffect(effect, target, tier);
    });
  }

  /**
   * Get the tier corresponding to a threshold
   */
  private getTierForThreshold(threshold: number): EventTier | null {
    if (threshold === 25) return 'TIER_1';
    if (threshold === 50) return 'TIER_2';
    if (threshold === 75) return 'TIER_3';
    if (threshold === 100) return 'TIER_4';
    return null;
  }

  /**
   * Apply a specific visual effect
   */
  private applyEffect(effect: string, target: Phaser.GameObjects.Image, tier: EventTier): void {
    switch (effect) {
      case 'color_shift':
        this.applyColorShift(target, 0x3498db); // Blue tint
        break;
      case 'size_change':
        this.applySizeChange(target, 1.1);
        break;
      case 'glow_effect':
        this.applyGlowEffect(target, 0xf39c12); // Orange glow
        break;
      case 'golden_transform':
        this.applyGoldenTransform(target);
        break;
      case 'small_particles':
        this.createParticles(target, 10, 0x3498db);
        break;
      case 'medium_particles':
        this.createParticles(target, 20, 0x2ecc71);
        break;
      case 'large_particles':
        this.createParticles(target, 30, 0xf39c12);
        break;
      case 'explosion_particles':
        this.createExplosion(target);
        break;
      case 'screen_shake_light':
        this.shakeScreen(50, 0.002);
        break;
      case 'screen_shake_medium':
        this.shakeScreen(100, 0.004);
        break;
      case 'screen_shake_heavy':
        this.shakeScreen(200, 0.008);
        break;
      case 'audio_pitch_1':
      case 'audio_pitch_2':
      case 'audio_pitch_3':
      case 'audio_pitch_max':
        // Audio pitch effects would be handled in GameScene
        this.scene.events.emit('audio_pitch_change', effect);
        break;
      case 'beam_rainbow':
        this.applyRainbowEffect(target);
        break;
      default:
        console.warn(`Unknown effect: ${effect}`);
    }

    this.activeEffects.add(effect);
  }

  /**
   * Apply color tint to target
   */
  private applyColorShift(target: Phaser.GameObjects.Image, color: number): void {
    this.scene.tweens.add({
      targets: target,
      tint: color,
      duration: 300,
      ease: 'Power2',
    });
  }

  /**
   * Apply size change to target
   */
  private applySizeChange(target: Phaser.GameObjects.Image, scale: number): void {
    const currentScale = target.scale;
    this.scene.tweens.add({
      targets: target,
      scaleX: currentScale * scale,
      scaleY: currentScale * scale,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Apply glow effect to target
   */
  private applyGlowEffect(target: Phaser.GameObjects.Image, color: number): void {
    // Create a pulsing glow effect
    this.scene.tweens.add({
      targets: target,
      alpha: 0.8,
      duration: 200,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        target.setAlpha(1);
      },
    });

    target.setTint(color);
  }

  /**
   * Apply golden transformation
   */
  private applyGoldenTransform(target: Phaser.GameObjects.Image): void {
    // Golden color with pulsing effect
    target.setTint(0xffd700); // Gold color

    this.scene.tweens.add({
      targets: target,
      scaleX: { from: target.scale, to: target.scale * 1.15 },
      scaleY: { from: target.scale, to: target.scale * 1.15 },
      alpha: { from: 1, to: 0.9 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Create particle effects around target
   */
  private createParticles(target: Phaser.GameObjects.Image, count: number, color: number): void {
    const particles = this.scene.add.particles(0, 0, 'turtle_shut', {
      x: target.x,
      y: target.y,
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      gravityY: 100,
      quantity: 1,
      tint: color,
    });

    // Emit particles
    particles.explode(count);

    // Clean up after animation
    this.scene.time.delayedCall(1500, () => {
      particles.destroy();
    });
  }

  /**
   * Create explosion effect
   */
  private createExplosion(target: Phaser.GameObjects.Image): void {
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

    colors.forEach((color, index) => {
      this.scene.time.delayedCall(index * 50, () => {
        const particles = this.scene.add.particles(0, 0, 'turtle_shut', {
          x: target.x,
          y: target.y,
          speed: { min: 100, max: 300 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.2, end: 0 },
          blendMode: 'ADD',
          lifespan: 1500,
          gravityY: 150,
          quantity: 1,
          tint: color,
        });

        particles.explode(20);

        this.scene.time.delayedCall(2000, () => {
          particles.destroy();
        });
      });
    });
  }

  /**
   * Shake the camera
   */
  private shakeScreen(duration: number, intensity: number): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  /**
   * Apply rainbow cycling effect
   */
  private applyRainbowEffect(target: Phaser.GameObjects.Image): void {
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    let colorIndex = 0;

    const rainbowTween = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        target.setTint(colors[colorIndex]);
        colorIndex = (colorIndex + 1) % colors.length;
      },
      loop: true,
    });

    // Store for cleanup
    this.scene.registry.set('rainbowEffect', rainbowTween);
  }

  /**
   * Reset all active effects
   */
  public resetEffects(target?: Phaser.GameObjects.Image): void {
    if (target) {
      // Stop all tweens on target
      this.scene.tweens.killTweensOf(target);

      // Reset visual properties
      target.setTint(this.originalColor);
      target.setAlpha(1);

      // Stop rainbow effect if active
      const rainbowEffect = this.scene.registry.get('rainbowEffect');
      if (rainbowEffect) {
        rainbowEffect.destroy();
        this.scene.registry.remove('rainbowEffect');
      }
    }

    // Clear active effects
    this.activeEffects.clear();
    this.currentTier = null;
  }

  /**
   * Get current active tier
   */
  public getCurrentTier(): EventTier | null {
    return this.currentTier;
  }

  /**
   * Check if an effect is active
   */
  public isEffectActive(effect: string): boolean {
    return this.activeEffects.has(effect);
  }
}
