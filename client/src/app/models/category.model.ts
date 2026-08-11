export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  userId: number;
  name: string;
  type: CategoryType;
  createdAt: string;
}