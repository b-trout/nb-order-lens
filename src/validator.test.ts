import { describe, expect, it } from 'vitest';
import { getProblematicIndices, isConsecutive } from './validator';

describe('getProblematicIndices', () => {
  it('returns empty array for empty input', () => {
    expect(getProblematicIndices([])).toEqual([]);
  });

  it('returns empty array for valid consecutive sequence', () => {
    expect(getProblematicIndices([1, 2, 3, 4])).toEqual([]);
  });

  it('returns empty array for single valid cell', () => {
    expect(getProblematicIndices([1])).toEqual([]);
  });

  it('ignores a single trailing undefined', () => {
    expect(getProblematicIndices([1, 2, 3, undefined])).toEqual([]);
  });

  it('ignores multiple trailing undefineds', () => {
    expect(getProblematicIndices([1, 2, undefined, undefined])).toEqual([]);
  });

  it('returns empty array when all cells are unexecuted', () => {
    expect(getProblematicIndices([undefined, undefined])).toEqual([]);
  });

  it('flags all cells when sequence does not start at 1', () => {
    // [2,3,4]: i=0 -> 2 != 1, i=1 -> 3 != 2, i=2 -> 4 != 3
    expect(getProblematicIndices([2, 3, 4])).toEqual([0, 1, 2]);
  });

  it('flags cells after a gap in the sequence', () => {
    // [1,3,4]: i=0 -> 1=1 ok, i=1 -> 3 != 2, i=2 -> 4 != 3
    expect(getProblematicIndices([1, 3, 4])).toEqual([1, 2]);
  });

  it('flags the cell with undefined in the middle but not ones that coincidentally match', () => {
    // [1,undefined,3]: i=0 -> 1=1 ok, i=1 -> undefined != 2, i=2 -> 3=3 ok
    expect(getProblematicIndices([1, undefined, 3])).toEqual([1]);
  });

  it('flags cells whose value does not match their expected position', () => {
    // [3,2,1]: i=0 -> 3 != 1, i=1 -> 2=2 ok, i=2 -> 1 != 3
    expect(getProblematicIndices([3, 2, 1])).toEqual([0, 2]);
  });

  it('flags cells with duplicate execution order', () => {
    // [1,1,2]: i=0 -> 1=1 ok, i=1 -> 1 != 2, i=2 -> 2 != 3
    expect(getProblematicIndices([1, 1, 2])).toEqual([1, 2]);
  });

  it('detects errors before a trailing undefined', () => {
    // [1,3,undefined]: trim -> [1,3], i=0 -> 1=1 ok, i=1 -> 3 != 2
    expect(getProblematicIndices([1, 3, undefined])).toEqual([1]);
  });
});

describe('isConsecutive', () => {
  it('returns true for empty input', () => {
    expect(isConsecutive([])).toBe(true);
  });

  it('returns true for a valid consecutive sequence', () => {
    expect(isConsecutive([1, 2, 3])).toBe(true);
  });

  it('returns true for a consecutive sequence with a trailing undefined', () => {
    expect(isConsecutive([1, 2, undefined])).toBe(true);
  });

  it('returns false when there is a gap', () => {
    expect(isConsecutive([1, 3])).toBe(false);
  });

  it('returns false when sequence does not start at 1', () => {
    expect(isConsecutive([2, 3])).toBe(false);
  });
});
