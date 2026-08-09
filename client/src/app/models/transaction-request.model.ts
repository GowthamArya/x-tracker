import { TransactionType } from './transaction.model';

export interface TransactionRequest {
  accountId: number;
  categoryId: number;
  title: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  notes?: string;
}