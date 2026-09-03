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
  IonSelect,
  IonSelectOption,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, ellipsisHorizontal, walletOutline } from 'ionicons/icons';

import { Account } from '../../models/account.model';
import { AccountsService } from '../../services/accounts.service';
import { AccountInvitesService } from '../../services/account-invites.service';
import { ShareService } from '../../services/share.service';
import { PageRefresherComponent } from '../../components/page-refresher/page-refresher.component';

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
    IonSelect,
    IonSelectOption,
    IonBadge,
    DecimalPipe,
    FormsModule,
    PageRefresherComponent,
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
  accountType: 'personal' | 'joint' = 'personal';

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
    private readonly accountInvites: AccountInvitesService,
    private readonly shareService: ShareService,
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
    this.accountType = 'personal';

    this.showForm = true;
  }

  openAccountActions(account: Account): void {
    this.selectedAccount = account;
    this.actionSheetButtons = [
      { text: 'Edit', handler: () => this.editAccount() },
      ...(account.accountType === 'joint' ? [{ text: 'Share joint account', handler: () => this.shareJointAccount() }] : []),
      { text: 'Delete', role: 'destructive', handler: () => this.confirmDeleteAccount() },
      { text: 'Cancel', role: 'cancel' },
    ];
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
    this.accountType = this.selectedAccount.accountType;

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
          accountType: this.accountType,
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
        accountType: this.accountType,
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

  private shareJointAccount(): void {
    const account = this.selectedAccount;
    if (!account || account.accountType !== 'joint') return;
    this.accountInvites.create(account.id).subscribe({
      next: async invite => {
        const url = `${window.location.origin}/join/account/${invite.token}`;
        const result = await this.shareService.shareOrCopy(url, `Join ${account.name}`, `Join our shared account “${account.name}” on X-Tracker.`);
        this.showToast(result === 'shared' ? 'Share sheet opened.' : 'Invite link copied.');
      },
      error: () => this.showToast('Unable to create an invite link.'),
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
