import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonChip,
  IonSearchbar,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  shareOutline,
  pencilOutline,
  personAddOutline,
  swapHorizontalOutline,
  cashOutline,
  walletOutline,
  receiptOutline,
  peopleOutline,
  pieChartOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  trashOutline,
  checkmarkOutline,
  restaurantOutline,
  carOutline,
  bedOutline,
  ticketOutline,
  bagHandleOutline,
  cartOutline,
  linkOutline,
  giftOutline,
  closeOutline
} from 'ionicons/icons';

import { TripsService } from '../../services/trips.service';
import { TripExpensesService } from '../../services/trip-expenses.service';
import { TripMembersService } from '../../services/trip-members.service';
import { TripInvitesService } from '../../services/trip-invites.service';
import { Trip } from '../../models/trip.model';
import { TripExpense } from '../../models/trip-expense.model';
import { TripMember } from '../../models/trip-member.model';
import { TripMemberBalance, TripDebt } from '../../models/trip-member-balance.model';

export interface CategoryAnalytic {
  name: string;
  icon: string;
  totalAmount: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonLabel,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonChip,
    IonSearchbar,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonProgressBar,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonFab,
    IonFabButton
  ]
})
export class TripDetailPage implements OnInit {
  tripId = 0;
  trip: Trip | null = null;
  expenses: TripExpense[] = [];
  filteredExpenses: TripExpense[] = [];
  searchExpenseQuery = '';
  selectedCategoryFilter = 'all';

  members: TripMember[] = [];
  balances: TripMemberBalance[] = [];
  debts: TripDebt[] = [];
  myBalance: TripMemberBalance | null = null;

  activeSegment: 'expenses' | 'balances' | 'members' | 'analytics' = 'expenses';
  totalTripExpense = 0;
  categoryAnalytics: CategoryAnalytic[] = [];

  // Modals state
  isSettleUpModalOpen = false;
  settlePayerMemberId: number | null = null;
  settleReceiverMemberId: number | null = null;
  settleAmount: number | null = null;
  settleNotes = '';

  isAddGuestModalOpen = false;
  guestName = '';
  guestEmail = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tripsService: TripsService,
    private readonly expensesService: TripExpensesService,
    private readonly membersService: TripMembersService,
    private readonly invitesService: TripInvitesService,
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController
  ) {
    addIcons({
      addOutline,
      shareOutline,
      pencilOutline,
      personAddOutline,
      swapHorizontalOutline,
      cashOutline,
      walletOutline,
      receiptOutline,
      peopleOutline,
      pieChartOutline,
      checkmarkCircleOutline,
      arrowForwardOutline,
      trashOutline,
      checkmarkOutline,
      restaurantOutline,
      carOutline,
      bedOutline,
      ticketOutline,
      bagHandleOutline,
      cartOutline,
      linkOutline,
      giftOutline,
      closeOutline
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      this.router.navigate(['/tabs/trips']);
      return;
    }
    this.tripId = id;
    this.load();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(event?: any): void {
    this.tripsService.getTrip(this.tripId).subscribe({
      next: (t) => (this.trip = t),
      error: (err) => console.error('Failed to load trip', err)
    });

    this.expensesService.getExpenses(this.tripId).subscribe({
      next: (e) => {
        this.expenses = e;
        this.applyExpenseFilters();
        this.calculateAnalytics();
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Failed to load expenses', err);
        if (event) event.target.complete();
      }
    });

    this.membersService.getMembers(this.tripId).subscribe({
      next: (m) => (this.members = m),
      error: (err) => console.error('Failed to load members', err)
    });

    this.tripsService.getBalances(this.tripId).subscribe({
      next: (res) => {
        this.balances = res.balances || [];
        this.debts = res.debts || [];
        const current = this.balances.find((x) => x.isCurrentUser);
        this.myBalance = current ?? null;
      },
      error: (err) => console.error('Failed to load balances', err)
    });
  }

  applyExpenseFilters(): void {
    let result = [...this.expenses];

    if (this.selectedCategoryFilter !== 'all') {
      if (this.selectedCategoryFilter === 'settlement') {
        result = result.filter(e => e.isSettlement);
      } else {
        result = result.filter(e => e.categoryId === Number(this.selectedCategoryFilter));
      }
    }

    const q = this.searchExpenseQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.paidByMemberName && e.paidByMemberName.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    this.filteredExpenses = result;
  }

  private calculateAnalytics(): void {
    this.totalTripExpense = this.expenses
      .filter((e) => !e.isSettlement)
      .reduce((sum, e) => sum + e.amount, 0);

    if (this.totalTripExpense === 0) {
      this.categoryAnalytics = [];
      return;
    }

    const categoryTotals: { [key: string]: { name: string; icon: string; amount: number; color: string } } = {
      Food: { name: 'Food & Dining', icon: 'restaurant-outline', amount: 0, color: '#f59e0b' },
      Transport: { name: 'Transport & Travel', icon: 'car-outline', amount: 0, color: '#3b82f6' },
      Stay: { name: 'Stay & Hotel', icon: 'bed-outline', amount: 0, color: '#8b5cf6' },
      Entertainment: { name: 'Activities & Events', icon: 'ticket-outline', amount: 0, color: '#ec4899' },
      Shopping: { name: 'Shopping & Gifts', icon: 'bag-handle-outline', amount: 0, color: '#10b981' },
      Other: { name: 'General & Others', icon: 'cart-outline', amount: 0, color: '#64748b' }
    };

    for (const e of this.expenses) {
      if (e.isSettlement) continue;
      const desc = e.description.toLowerCase();
      if (desc.includes('food') || desc.includes('dinner') || desc.includes('lunch') || desc.includes('restaurant') || desc.includes('tea') || desc.includes('coffee')) {
        categoryTotals['Food'].amount += e.amount;
      } else if (desc.includes('cab') || desc.includes('taxi') || desc.includes('fuel') || desc.includes('petrol') || desc.includes('flight') || desc.includes('train') || desc.includes('auto')) {
        categoryTotals['Transport'].amount += e.amount;
      } else if (desc.includes('hotel') || desc.includes('stay') || desc.includes('airbnb') || desc.includes('resort')) {
        categoryTotals['Stay'].amount += e.amount;
      } else if (desc.includes('ticket') || desc.includes('movie') || desc.includes('park') || desc.includes('event')) {
        categoryTotals['Entertainment'].amount += e.amount;
      } else if (desc.includes('shop') || desc.includes('buy') || desc.includes('gift')) {
        categoryTotals['Shopping'].amount += e.amount;
      } else {
        categoryTotals['Other'].amount += e.amount;
      }
    }

    this.categoryAnalytics = Object.values(categoryTotals)
      .filter(c => c.amount > 0)
      .map(c => ({
        ...c,
        totalAmount: c.amount,
        percentage: Math.round((c.amount / this.totalTripExpense) * 100)
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  addExpense(): void {
    this.router.navigate([`/tabs/trips/${this.tripId}/expenses/add`]);
  }

  editExpense(expenseId: number): void {
    this.router.navigate([`/tabs/trips/${this.tripId}/expenses/${expenseId}`]);
  }

  async deleteExpense(expense: TripExpense): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete Expense',
      message: `Are you sure you want to delete "${expense.description}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.expensesService.deleteExpense(this.tripId, expense.id).subscribe({
              next: async () => {
                const toast = await this.toastCtrl.create({
                  message: 'Expense deleted',
                  duration: 1500,
                  position: 'bottom'
                });
                await toast.present();
                this.load();
              },
              error: (err) => console.error(err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Settle Up Modal Flow
  openSettleUp(debt?: TripDebt): void {
    if (debt) {
      this.settlePayerMemberId = debt.fromTripMemberId;
      this.settleReceiverMemberId = debt.toTripMemberId;
      this.settleAmount = debt.amount;
    } else {
      this.settlePayerMemberId = this.members.find(m => m.userId != null)?.id ?? this.members[0]?.id ?? null;
      this.settleReceiverMemberId = this.members.find(m => m.id !== this.settlePayerMemberId)?.id ?? null;
      this.settleAmount = 0;
    }
    this.settleNotes = 'Settlement repayment';
    this.isSettleUpModalOpen = true;
  }

  closeSettleUpModal(): void {
    this.isSettleUpModalOpen = false;
  }

  saveSettlement(): void {
    if (!this.settlePayerMemberId || !this.settleReceiverMemberId || !this.settleAmount || this.settleAmount <= 0) {
      return;
    }

    const payer = this.members.find((m) => m.id === this.settlePayerMemberId);
    const receiver = this.members.find((m) => m.id === this.settleReceiverMemberId);

    const desc = `Settlement: ${payer?.name ?? 'Member'} paid ${receiver?.name ?? 'Member'}`;

    this.expensesService.addExpense(this.tripId, {
      paidByTripMemberId: this.settlePayerMemberId,
      description: desc,
      amount: this.settleAmount,
      expenseDate: new Date().toISOString().split('T')[0],
      notes: this.settleNotes || 'Settlement payment',
      isSettlement: true,
      participantTripMemberIds: [this.settleReceiverMemberId],
      participantShares: [
        { tripMemberId: this.settleReceiverMemberId, shareAmount: this.settleAmount }
      ]
    }).subscribe({
      next: async () => {
        this.isSettleUpModalOpen = false;
        const toast = await this.toastCtrl.create({
          message: 'Settlement recorded successfully!',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        this.load();
      },
      error: async (err) => {
        console.error(err);
        const toast = await this.toastCtrl.create({
          message: 'Failed to record settlement',
          duration: 2000,
          color: 'danger',
          position: 'bottom'
        });
        await toast.present();
      }
    });
  }

  // Add Guest Member Modal Flow
  openAddGuestModal(): void {
    this.guestName = '';
    this.guestEmail = '';
    this.isAddGuestModalOpen = true;
  }

  closeAddGuestModal(): void {
    this.isAddGuestModalOpen = false;
  }

  saveGuestMember(): void {
    if (!this.guestName.trim()) return;

    this.membersService.addGuestMember(this.tripId, this.guestName.trim(), this.guestEmail.trim() || undefined).subscribe({
      next: async () => {
        this.isAddGuestModalOpen = false;
        const toast = await this.toastCtrl.create({
          message: `Added member "${this.guestName.trim()}"`,
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        this.load();
      },
      error: async (err) => {
        console.error(err);
        const toast = await this.toastCtrl.create({
          message: 'Failed to add member',
          duration: 2000,
          color: 'danger',
          position: 'bottom'
        });
        await toast.present();
      }
    });
  }

  async shareTrip(): Promise<void> {
    try {
      this.invitesService.createInvite(this.tripId).subscribe({
        next: async (invite) => {
          const joinUrl = `${window.location.origin}/join/trip/${invite.token}`;
          await navigator.clipboard?.writeText(joinUrl);
          const toast = await this.toastCtrl.create({
            message: 'Trip invite link copied to clipboard!',
            duration: 2500,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
        },
        error: async () => {
          const url = `${window.location.origin}/tabs/trips/${this.tripId}`;
          await navigator.clipboard?.writeText(url);
          const toast = await this.toastCtrl.create({ message: 'Trip link copied', duration: 1500, position: 'bottom' });
          await toast.present();
        }
      });
    } catch {
      const toast = await this.toastCtrl.create({ message: 'Unable to copy link', duration: 1500, position: 'bottom' });
      await toast.present();
    }
  }

  getMemberName(memberId: number): string {
    const m = this.members.find((x) => x.id === memberId);
    return m ? m.name : `Member #${memberId}`;
  }

  getCategoryIcon(categoryId?: number | null, desc?: string): string {
    if (!desc) return 'receipt-outline';
    const d = desc.toLowerCase();
    if (d.startsWith('settlement')) return 'swap-horizontal-outline';
    if (d.includes('food') || d.includes('dinner') || d.includes('tea') || d.includes('coffee')) return 'restaurant-outline';
    if (d.includes('cab') || d.includes('fuel') || d.includes('taxi') || d.includes('travel')) return 'car-outline';
    if (d.includes('hotel') || d.includes('stay') || d.includes('room')) return 'bed-outline';
    if (d.includes('ticket') || d.includes('movie')) return 'ticket-outline';
    return 'receipt-outline';
  }
}
