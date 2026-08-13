import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Transaction } from '../models/transaction.model';
import { TransactionsService } from './transactions.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private readonly transactionsService: TransactionsService
  ) {}

  getSummary(): Observable<{ recent: Transaction[]; income: number; expenses: number; balance: number }> {
    return this.transactionsService.getTransactions().pipe(map(transactions => {
      const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
      return { recent: transactions.slice(0, 5), income, expenses, balance: income - expenses };
    }));
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
}
