import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';

import {
  TransactionType,
} from '../../models/transaction.model';

import { TransactionRequest } from '../../models/transaction-request.model';

import { Account } from '../../models/account.model';

import {
  Category,
  CategoriesService,
} from '../../services/categories.service';

import { AccountsService } from '../../services/accounts.service';

import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.page.html',
  styleUrls: ['./add-transaction.page.scss'],
  imports: [
    FormsModule,
    IonBackButton,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
  ],
})
export class AddTransactionPage implements OnInit {
  transactionType: TransactionType = 'expense';

  amount: number | null = null;

  title = '';

  categoryId: number | null = null;

  accountId: number | null = null;

  date = this.getToday();

  notes = '';

  submitted = false;

  isEditMode = false;

  editingTransactionId: number | null = null;

  accounts: Account[] = [];

  categories: Category[] = [];

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCategories();
    this.loadEditTransaction();
  }

  private loadAccounts(): void {
    this.accountsService
      .getAccounts()
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
        },

        error: (error) => {
          console.error(
            'Failed to load accounts',
            error
          );
        },
      });
  }

  private loadCategories(): void {
    this.categoriesService
      .getCategories()
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },

        error: (error) => {
          console.error(
            'Failed to load categories',
            error
          );
        },
      });
  }

  private loadEditTransaction(): void {
    const editId =
      this.route.snapshot.queryParamMap.get(
        'edit'
      );

    if (!editId) {
      return;
    }

    const transactionId = Number(editId);

    if (Number.isNaN(transactionId)) {
      return;
    }

    this.transactionsService
      .getTransactionById(transactionId)
      .subscribe({
        next: (transaction) => {
          this.isEditMode = true;

          this.editingTransactionId =
            transaction.id;

          this.transactionType =
            transaction.type;

          this.amount =
            transaction.amount;

          this.title =
            transaction.title;

          this.categoryId =
            transaction.categoryId;

          this.accountId =
            transaction.accountId;

          this.date =
            transaction.transactionDate
              .split('T')[0];

          this.notes =
            transaction.notes ?? '';
        },

        error: (error) => {
          console.error(
            'Failed to load transaction',
            error
          );

          this.router.navigate([
            '/tabs/transactions',
          ]);
        },
      });
  }

  saveTransaction(): void {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.isEditMode) {
      this.updateTransaction();
      return;
    }

    this.addTransaction();
  }

  private addTransaction(): void {
    const request: TransactionRequest = {
      accountId: this.accountId!,
      categoryId: this.categoryId!,
      title: this.title.trim(),
      amount: this.amount!,
      type: this.transactionType,
      transactionDate: this.date,
      notes: this.notes.trim() || undefined,
    };

    this.transactionsService
      .addTransaction(request)
      .subscribe({
        next: () => {
          this.clearForm();

          this.router.navigate([
            '/tabs/transactions',
          ]);
        },

        error: (error) => {
          console.error(
            'Failed to add transaction',
            error
          );
        },
      });
  }

  private updateTransaction(): void {
    if (
      this.editingTransactionId === null
    ) {
      return;
    }

    const request: TransactionRequest = {
      accountId: this.accountId!,
      categoryId: this.categoryId!,
      title: this.title.trim(),
      amount: this.amount!,
      type: this.transactionType,
      transactionDate: this.date,
      notes: this.notes.trim() || undefined,
    };

    this.transactionsService
      .updateTransaction(
        this.editingTransactionId,
        request
      )
      .subscribe({
        next: () => {
          this.clearForm();

          this.router.navigate([
            '/tabs/transactions',
          ]);
        },

        error: (error) => {
          console.error(
            'Failed to update transaction',
            error
          );
        },
      });
  }

  private isFormValid(): boolean {
    return (
      this.amount !== null &&
      this.amount > 0 &&
      this.title.trim().length > 0 &&
      this.categoryId !== null &&
      this.accountId !== null &&
      this.date.length > 0
    );
  }

  private clearForm(): void {
    this.transactionType = 'expense';

    this.amount = null;

    this.title = '';

    this.categoryId = null;

    this.accountId = null;

    this.date = this.getToday();

    this.notes = '';

    this.submitted = false;

    this.isEditMode = false;

    this.editingTransactionId = null;
  }

  private getToday(): string {
    return new Date()
      .toISOString()
      .split('T')[0];
  }
}