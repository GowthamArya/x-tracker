import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Account } from '../../models/account.model';
import { AccountsService } from '../../services/accounts.service';
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  imports: [
    IonActionSheet,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonTitle,
    IonToolbar,
    DecimalPipe,
    FormsModule,
  ],
})
export class AccountsPage {
  accounts: Account[] = [];
  accountBalances = new Map<number, number>();

  actionSheetOpen = false;
  selectedAccount: Account | null = null;

  showForm = false;
  isEditMode = false;

  accountName = '';
  openingBalance: number | null = null;

  actionSheetButtons: ActionSheetButton[] = [
    {
      text: 'Edit',
      handler: () => this.editAccount(),
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.deleteAccount(),
    },
    {
      text: 'Cancel',
      role: 'cancel',
    },
  ];

  constructor(
    private readonly accountsService: AccountsService,
    private readonly router: Router
  ) {}

  ionViewWillEnter(): void {
    this.loadAccounts();
  }

  private loadAccounts(): void {
    this.accounts =
      this.accountsService.getAccounts();

    this.accountBalances.clear();

    for (const account of this.accounts) {
      this.accountBalances.set(
        account.id,
        this.accountsService.getAccountBalance(account)
      );
    }
  }

  getBalance(accountId: number): number {
    return this.accountBalances.get(accountId) ?? 0;
  }

  openAddAccount(): void {
    this.isEditMode = false;
    this.selectedAccount = null;

    this.accountName = '';
    this.openingBalance = 0;

    this.showForm = true;
  }

  openAccountActions(account: Account): void {
    this.selectedAccount = account;
    this.actionSheetOpen = true;
  }

  editAccount(): void {
    if (!this.selectedAccount) {
      return;
    }

    this.isEditMode = true;

    this.accountName = this.selectedAccount.name;
    this.openingBalance =
      this.selectedAccount.openingBalance;

    this.showForm = true;
    this.actionSheetOpen = false;
  }

  saveAccount(): void {
    const name = this.accountName.trim();

    if (!name) {
      return;
    }

    const balance = this.openingBalance ?? 0;

    if (this.isEditMode && this.selectedAccount) {
      this.accountsService.updateAccount({
        id: this.selectedAccount.id,
        name,
        openingBalance: balance,
      });
    } else {
      this.accountsService.addAccount({
        id: Date.now(),
        name,
        openingBalance: balance,
      });
    }

    this.closeForm();
    this.loadAccounts();
  }

  deleteAccount(): void {
    if (!this.selectedAccount) {
      return;
    }

    const account = this.selectedAccount;

    const transactions =
      this.accountsService.getAccountTransactions(account);

    if (transactions.length > 0) {
      this.actionSheetOpen = false;
      this.selectedAccount = null;

      alert(
        `Cannot delete "${account.name}" because it has transactions.`
      );

      return;
    }

    this.accountsService.deleteAccount(account.id);

    this.selectedAccount = null;
    this.actionSheetOpen = false;

    this.loadAccounts();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.selectedAccount = null;

    this.accountName = '';
    this.openingBalance = null;
  }
}