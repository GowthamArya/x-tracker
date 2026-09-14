import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  addOutline,
  optionsOutline,
  checkmarkOutline,
  pencilOutline,
  trashOutline
} from 'ionicons/icons';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSearchbar,
  IonModal,
  IonIcon,
  IonSegmentButton,
  IonLabel,
  IonSegment
} from '@ionic/angular/standalone';

import { UpperCasePipe } from "@angular/common";

import { TransactionsService } from '../../services/transactions.service';
import { Transaction } from '../../models/transaction.model';
import { FilterValue } from '../../models/filter.model';
import { FilterPage } from '../filters/filters.page';
import { addIcons } from 'ionicons';
import { PageRefresherComponent } from '../../components/page-refresher/page-refresher.component';

type TransactionFilter = 'all' | 'income' | 'expense';
import type { SegmentCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonSearchbar,
    IonModal,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    DecimalPipe,
    FormsModule,
    RouterLink,
    FilterPage,
    UpperCasePipe,
    PageRefresherComponent
  ],
})
export class TransactionsPage implements OnInit {
  transactions: Transaction[] = [];

  filteredTransactions: Transaction[] = [];

  totalIncome = 0;
  totalExpense = 0;
  totalTransactions = 0;

  activeFilter: TransactionFilter = 'all';
  searchQuery = '';
  filter: FilterValue | null = null;
  filtersOpen = false;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly router: Router
  ) {
    addIcons({ addOutline, optionsOutline, checkmarkOutline, pencilOutline, trashOutline});
  }

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

  onSegmentChange(event: SegmentCustomEvent): void {
    const value = event.detail.value;

    if (
      value === 'all' ||
      value === 'income' ||
      value === 'expense'
    ) {
      this.activeFilter = value;
      this.applyFilter();
    }
  }

  onFilterChange(filter: FilterValue): void { this.filter = filter; this.applyFilter(); }
  openFilters(): void { this.filtersOpen = true; }

  applyFilter(): void {
    let filtered =
      this.activeFilter === 'all'
        ? this.transactions
        : this.transactions.filter(
            (transaction) =>
              transaction.type === this.activeFilter
          );

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(tx => `${tx.title} ${tx.categoryName} ${tx.accountName} ${tx.addedByName || ''}`.toLowerCase().includes(q));
    }
    if (this.filter?.dateRange) {
      const from = new Date(this.filter.dateRange.from).getTime();
      const to = new Date(this.filter.dateRange.to).getTime();
      filtered = filtered.filter(tx => { const date = new Date(tx.transactionDate).getTime(); return date >= from && date <= to; });
    }
    if (this.filter?.categoryId != null) filtered = filtered.filter(tx => tx.categoryId === this.filter?.categoryId);
    this.filteredTransactions = [...filtered].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    );
  }

  editTransaction(transaction: Transaction): void {
    this.router.navigate(
      ['/tabs/add-transaction'],
      {
        queryParams: {
          edit: transaction.id,
        },
      }
    );
  }

  deleteTransaction(transaction: Transaction): void {
    this.transactionsService
      .deleteTransaction(transaction.id)
      .subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Failed to delete transaction', error);
        },
      });
  }
}
