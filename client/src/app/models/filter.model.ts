export type DateFilterPreset = 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';

export interface DateRange {
  from: string;
  to: string;
}

export interface FilterValue {
  preset: DateFilterPreset;
  dateRange: DateRange;
  categoryId: number | null;
  categoryType: 'income' | 'expense' | null;
}