import { Component, OnInit } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonAlert,
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

import type { SegmentCustomEvent } from '@ionic/angular';

import {
  addOutline,
  optionsOutline,
  checkmarkOutline,
  pencilOutline,
  trashOutline
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

import { TransactionsService } from '../../services/transactions.service';
import { Transaction } from '../../models/transaction.model';
import { FilterValue } from '../../models/filter.model';
import { FilterPage } from '../filters/filters.page';
import { PageRefresherComponent } from '../../components/page-refresher/page-refresher.component';


type TransactionFilter = 'all' | 'income' | 'expense';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],

  imports: [
    IonAlert,
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
  ]
})
export class TransactionsPage implements OnInit {

  transactions: Transaction[] = [];

  filteredTransactions: Transaction[] = [];

  totalIncome = 0;
  totalExpense = 0;

  activeFilter: TransactionFilter = 'all';

  searchQuery = '';

  filter: FilterValue | null = null;

  filtersOpen = false;

  deleteAlertOpen = false;

  transactionToDelete: Transaction | null = null;


  /**
   * Delete confirmation buttons
   */
  deleteAlertButtons = [
    {
      text: 'Cancel',
      role: 'cancel'
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => {
        this.confirmDelete();
      }
    }
  ];


  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly router: Router
  ) {
    addIcons({
      addOutline,
      optionsOutline,
      checkmarkOutline,
      pencilOutline,
      trashOutline
    });
  }


  ngOnInit(): void {
    this.loadTransactions();
  }


  ionViewWillEnter(): void {
    this.loadTransactions();
  }


  /**
   * Load transactions from API
   */
  private loadTransactions(): void {

    this.transactionsService
      .getTransactions()
      .subscribe({

        next: (transactions) => {

          this.transactions = transactions;

          this.totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce(
              (sum, tx) => sum + tx.amount,
              0
            );

          this.totalExpense = transactions
            .filter(tx => tx.type === 'expense')
            .reduce(
              (sum, tx) => sum + tx.amount,
              0
            );

          this.applyFilter();
        },

        error: (error) => {
          console.error(
            'Failed to load transactions',
            error
          );
        }

      });
  }


  /**
   * Handle All / Income / Expenses segment
   */
  onSegmentChange(
    event: SegmentCustomEvent
  ): void {

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


  /**
   * Handle advanced filter changes
   */
  onFilterChange(
    filter: FilterValue
  ): void {

    this.filter = filter;

    this.applyFilter();
  }


  /**
   * Open filter modal
   */
  openFilters(): void {
    this.filtersOpen = true;
  }


  /**
   * Apply all active filters
   */
  applyFilter(): void {

    let filtered =
      this.activeFilter === 'all'
        ? this.transactions
        : this.transactions.filter(
            transaction =>
              transaction.type === this.activeFilter
          );


    // Search filter
    if (this.searchQuery.trim()) {

      const query =
        this.searchQuery
          .toLowerCase()
          .trim();

      filtered = filtered.filter(transaction =>
        `${transaction.title}
         ${transaction.categoryName}
         ${transaction.accountName}
         ${transaction.addedByName || ''}`
          .toLowerCase()
          .includes(query)
      );
    }


    // Date range filter
    if (this.filter?.dateRange) {

      const from =
        new Date(
          this.filter.dateRange.from
        ).getTime();

      const to =
        new Date(
          this.filter.dateRange.to
        ).getTime();

      filtered = filtered.filter(transaction => {

        const date =
          new Date(
            transaction.transactionDate
          ).getTime();

        return date >= from && date <= to;
      });
    }


    // Category filter
    if (this.filter?.categoryId != null) {

      filtered = filtered.filter(
        transaction =>
          transaction.categoryId ===
          this.filter?.categoryId
      );
    }


    // Sort newest first
    this.filteredTransactions =
      [...filtered].sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
  }


  /**
   * Navigate to edit transaction
   */
  editTransaction(
    transaction: Transaction
  ): void {

    this.router.navigate(
      ['/tabs/add-transaction'],
      {
        queryParams: {
          edit: transaction.id
        }
      }
    );
  }


  /**
   * Open delete confirmation
   */
  deleteTransaction(
    transaction: Transaction
  ): void {

    this.transactionToDelete = transaction;

    this.deleteAlertOpen = true;
  }


  /**
   * Actually delete the transaction
   */
  confirmDelete(): void {

    if (!this.transactionToDelete) {
      return;
    }

    const transactionId =
      this.transactionToDelete.id;

    this.deleteAlertOpen = false;

    this.transactionToDelete = null;


    this.transactionsService
      .deleteTransaction(transactionId)
      .subscribe({

        next: () => {
          this.loadTransactions();
        },

        error: (error) => {
          console.error(
            'Failed to delete transaction',
            error
          );
        }

      });
  }


  /**
   * Clean up after alert closes
   */
  onDeleteAlertDismiss(): void {

    this.deleteAlertOpen = false;

    this.transactionToDelete = null;
  }

}