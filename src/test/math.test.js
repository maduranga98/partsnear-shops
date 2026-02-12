import { describe, it, expect } from 'vitest';
import { add, subtract } from '../utils/math';

describe('Math utilities', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should subtract two numbers correctly', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});
