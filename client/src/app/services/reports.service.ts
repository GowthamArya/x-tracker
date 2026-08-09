import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

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

  getTotalIncome(): Observable<number> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) =>
          transactions
            .filter(
              (transaction) =>
                transaction.type === 'income'
            )
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0
            )
        )
      );
  }

  getTotalExpenses(): Observable<number> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) =>
          transactions
            .filter(
              (transaction) =>
                transaction.type === 'expense'
            )
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0
            )
        )
      );
  }

  getBalance(): Observable<number> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) => {
          const income = transactions
            .filter(
              (transaction) =>
                transaction.type === 'income'
            )
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0
            );

          const expenses = transactions
            .filter(
              (transaction) =>
                transaction.type === 'expense'
            )
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0
            );

          return income - expenses;
        })
      );
  }

  getExpenseByCategory(): Observable<CategoryReport[]> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) => {
          const expenseTransactions =
            transactions.filter(
              (transaction) =>
                transaction.type === 'expense'
            );

          const categoryTotals =
            new Map<string, number>();

          for (const transaction of expenseTransactions) {
            const category =
              transaction.categoryName;

            const currentAmount =
              categoryTotals.get(category) ?? 0;

            categoryTotals.set(
              category,
              currentAmount + transaction.amount
            );
          }

          const totalExpenses =
            expenseTransactions.reduce(
              (total, transaction) =>
                total + transaction.amount,
              0
            );

          return Array.from(
            categoryTotals.entries()
          )
            .map(([category, amount]) => ({
              category,
              amount,
              percentage:
                totalExpenses > 0
                  ? (amount / totalExpenses) * 100
                  : 0,
            }))
            .sort(
              (a, b) => b.amount - a.amount
            );
        })
      );
  }

  getRecentTransactions(): Observable<Transaction[]> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) =>
          transactions.slice(0, 5)
        )
      );
  }
}