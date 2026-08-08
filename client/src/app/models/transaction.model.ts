export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  account: string;
  date: string;
  notes?: string;
}