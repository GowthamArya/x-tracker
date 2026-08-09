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

  private loadTransactions(): void {
    this.transactions =
      this.transactionsService.getTransactions();

    this.applyFilter();
  }

  setFilter(filter: TransactionFilter): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredTransactions = [...this.transactions];
      return;
    }

    this.filteredTransactions = this.transactions.filter(
      (transaction) => transaction.type === this.activeFilter
    );
  }

  openTransactionActions(transaction: Transaction): void {
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

    this.transactionsService.deleteTransaction(
      this.selectedTransaction.id
    );

    this.selectedTransaction = null;
    this.actionSheetOpen = false;

    this.loadTransactions();
  }
}