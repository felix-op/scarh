export type MemoryUnit = 'B' | 'KB' | 'MB' | 'GB';

export type MemoryView = {
  value: number;
  unit: MemoryUnit;
};
