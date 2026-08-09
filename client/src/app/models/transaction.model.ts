export type TransactionType =
  'income' | 'expense';

export interface Transaction {
  id: number;

  userId: number;

  accountId: number;
  categoryId: number;

  title: string;
  amount: number;

  type: TransactionType;

  transactionDate: string;

  notes?: string;

  accountName: string;
  categoryName: string;
}