import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActionSheetButton,
  AlertController,
  IonActionSheet,
  IonButton,
  IonButtons,
  IonBackButton,
  IonContent,
  IonHeader,
  IonInput,
  IonIcon,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, ellipsisHorizontal, walletOutline } from 'ionicons/icons';

import { Account } from '../../models/account.model';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  imports: [
    IonActionSheet,
    IonButton,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonInput,
    IonIcon,
    IonTitle,
    IonToolbar,
    DecimalPipe,
    FormsModule,
  ],
})
export class AccountsPage {
  accounts: Account[] = [];

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
      handler: () => this.confirmDeleteAccount(),
    },
    {
      text: 'Cancel',
      role: 'cancel',
    },
  ];

  constructor(
    private readonly accountsService: AccountsService,
    private readonly alerts: AlertController,
    private readonly toasts: ToastController,
  ) {
    addIcons({ addOutline, ellipsisHorizontal, walletOutline });
  }

  ionViewWillEnter(): void {
    this.loadAccounts();
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

    this.accountName =
      this.selectedAccount.name;

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

    const openingBalance =
      this.openingBalance ?? 0;

    // Edit
    if (
      this.isEditMode &&
      this.selectedAccount
    ) {
      this.accountsService
        .updateAccount({
          id: this.selectedAccount.id,
          name,
          openingBalance,
        })
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadAccounts();
          },

          error: (error) => {
            console.error(
              'Failed to update account',
              error
            );
          },
        });

      return;
    }

    // Add
    this.accountsService
      .addAccount({
        id: 0,
        name,
        openingBalance,
      })
      .subscribe({
        next: () => {
          this.closeForm();
          this.loadAccounts();
        },

        error: (error) => {
          console.error(
            'Failed to add account',
            error
          );
        },
      });
  }

  async confirmDeleteAccount(): Promise<void> {
    if (!this.selectedAccount) {
      return;
    }

    const account = this.selectedAccount;
    this.actionSheetOpen = false;
    const alert = await this.alerts.create({
      header: 'Delete account?',
      message: `Delete “${account.name}”? Accounts with transactions must have their transactions moved or deleted first.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.deleteAccount(account) },
      ],
    });
    await alert.present();
  }

  private deleteAccount(account: Account): void {

    this.accountsService
      .deleteAccount(account.id)
      .subscribe({
        next: () => {
          this.selectedAccount = null;
          this.actionSheetOpen = false;

          this.accounts = this.accounts.filter(item => item.id !== account.id);
          this.showToast('Account deleted.');
        },

        error: (error) => {
          console.error(
            'Failed to delete account',
            error
          );

          this.selectedAccount = null;
          this.actionSheetOpen = false;

          this.showToast(typeof error?.error === 'string'
            ? error.error
            : 'Unable to delete this account. Please try again.');
        },
      });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toasts.create({
      message,
      duration: 2400,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.selectedAccount = null;

    this.accountName = '';
    this.openingBalance = null;
  }
}
