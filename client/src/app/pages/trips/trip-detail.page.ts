import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';
import { TripExpensesService } from '../../services/trip-expenses.service';
import { TripMembersService } from '../../services/trip-members.service';
import { TripExpense } from '../../models/trip-expense.model';
import { TripMember } from '../../models/trip-member.model';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { TripMemberBalance } from '../../models/trip-member-balance.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel]
})
export class TripDetailPage implements OnInit {
  tripId = 0;
  trip: Trip | null = null;
  expenses: TripExpense[] = [];
  members: TripMember[] = [];
  balances: TripMemberBalance[] = [];
  myBalance: TripMemberBalance | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tripsService: TripsService,
    private readonly expensesService: TripExpensesService,
    private readonly membersService: TripMembersService,
    private readonly toastCtrl: ToastController
  ) {}

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

  private load(): void {
    this.tripsService.getTrip(this.tripId).subscribe({
      next: (t) => (this.trip = t),
      error: (err) => console.error('Failed to load trip', err)
    });

    this.expensesService.getExpenses(this.tripId).subscribe({
      next: (e) => (this.expenses = e.slice(0, 10)),
      error: (err) => console.error('Failed to load expenses', err)
    });

    this.membersService.getMembers(this.tripId).subscribe({
      next: (m) => (this.members = m),
      error: (err) => console.error('Failed to load members', err)
    });

    // load balances
    this.tripsService.getBalances(this.tripId).subscribe({ next: (b) => {
      this.balances = b;
      const current = b.find(x => x.isCurrentUser);
      this.myBalance = current ?? null;
    }, error: (err) => console.error('Failed to load balances', err) });
  }

  addExpense(): void {
    this.router.navigate([`/tabs/trips/${this.tripId}/expenses/add`]);
  }

  editTrip(): void {
    this.router.navigate([`/tabs/trips/${this.tripId}/edit`]);
  }

  async shareTrip(): Promise<void> {
    const url = `${window.location.origin}/tabs/trips/${this.tripId}`;
    try {
      await navigator.clipboard?.writeText(url);
      const t = await this.toastCtrl.create({ message: 'Trip link copied to clipboard', duration: 1500, position: 'bottom' });
      await t.present();
    } catch {
      const t = await this.toastCtrl.create({ message: 'Unable to copy link', duration: 1500, position: 'bottom' });
      await t.present();
    }
  }
}
