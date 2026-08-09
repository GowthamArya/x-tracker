import { Injectable } from '@angular/core';

import { Transaction } from '../models/transaction.model';
import { TransactionsService } from './transactions.service';

export interface CategoryReport {
  category: string;
  amount: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(
    private readonly transactionsService: TransactionsService
  ) {}

  getTotalIncome(): number {
    return this.transactionsService
      .getTransactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce(
        (total, transaction) => total + transaction.amount,
        0
      );
  }

  getTotalExpenses(): number {
    return this.transactionsService
      .getTransactions()
      .filter((transaction) => transaction.type === 'expense')
      .reduce(
        (total, transaction) => total + transaction.amount,
        0
      );
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  getExpenseByCategory(): CategoryReport[] {
    const transactions = this.transactionsService
      .getTransactions()
      .filter(
        (transaction) => transaction.type === 'expense'
      );

    const categoryTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const currentAmount =
        categoryTotals.get(transaction.category) ?? 0;

      categoryTotals.set(
        transaction.category,
        currentAmount + transaction.amount
      );
    }

    const totalExpenses = this.getTotalExpenses();

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpenses > 0
            ? (amount / totalExpenses) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getRecentTransactions(): Transaction[] {
    return this.transactionsService
      .getTransactions()
      .slice(0, 5);
  }
}