import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonContent,
} from '@ionic/angular/standalone';

import { TransactionsService } from '../../services/transactions.service';
import { Transaction } from '../../models/transaction.model';

type TransactionFilter = 'all' | 'income' | 'expense';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  imports: [
    IonActionSheet,
    IonButton,
    IonContent,
    DecimalPipe,
    RouterLink,
  ],
})
export class TransactionsPage implements OnInit {
  transactions: Transaction[] = [];

  filteredTransactions: Transaction[] = [];

  totalIncome = 0;
  totalExpense = 0;
  totalTransactions = 0;

  activeFilter: TransactionFilter = 'all';

  actionSheetOpen = false;
  selectedTransaction: Transaction | null = null;

  actionSheetButtons: ActionSheetButton[] = [
    {
      text: 'Edit',
      handler: () => this.editTransaction(),
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.deleteTransaction(),
    },
    {
      text: 'Cancel',
      role: 'cancel',
    },
  ];

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ionViewWillEnter(): void {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    this.transactionsService
      .getTransactions()
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.totalTransactions = transactions.length;
          this.totalIncome = transactions
            .filter((tx) => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
          this.totalExpense = transactions
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
          this.applyFilter();
        },

        error: (error) => {
          console.error(
            'Failed to load transactions',
            error
          );
        },
      });
  }

  setFilter(filter: TransactionFilter): void {
    this.activeFilter = filter;

    this.applyFilter();
  }

  private applyFilter(): void {
    const filtered =
      this.activeFilter === 'all'
        ? this.transactions
        : this.transactions.filter(
            (transaction) =>
              transaction.type === this.activeFilter
          );

    this.filteredTransactions = [...filtered].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    );
  }

  openTransactionActions(
    transaction: Transaction
  ): void {
    this.selectedTransaction = transaction;

    this.actionSheetOpen = true;
  }

  editTransaction(): void {
    if (!this.selectedTransaction) {
      return;
    }

    const id = this.selectedTransaction.id;

    this.actionSheetOpen = false;
    this.selectedTransaction = null;

    this.router.navigate(
      ['/tabs/add-transaction'],
      {
        queryParams: {
          edit: id,
        },
      }
    );
  }

  deleteTransaction(): void {
    if (!this.selectedTransaction) {
      return;
    }

    const transactionId =
      this.selectedTransaction.id;

    this.transactionsService
      .deleteTransaction(transactionId)
      .subscribe({
        next: () => {
          this.selectedTransaction = null;
          this.actionSheetOpen = false;

          this.loadTransactions();
        },

        error: (error) => {
          console.error(
            'Failed to delete transaction',
            error
          );
        },
      });
  }
}