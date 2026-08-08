import { Injectable } from '@angular/core';
import { TransactionsService } from './transactions.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private readonly transactionsService: TransactionsService
  ) {}

  getRecentTransactions() {
    return this.transactionsService
      .getTransactions()
      .slice(0, 5);
  }

  getTotalIncome(): number {
    return this.transactionsService
      .getTransactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  getTotalExpenses(): number {
    return this.transactionsService
      .getTransactions()
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
}