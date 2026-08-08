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
  Transaction,
  TransactionType,
} from '../../models/transaction.model';

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
  category = '';
  account = '';
  date = this.getToday();
  notes = '';

  submitted = false;

  isEditMode = false;
  editingTransactionId: number | null = null;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadEditTransaction();
  }

  private loadEditTransaction(): void {
    const editId = this.route.snapshot.queryParamMap.get('edit');

    if (!editId) {
      return;
    }

    const transactionId = Number(editId);

    if (Number.isNaN(transactionId)) {
      return;
    }

    const transaction =
      this.transactionsService.getTransactionById(transactionId);

    if (!transaction) {
      return;
    }

    this.isEditMode = true;
    this.editingTransactionId = transaction.id;

    this.transactionType = transaction.type;
    this.amount = transaction.amount;
    this.title = transaction.title;
    this.category = transaction.category;
    this.account = transaction.account;
    this.date = transaction.date;
    this.notes = transaction.notes ?? '';
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
    const transaction: Transaction = {
      id: Date.now(),
      title: this.title.trim(),
      amount: this.amount!,
      type: this.transactionType,
      category: this.category,
      account: this.account,
      date: this.date,
      notes: this.notes.trim() || undefined,
    };

    this.transactionsService.addTransaction(transaction);

    this.clearForm();

    this.router.navigate(['/tabs/transactions']);
  }

  private updateTransaction(): void {
    if (this.editingTransactionId === null) {
      return;
    }

    const transaction: Transaction = {
      id: this.editingTransactionId,
      title: this.title.trim(),
      amount: this.amount!,
      type: this.transactionType,
      category: this.category,
      account: this.account,
      date: this.date,
      notes: this.notes.trim() || undefined,
    };

    this.transactionsService.updateTransaction(transaction);

    this.clearForm();

    this.router.navigate(['/tabs/transactions']);
  }

  private isFormValid(): boolean {
    return (
      this.amount !== null &&
      this.amount > 0 &&
      this.title.trim().length > 0 &&
      this.category.length > 0 &&
      this.account.length > 0 &&
      this.date.length > 0
    );
  }

  private clearForm(): void {
    this.transactionType = 'expense';
    this.amount = null;
    this.title = '';
    this.category = '';
    this.account = '';
    this.date = this.getToday();
    this.notes = '';

    this.submitted = false;

    this.isEditMode = false;
    this.editingTransactionId = null;
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }
}