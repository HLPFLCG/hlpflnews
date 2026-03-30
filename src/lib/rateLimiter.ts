export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private lastRefill: number;
  private queue: Array<{ resolve: () => void }> = [];
  private draining = false;

  constructor(maxTokens = 50, refillPerSecond = 1 / 1.2) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.refillRate = refillPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  get remaining(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push({ resolve });
      this.drain();
    });
  }

  private async drain() {
    if (this.draining) return;
    this.draining = true;
    while (this.queue.length > 0) {
      await new Promise((r) => setTimeout(r, 500));
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        const item = this.queue.shift();
        item?.resolve();
      }
    }
    this.draining = false;
  }
}

export const finnhubLimiter = new RateLimiter(50, 1 / 1.2);
