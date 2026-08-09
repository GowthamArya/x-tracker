import { Injectable } from '@angular/core';

import { Account } from '../models/account.model';
import { TransactionsService } from './transactions.service';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private accounts: Account[] = [
    {
      id: 1,
      name: 'Personal',
      openingBalance: 0,
    },
    {
      id: 2,
      name: 'Joint',
      openingBalance: 0,
    },
    {
      id: 3,
      name: 'Savings',
      openingBalance: 0,
    },
  ];

  constructor(
    private readonly transactionsService: TransactionsService
  ) {}

  getAccounts(): Account[] {
    return [...this.accounts];
  }

  getAccountById(id: number): Account | undefined {
    return this.accounts.find(
      (account) => account.id === id
    );
  }

  getAccountBalance(account: Account): number {
    const transactions =
      this.transactionsService.getTransactions();

    const accountTransactions = transactions.filter(
      (transaction) =>
        transaction.account === account.name
    );

    const income = accountTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

    const expenses = accountTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

    return account.openingBalance + income - expenses;
  }

  addAccount(account: Account): void {
    this.accounts = [
      ...this.accounts,
      account,
    ];
  }

  updateAccount(account: Account): void {
    this.accounts = this.accounts.map(
      (existingAccount) =>
        existingAccount.id === account.id
          ? account
          : existingAccount
    );
  }

  deleteAccount(id: number): void {
    this.accounts = this.accounts.filter(
      (account) => account.id !== id
    );
  }

  getAccountTransactions(account: Account) {
  return this.transactionsService
    .getTransactions()
    .filter(
      (transaction) =>
        transaction.account === account.name
    );
}
}