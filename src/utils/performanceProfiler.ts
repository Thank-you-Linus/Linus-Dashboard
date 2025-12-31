/**
 * Performance Profiler for Linus Dashboard
 *
 * Zero-cost abstraction when disabled. Provides hierarchical timing,
 * automatic summary statistics, and integration with console.time/timeEnd.
 *
 * @example
 * // Enable profiling
 * PerformanceProfiler.enable();
 *
 * // Start timing
 * const key = PerformanceProfiler.start('myOperation', { count: 100 });
 *
 * // Do work...
 *
 * // End timing
 * PerformanceProfiler.end(key, { resultCount: 50 });
 *
 * // View summary
 * PerformanceProfiler.printSummary();
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  count: number;
  total: number;
  avg: number;
  min: number;
  max: number;
}

/**
 * Performance profiler singleton class
 */
class PerformanceProfiler {
  private static enabled = false;
  private static metrics: PerformanceMetric[] = [];
  private static timers = new Map<string, number>();

  /**
   * Enable performance profiling
   * Call this before operations you want to measure
   */
  static enable(): void {
    this.enabled = true;
    console.warn('[Perf] Performance profiling ENABLED');
  }

  /**
   * Disable performance profiling
   */
  static disable(): void {
    this.enabled = false;
    console.warn('[Perf] Performance profiling DISABLED');
  }

  /**
   * Check if profiling is enabled
   */
  static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Start timing an operation
   *
   * @param label - Human-readable label for the operation
   * @param metadata - Optional metadata to attach to this measurement
   * @returns Timer key to use with end(), or null if profiling is disabled
   */
  static start(label: string, metadata?: Record<string, any>): string | null {
    if (!this.enabled) return null;

    // Create unique key to support nested/parallel operations
    const key = `${label}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(key, performance.now());

    // Also use console.time for browser DevTools integration
    console.time(`[Perf] ${label}`);

    return key;
  }

  /**
   * End timing an operation
   *
   * @param key - Timer key returned by start()
   * @param metadata - Optional additional metadata to merge
   * @returns Duration in milliseconds, or undefined if profiling is disabled
   */
  static end(key: string | null, metadata?: Record<string, any>): number | undefined {
    if (!this.enabled || !key || !this.timers.has(key)) return undefined;

    const startTime = this.timers.get(key)!;
    const duration = performance.now() - startTime;
    const label = key.split('_')[0];

    // Store metric
    this.metrics.push({
      name: label,
      duration,
      timestamp: Date.now(),
      metadata
    });

    // Log to console
    console.timeEnd(`[Perf] ${label}`);

    // Cleanup
    this.timers.delete(key);

    return duration;
  }

  /**
   * Get summary statistics for all recorded metrics
   * Groups by metric name and computes count, total, avg, min, max
   *
   * @returns Map of metric name to statistics
   */
  static getSummary(): Record<string, PerformanceStats> {
    const summary = new Map<string, PerformanceStats>();

    for (const metric of this.metrics) {
      if (!summary.has(metric.name)) {
        summary.set(metric.name, {
          count: 0,
          total: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity
        });
      }

      const stats = summary.get(metric.name)!;
      stats.count++;
      stats.total += metric.duration;
      stats.min = Math.min(stats.min, metric.duration);
      stats.max = Math.max(stats.max, metric.duration);
    }

    // Compute averages
    for (const stats of summary.values()) {
      stats.avg = stats.total / stats.count;
      // Round to 2 decimal places
      stats.avg = Math.round(stats.avg * 100) / 100;
      stats.total = Math.round(stats.total * 100) / 100;
      stats.min = Math.round(stats.min * 100) / 100;
      stats.max = Math.round(stats.max * 100) / 100;
    }

    return Object.fromEntries(summary);
  }

  /**
   * Print summary statistics to console in table format
   */
  static printSummary(): void {
    const summary = this.getSummary();

    if (Object.keys(summary).length === 0) {
      console.warn('[Perf] No metrics recorded');
      return;
    }

    console.warn('\n[Perf] Performance Summary:');
    console.table(summary);

    // Also print total time
    const total = Object.values(summary).reduce((sum, stats) => sum + stats.total, 0);
    console.warn(`[Perf] Total measured time: ${Math.round(total * 100) / 100}ms\n`);
  }

  /**
   * Get all raw metrics
   * Useful for custom analysis or exporting
   */
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  static getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Clear all recorded metrics and active timers
   */
  static clear(): void {
    this.metrics = [];
    this.timers.clear();
    console.warn('[Perf] Metrics cleared');
  }

  /**
   * Export metrics as JSON string
   * Useful for saving performance data
   */
  static exportJSON(): string {
    return JSON.stringify({
      enabled: this.enabled,
      timestamp: Date.now(),
      summary: this.getSummary(),
      metrics: this.metrics
    }, null, 2);
  }
}

export { PerformanceProfiler };
export type { PerformanceMetric, PerformanceStats };
