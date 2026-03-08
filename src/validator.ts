/**
 * Pure validation logic with no VSCode API dependency, making it testable
 * with Vitest. Ported from nb-order-validator (Python).
 */

/**
 * Returns the code-cell-relative indices of cells whose execution order is
 * not consecutive starting from 1.
 *
 * Rules:
 * - Trailing undefined values (unexecuted cells at the end) are stripped
 *   before evaluation and are not considered errors.
 * - After stripping, cell at index i is problematic if its executionOrder
 *   differs from i + 1.
 */
export function getProblematicIndices(
  counts: (number | undefined)[]
): number[] {
  // Business rule from nb-order-validator: it is normal to add new cells at
  // the bottom of a notebook without executing them. Strip trailing undefined
  // values so they are never treated as errors.
  const trimmed = [...counts];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === undefined) {
    trimmed.pop();
  }

  // Per-position check: each cell is evaluated independently against the
  // value it should have at its slot (i + 1). This avoids false positives
  // for cells that happen to sit at the correct position even if the overall
  // sequence is broken elsewhere (e.g. [3, 2, 1] — index 1 has value 2,
  // which is correct for that slot, so it is not flagged).
  const problematic: number[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] !== i + 1) {
      problematic.push(i);
    }
  }
  return problematic;
}

/**
 * Returns true if the execution counts form a consecutive sequence starting
 * from 1 (trailing undefined values are ignored).
 */
export function isConsecutive(counts: (number | undefined)[]): boolean {
  return getProblematicIndices(counts).length === 0;
}
