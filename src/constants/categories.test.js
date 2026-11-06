import { describe, it, expect } from 'vitest';
import { TRANSACTION_CATEGORIES } from './categories.js';

describe('TRANSACTION_CATEGORIES', () => {
  it('contains essential categories', () => {
    expect(TRANSACTION_CATEGORIES).toContain('food');
    expect(TRANSACTION_CATEGORIES).toContain('salary');
    expect(TRANSACTION_CATEGORIES).toContain('housing');
  });

  it('has at least 5 categories defined', () => {
    expect(TRANSACTION_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });
});
