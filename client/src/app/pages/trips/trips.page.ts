import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonBadge,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  airplaneOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  peopleOutline,
  shareOutline,
  searchOutline,
  walletOutline,
  cashOutline,
  swapHorizontalOutline,
  sparklesOutline,
  calendarOutline,
  receiptOutline
} from 'ionicons/icons';

import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';
import { TripInvitesService } from '../../services/trip-invites.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonBadge,
    IonChip,
    IonRefresher,
    IonRefresherContent
  ]
})
export class TripsPage implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  searchQuery = '';
  loading = false;
  totalExpensesCount = 0;
  totalMembersCount = 0;

  constructor(
    private readonly tripsService: TripsService,
    private readonly invitesService: TripInvitesService,
    private readonly router: Router,
    private readonly toastCtrl: ToastController
  ) {
    addIcons({
      addOutline,
      airplaneOutline,
      arrowForwardOutline,
      chevronForwardOutline,
      peopleOutline,
      shareOutline,
      searchOutline,
      walletOutline,
      cashOutline,
      swapHorizontalOutline,
      sparklesOutline,
      calendarOutline,
      receiptOutline
    });
  }

  ngOnInit(): void {
    this.loadTrips();
  }

  ionViewWillEnter(): void {
    this.loadTrips();
  }

  loadTrips(event?: any): void {
    this.loading = true;
    this.tripsService.getTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.applyFilter();
        this.calculateStats();
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Failed to load trips', err);
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredTrips = [...this.trips];
    } else {
      this.filteredTrips = this.trips.filter(
        t => t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }
  }

  private calculateStats(): void {
    this.totalExpensesCount = this.trips.reduce((acc, t) => acc + (t.expenseCount || 0), 0);
    this.totalMembersCount = this.trips.reduce((acc, t) => acc + (t.memberCount || 0), 0);
  }

  createTrip(): void {
    this.router.navigate(['/tabs/trips/create']);
  }

  openTrip(trip: Trip): void {
    this.router.navigate(['/tabs/trips', trip.id]);
  }

  async shareTrip(trip: Trip): Promise<void> {
    try {
      this.invitesService.createInvite(trip.id).subscribe({
        next: async (invite) => {
          const joinUrl = `${window.location.origin}/join/trip/${invite.token}`;
          await navigator.clipboard?.writeText(joinUrl);
          const toast = await this.toastCtrl.create({
            message: `Invite link for "${trip.name}" copied to clipboard!`,
            duration: 2500,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
        },
        error: async () => {
          const joinUrl = `${window.location.origin}/tabs/trips/${trip.id}`;
          await navigator.clipboard?.writeText(joinUrl);
          const toast = await this.toastCtrl.create({
            message: `Trip link copied to clipboard`,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      });
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Unable to copy link',
        duration: 1500,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  getAvatarColor(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
    ];
    return gradients[index % gradients.length];
  }
}