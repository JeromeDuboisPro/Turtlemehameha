import { SCORE } from '../../utils/constants';

export type ScoreCallback = (score: number, delta: number) => void;

export class ScoreSystem {
  private score: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private isActive: boolean = false;
  private onScoreChange?: ScoreCallback;

  constructor(onScoreChange?: ScoreCallback) {
    this.onScoreChange = onScoreChange;
  }

  /**
   * Start accumulating score
   * @param power - Current power level (0-100) for multiplier calculation
   */
  public startScoring(power: number): void {
    this.isActive = true;
    // Reset combo timer when starting a new hold
    this.comboTimer = SCORE.COMBO_DECAY;
  }

  /**
   * Stop accumulating score
   */
  public stopScoring(): void {
    this.isActive = false;
  }

  /**
   * Update score based on delta time and current power level
   * @param delta - Time elapsed since last update in milliseconds
   * @param power - Current power level (0-100)
   */
  public update(delta: number, power: number): void {
    const deltaSeconds = delta / 1000;

    if (this.isActive) {
      // Calculate score for this frame
      const powerMultiplier = 1 + (power * SCORE.POWER_MULTIPLIER);
      const comboMultiplier = 1 + (this.combo * 0.1); // 10% per combo level
      const scoreIncrease =
        SCORE.BASE_RATE * deltaSeconds * powerMultiplier * comboMultiplier;

      this.score += scoreIncrease;

      // Notify listeners
      if (this.onScoreChange) {
        this.onScoreChange(this.score, scoreIncrease);
      }

      // Maintain combo timer
      this.comboTimer = SCORE.COMBO_DECAY;
    } else {
      // Decay combo when not active
      this.comboTimer -= deltaSeconds;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboTimer = 0;
      }
    }
  }

  /**
   * Increment combo counter (called when completing a hold)
   */
  public incrementCombo(): void {
    this.combo++;
    this.comboTimer = SCORE.COMBO_DECAY;
  }

  /**
   * Reset combo to zero
   */
  public resetCombo(): void {
    this.combo = 0;
    this.comboTimer = 0;
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return Math.round(this.score);
  }

  /**
   * Get current combo level
   */
  public getCombo(): number {
    return this.combo;
  }

  /**
   * Check if combo is active (has time remaining)
   */
  public hasActiveCombo(): boolean {
    return this.comboTimer > 0 && this.combo > 0;
  }

  /**
   * Get remaining combo time
   */
  public getComboTimeRemaining(): number {
    return Math.max(0, this.comboTimer);
  }

  /**
   * Reset entire score system
   */
  public reset(): void {
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.isActive = false;
  }

  /**
   * Award bonus points (for special events)
   */
  public awardBonus(points: number): void {
    this.score += points;
    if (this.onScoreChange) {
      this.onScoreChange(this.score, points);
    }
  }
}
