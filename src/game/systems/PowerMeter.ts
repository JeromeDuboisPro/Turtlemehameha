import { POWER_METER } from '../../utils/constants';

export type PowerMeterCallback = (power: number, threshold: number) => void;

export class PowerMeter {
  private power: number = 0;
  private isCharging: boolean = false;
  private lastThresholdTriggered: number = 0;
  private onThresholdReached?: PowerMeterCallback;
  private onPowerChange?: (power: number) => void;

  constructor(
    onThresholdReached?: PowerMeterCallback,
    onPowerChange?: (power: number) => void
  ) {
    this.onThresholdReached = onThresholdReached;
    this.onPowerChange = onPowerChange;
  }

  /**
   * Start charging the power meter
   */
  public startCharging(): void {
    this.isCharging = true;
  }

  /**
   * Stop charging and start draining
   */
  public stopCharging(): void {
    this.isCharging = false;
  }

  /**
   * Update power level based on delta time
   * @param delta - Time elapsed since last update in milliseconds
   */
  public update(delta: number): void {
    const deltaSeconds = delta / 1000;

    if (this.isCharging) {
      // Increase power while charging
      this.power = Math.min(100, this.power + POWER_METER.FILL_RATE * deltaSeconds);
    } else {
      // Decrease power when not charging
      this.power = Math.max(0, this.power - POWER_METER.DRAIN_RATE * deltaSeconds);
      // Reset threshold tracker when power drops below last threshold
      if (this.power < this.lastThresholdTriggered) {
        this.lastThresholdTriggered = 0;
      }
    }

    // Check for threshold crossings
    this.checkThresholds();

    // Notify listeners of power change
    if (this.onPowerChange) {
      this.onPowerChange(this.power);
    }
  }

  /**
   * Check if any thresholds have been crossed
   */
  private checkThresholds(): void {
    if (!this.onThresholdReached) return;

    for (const threshold of POWER_METER.THRESHOLDS) {
      if (
        this.power >= threshold &&
        this.lastThresholdTriggered < threshold
      ) {
        this.lastThresholdTriggered = threshold;
        this.onThresholdReached(this.power, threshold);
        break; // Only trigger one threshold per update
      }
    }
  }

  /**
   * Get current power level (0-100)
   */
  public getPower(): number {
    return this.power;
  }

  /**
   * Check if currently charging
   */
  public getIsCharging(): boolean {
    return this.isCharging;
  }

  /**
   * Reset power meter to zero
   */
  public reset(): void {
    this.power = 0;
    this.isCharging = false;
    this.lastThresholdTriggered = 0;
  }

  /**
   * Get the next threshold that hasn't been reached yet
   */
  public getNextThreshold(): number | null {
    for (const threshold of POWER_METER.THRESHOLDS) {
      if (threshold > this.lastThresholdTriggered) {
        return threshold;
      }
    }
    return null;
  }

  /**
   * Get progress to next threshold (0-1)
   */
  public getProgressToNextThreshold(): number {
    const nextThreshold = this.getNextThreshold();
    if (nextThreshold === null) return 1;

    const previousThreshold = this.lastThresholdTriggered;
    const range = nextThreshold - previousThreshold;
    const progress = this.power - previousThreshold;

    return Math.max(0, Math.min(1, progress / range));
  }
}
