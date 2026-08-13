import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, notificationsOutline, colorPaletteOutline, shieldCheckmarkOutline, logOutOutline, personCircleOutline, downloadOutline, cashOutline, chevronForwardOutline, trashOutline, settingsOutline } from 'ionicons/icons';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';
import { TripsService } from '../../services/trips.service';

@Component({ selector: 'app-more', templateUrl: './more.page.html', styleUrls: ['./more.page.scss'], standalone: true, imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonListHeader, IonItem, IonLabel, IonIcon, IonToggle, IonSelect, IonSelectOption, IonButton, RouterLink, IonModal] })
export class MorePage implements OnInit {
  user: CurrentUser | null = null;
  darkMode = false;
  currency = '₹';
  notificationsOpen = false;
  notifications = [
    { title: 'Welcome to X-Tracker', message: 'Your spending insights and trip activity will appear here.', read: false }
  ];

  constructor(private readonly auth: AuthService, private readonly router: Router, private readonly alerts: AlertController, private readonly toast: ToastController, private readonly transactions: TransactionsService, private readonly trips: TripsService) {
    addIcons({ walletOutline, notificationsOutline, colorPaletteOutline, shieldCheckmarkOutline, logOutOutline, personCircleOutline, downloadOutline, cashOutline, chevronForwardOutline, trashOutline, settingsOutline });
  }

  ngOnInit(): void {
    this.darkMode = localStorage.getItem('xtracker-theme') === 'dark';
    this.currency = localStorage.getItem('xtracker-currency') || '₹';
    this.applyTheme();
    this.auth.getCurrentUser().subscribe(user => this.user = user);
    const saved = localStorage.getItem('xtracker-notifications');
    if (saved) {
      try { this.notifications = JSON.parse(saved); } catch { /* reset invalid local data */ }
    }
  }

  toggleTheme(event: CustomEvent): void { this.darkMode = Boolean(event.detail?.checked); localStorage.setItem('xtracker-theme', this.darkMode ? 'dark' : 'light'); this.applyTheme(); }
  setCurrency(event: CustomEvent): void { this.currency = event.detail.value || '₹'; localStorage.setItem('xtracker-currency', this.currency); }
  openNotifications(): void { this.notificationsOpen = true; this.notifications = this.notifications.map(item => ({ ...item, read: true })); localStorage.setItem('xtracker-notifications', JSON.stringify(this.notifications)); }

  async editProfile(): Promise<void> {
    const alert = await this.alerts.create({ header: 'Profile', message: `${this.user?.email || 'Signed-in user'}\nProfile editing is managed by your account provider.`, buttons: ['Close'] });
    await alert.present();
  }

  get profileAvatar(): string | null {
    return this.user?.photoUrl?.trim() ? this.user.photoUrl.trim() : null;
  }

  get profileInitial(): string {
    const source = this.user?.name?.trim() || this.user?.email?.trim() || 'X';
    return source.charAt(0).toUpperCase();
  }

  exportData(format: 'csv' | 'json'): void {
    forkJoin({ transactions: this.transactions.getTransactions(), trips: this.trips.getTrips() }).subscribe({ next: ({ transactions, trips }) => {
      if (format === 'json') { this.download(JSON.stringify({ exportedAt: new Date().toISOString(), transactions, trips }, null, 2), 'xtracker-export.json', 'application/json'); return; }
      const rows = transactions.map(tx => [tx.transactionDate, tx.type, tx.title, tx.categoryName, tx.accountName, tx.amount]);
      const csv = [['Date', 'Type', 'Title', 'Category', 'Account', 'Amount'], ...rows].map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      this.download(csv, 'xtracker-transactions.csv', 'text/csv');
    }, error: () => this.showToast('Unable to export data right now.') });
  }

  async logout(): Promise<void> {
    const alert = await this.alerts.create({ header: 'Sign out?', message: 'Your data will remain safely stored.', buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Sign out', role: 'destructive', handler: () => this.auth.logout().subscribe({ next: () => this.router.navigate(['/login']), error: () => this.showToast('Sign out failed. Please try again.') }) }] });
    await alert.present();
  }

  async deleteAccount(): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Delete account?',
      message: 'This will permanently remove your profile, transactions, trips you created, and your membership data. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete account',
          role: 'destructive',
          handler: () => this.auth.deleteAccount().subscribe({
            next: () => this.router.navigate(['/login']),
            error: () => this.showToast('Unable to delete account right now.')
          })
        }
      ]
    });
    await alert.present();
  }

  private applyTheme(): void { document.body.classList.toggle('app-dark', this.darkMode); }
  private download(content: string, filename: string, type: string): void { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
  private showToast(message: string): void { this.toast.create({ message, duration: 1800, position: 'bottom' }).then(toast => toast.present()); }
}
