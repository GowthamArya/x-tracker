import { Component } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkOutline, closeOutline, mailOutline } from 'ionicons/icons';
import { AccountsService } from '../../services/accounts.service';
import { CategoriesService } from '../../services/categories.service';
import { GmailService } from '../../services/gmail.service';
import { Account } from '../../models/account.model';
import { Category } from '../../models/category.model';
import { GmailImport } from '../../models/gmail-import.model';
import { PageRefresherComponent } from '../../components/page-refresher/page-refresher.component';

@Component({ selector: 'app-gmail-imports', templateUrl: './gmail-imports.page.html', styleUrls: ['./gmail-imports.page.scss'], imports: [DatePipe, DecimalPipe, FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, PageRefresherComponent] })
export class GmailImportsPage {
  imports: GmailImport[] = []; accounts: Account[] = []; categories: Category[] = []; loading = true; busyId: number | null = null;
  accountIds: Record<number, number | null> = {}; categoryIds: Record<number, number | null> = {};
  constructor(private readonly gmail: GmailService, private readonly accountsService: AccountsService, private readonly categoriesService: CategoriesService, private readonly toast: ToastController) { addIcons({ alertCircleOutline, checkmarkOutline, closeOutline, mailOutline }); }
  ionViewWillEnter(): void { this.loading = true; this.accountsService.getAccounts().subscribe(a => this.accounts = a); this.categoriesService.getCategories().subscribe(c => this.categories = c); this.gmail.getImports().subscribe({ next: items => { this.imports = items; this.loading = false; }, error: () => { this.loading = false; this.show('Unable to load Gmail imports.'); } }); }
  confirm(item: GmailImport): void { const accountId = this.accountIds[item.id]; const categoryId = this.categoryIds[item.id]; if (!accountId || !categoryId) { this.show('Choose an account and category first.'); return; } this.busyId = item.id; this.gmail.confirmImport(item.id, accountId, categoryId).subscribe({ next: () => { this.remove(item.id); this.show('Transaction added.'); }, error: e => { this.busyId = null; this.show(e?.error?.message || 'Unable to add transaction.'); } }); }
  dismiss(item: GmailImport): void { this.busyId = item.id; this.gmail.dismissImport(item.id).subscribe({ next: () => { this.remove(item.id); this.show('Import dismissed.'); }, error: () => { this.busyId = null; this.show('Unable to dismiss import.'); } }); }
  private remove(id: number): void { this.imports = this.imports.filter(item => item.id !== id); this.busyId = null; }
  private show(message: string): void { this.toast.create({ message, duration: 1800, position: 'bottom' }).then(toast => toast.present()); }
}
