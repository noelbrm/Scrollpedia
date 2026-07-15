export function distributeBatchTargets(
  total: number,
  batchCount: number,
): number[] {
  if (total <= 0 || batchCount <= 0) {
    return [];
  }

  const baseSize = Math.floor(total / batchCount);
  const remainder = total % batchCount;

  return Array.from(
    { length: Math.min(total, batchCount) },
    (_, index) => baseSize + (index < remainder ? 1 : 0),
  );
}

export function interleaveBatches<T>(batches: T[][]): T[] {
  const result: T[] = [];
  const longestBatch = Math.max(0, ...batches.map((batch) => batch.length));

  for (let index = 0; index < longestBatch; index += 1) {
    for (const batch of batches) {
      const item = batch[index];

      if (item !== undefined) {
        result.push(item);
      }
    }
  }

  return result;
}
