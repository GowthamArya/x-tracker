import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private transactions: Transaction[] = [
    {
      id: 1,
      title: 'Salary',
      amount: 60000,
      type: 'income',
      category: 'Salary',
      account: 'Personal',
      date: '2026-08-01',
      notes: 'Monthly salary',
    },
    {
      id: 2,
      title: 'Lunch',
      amount: 250,
      type: 'expense',
      category: 'Food',
      account: 'Personal',
      date: '2026-08-08',
    },
    {
      id: 3,
      title: 'Uber',
      amount: 180,
      type: 'expense',
      category: 'Transport',
      account: 'Personal',
      date: '2026-08-07',
    },
    {
      id: 4,
      title: 'Electricity Bill',
      amount: 1200,
      type: 'expense',
      category: 'Bills',
      account: 'Joint',
      date: '2026-08-05',
    },
    {
      id: 5,
      title: 'Grocery Shopping',
      amount: 2500,
      type: 'expense',
      category: 'Groceries',
      account: 'Joint',
      date: '2026-08-04',
    },
  ];

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getTransactionById(id: number): Transaction | undefined {
    return this.transactions.find(
      (transaction) => transaction.id === id
    );
  }

  addTransaction(transaction: Transaction): void {
    this.transactions = [
      transaction,
      ...this.transactions,
    ];
  }

  updateTransaction(transaction: Transaction): void {
    this.transactions = this.transactions.map(
      (existingTransaction) =>
        existingTransaction.id === transaction.id
          ? transaction
          : existingTransaction
    );
  }

  deleteTransaction(id: number): void {
    this.transactions = this.transactions.filter(
      (transaction) => transaction.id !== id
    );
  }
}