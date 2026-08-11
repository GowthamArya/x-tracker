import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Transaction } from '../models/transaction.model';
import { FilterValue } from '../models/filter.model';
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

  getTotalIncome(filter?: FilterValue | null): Observable<number> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) =>
          this.applyReportFilter(
            transactions,
            filter,
            'income'
          ).reduce(
            (total, transaction) =>
              total + transaction.amount,
            0
          )
        )
      );
  }

  getTotalExpenses(filter?: FilterValue | null): Observable<number> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) =>
          this.applyReportFilter(
            transactions,
            filter,
            'expense'
          ).reduce(
            (total, transaction) =>
              total + transaction.amount,
            0
          )
        )
      );
  }

  getBalance(
    incomeFilter?: FilterValue | null,
    expenseFilter?: FilterValue | null
  ): Observable<number> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) => {
          const income = this.applyReportFilter(
            transactions,
            incomeFilter,
            'income'
          ).reduce(
            (total, transaction) =>
              total + transaction.amount,
            0
          );

          const expenses = this.applyReportFilter(
            transactions,
            expenseFilter,
            'expense'
          ).reduce(
            (total, transaction) =>
              total + transaction.amount,
            0
          );

          return income - expenses;
        })
      );
  }

  getIncomeByCategory(
    filter?: FilterValue | null
  ): Observable<CategoryReport[]> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) => {
          const incomeTransactions = this.applyReportFilter(
            transactions,
            filter,
            'income'
          );

          return this.buildCategoryReports(incomeTransactions);
        })
      );
  }

  getExpenseByCategory(
    filter?: FilterValue | null
  ): Observable<CategoryReport[]> {
    return this.transactionsService
      .getTransactions()
      .pipe(
        map((transactions) => {
          const expenseTransactions = this.applyReportFilter(
            transactions,
            filter,
            'expense'
          );

          return this.buildCategoryReports(expenseTransactions);
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

  private applyReportFilter(
    transactions: Transaction[],
    filter: FilterValue | null | undefined,
    type: 'income' | 'expense'
  ): Transaction[] {
    let filtered = transactions;

    if (filter?.dateRange) {
      const from = new Date(filter.dateRange.from);
      const to = new Date(filter.dateRange.to);

      filtered = filtered.filter((transaction) => {
        const date = new Date(transaction.transactionDate);
        return date >= from && date <= to;
      });
    }

    if (filter?.categoryId != null) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.categoryId === filter.categoryId
      );
    }

    return filtered.filter(
      (transaction) => transaction.type === type
    );
  }

  private buildCategoryReports(
    transactions: Transaction[]
  ): CategoryReport[] {
    const categoryTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const category = transaction.categoryName;
      const currentAmount = categoryTotals.get(category) ?? 0;
      categoryTotals.set(category, currentAmount + transaction.amount);
    }

    const totalAmount = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }
}
